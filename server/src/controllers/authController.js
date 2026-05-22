import { z } from 'zod';
import { prisma } from '../config/db.js';
import { signToken } from '../middleware/auth.js';
import {
  credentialPublicKeyToBytes,
  makeAuthenticationOptions,
  makeRegistrationOptions,
  verifyAuthentication,
  verifyRegistration
} from '../services/webauthnService.js';

const challengeTtlMs = 1000 * 60 * 5;
const reservedUsernames = new Set(['admin', 'system', 'root', 'support', 'security', 'api']);

export const registerOptionsSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    username: z.string().trim().min(3).max(32),
    email: z.string().trim().email(),
    role: z.enum(['USER', 'OWNER']).default('USER')
  })
});

export const registerVerifySchema = z.object({
  body: z.object({
    username: z.string().trim().min(3).max(32),
    registration: z.any()
  })
});

export const loginOptionsSchema = z.object({
  body: z.object({
    username: z.string().trim().min(3).max(32)
  })
});

export const loginVerifySchema = z.object({
  body: z.object({
    username: z.string().trim().min(3).max(32),
    authentication: z.any()
  })
});

function normalizeUsername(value) {
  return String(value || '').trim().toLowerCase();
}

function validateUsername(value, { allowReservedExisting = false } = {}) {
  const username = normalizeUsername(value);

  if (!username || username.length < 3 || username.length > 32) {
    return { username, error: 'Username must be 3-32 characters' };
  }

  if (!/^[a-z0-9_-]+$/.test(username)) {
    return { username, error: 'Use lowercase letters, numbers, underscore, or hyphen only' };
  }

  if (!allowReservedExisting && reservedUsernames.has(username)) {
    return { username, error: 'This username is reserved' };
  }

  return { username };
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

async function storeChallenge(kind, challenge, data) {
  const selectors = [data.userId ? { userId: data.userId } : null, data.username ? { username: data.username } : null].filter(Boolean);

  await prisma.challenge.deleteMany({ where: { kind, OR: selectors } });
  await prisma.challenge.create({
    data: {
      kind,
      challenge,
      userId: data.userId,
      username: data.username,
      expiresAt: new Date(Date.now() + challengeTtlMs)
    }
  });
}

async function consumeChallenge(kind, data) {
  const selectors = [data.userId ? { userId: data.userId } : null, data.username ? { username: data.username } : null].filter(Boolean);
  const challenge = await prisma.challenge.findFirst({
    where: { kind, expiresAt: { gt: new Date() }, OR: selectors },
    orderBy: { createdAt: 'desc' }
  });

  if (!challenge) {
    const error = new Error('Challenge expired or missing');
    error.status = 400;
    throw error;
  }

  await prisma.challenge.delete({ where: { id: challenge.id } });
  return challenge.challenge;
}

export async function registrationOptions(req, res) {
  const validation = validateUsername(req.validated.body.username);
  if (validation.error) return res.status(400).json({ error: validation.error });

  const email = req.validated.body.email.trim().toLowerCase();
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail && existingEmail.username !== validation.username) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  let user = await prisma.user.findUnique({ 
    where: { username: validation.username },
    include: { credentials: true }
  });
  let credentials = [];
  if (user) {
    credentials = user.credentials;
    if (credentials.length > 0) {
      return res.status(409).json({ error: 'This account already has a passkey. Sign in with that username.' });
    }
  } else {
    user = await prisma.user.create({
      data: {
        name: req.validated.body.name.trim(),
        username: validation.username,
        email,
        role: req.validated.body.role
      }
    });
  }

  const options = await makeRegistrationOptions(user, credentials);
  await storeChallenge('registration', options.challenge, { userId: user.id, username: user.username });
  return res.json(options);
}

export async function verifyRegistrationResponse(req, res) {
  const validation = validateUsername(req.validated.body.username, { allowReservedExisting: true });
  if (validation.error) return res.status(400).json({ error: validation.error });

  const user = await prisma.user.findUnique({ where: { username: validation.username } });
  if (!user) return res.status(404).json({ error: 'Registration was not started' });

  const expectedChallenge = await consumeChallenge('registration', { userId: user.id, username: user.username });
  const verification = await verifyRegistration(req.validated.body.registration, expectedChallenge);

  if (!verification.verified || !verification.registrationInfo) {
    return res.status(400).json({ error: 'Passkey registration failed' });
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
  await prisma.credential.create({
    data: {
      userId: user.id,
      name: 'Phone passkey',
      credentialId: credential.id,
      publicKey: credentialPublicKeyToBytes(credential.publicKey),
      counter: BigInt(credential.counter),
      transports: req.validated.body.registration.response.transports || [],
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp
    }
  });

  const freshUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  const token = signToken(freshUser);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  return res.json({ user: publicUser(freshUser), registered: true });
}

export async function loginOptions(req, res) {
  const validation = validateUsername(req.validated.body.username, { allowReservedExisting: true });
  if (validation.error) return res.status(400).json({ error: validation.error });

  const user = await prisma.user.findUnique({
    where: { username: validation.username },
    include: { credentials: true }
  });

  if (!user || user.credentials.length === 0) {
    return res.status(404).json({ error: 'No passkey is registered for this user' });
  }

  const options = await makeAuthenticationOptions(user.credentials);
  await storeChallenge('authentication', options.challenge, { userId: user.id, username: user.username });
  return res.json(options);
}

export async function verifyLoginResponse(req, res) {
  const validation = validateUsername(req.validated.body.username, { allowReservedExisting: true });
  if (validation.error) return res.status(400).json({ error: validation.error });

  const user = await prisma.user.findUnique({
    where: { username: validation.username },
    include: { credentials: true }
  });

  if (!user) return res.status(403).json({ error: 'Account is unavailable' });

  const credential = user.credentials.find((item) => item.credentialId === req.validated.body.authentication.id);
  if (!credential) return res.status(400).json({ error: 'Credential is not registered to this account' });

  const expectedChallenge = await consumeChallenge('authentication', { userId: user.id, username: user.username });
  const verification = await verifyAuthentication(req.validated.body.authentication, credential, expectedChallenge);
  if (!verification.verified) return res.status(400).json({ error: 'Passkey authentication failed' });

  await prisma.credential.update({
    where: { id: credential.id },
    data: {
      counter: BigInt(verification.authenticationInfo.newCounter),
      lastUsedAt: new Date(),
      lastUsedIp: req.ip || req.socket.remoteAddress || null
    }
  });

  const token = signToken(user);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  return res.json({ user: publicUser(user) });
}

export function logout(req, res) {
  res.clearCookie('token');
  res.json({ ok: true });
}
