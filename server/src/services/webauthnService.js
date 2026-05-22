import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from '@simplewebauthn/server';
import { env } from '../config/env.js';
import { base64urlToBuffer, bufferToBase64url } from '../utils/encoding.js';

export async function makeRegistrationOptions(user, credentials) {
  return generateRegistrationOptions({
    rpName: env.webauthn.rpName,
    rpID: env.webauthn.rpID,
    userID: Buffer.from(user.id),
    userName: user.username,
    userDisplayName: user.name || user.username,
    attestationType: 'none',
    excludeCredentials: credentials.map((credential) => ({
      id: credential.credentialId,
      transports: credential.transports
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'required'
    }
  });
}

export async function verifyRegistration(registration, expectedChallenge) {
  return verifyRegistrationResponse({
    response: registration,
    expectedChallenge,
    expectedOrigin: env.webauthn.origin,
    expectedRPID: env.webauthn.rpID,
    requireUserVerification: true
  });
}

export async function makeAuthenticationOptions(credentials) {
  return generateAuthenticationOptions({
    rpID: env.webauthn.rpID,
    userVerification: 'required',
    allowCredentials: credentials.map((credential) => ({
      id: credential.credentialId,
      transports: credential.transports
    }))
  });
}

export async function verifyAuthentication(authentication, credential, expectedChallenge) {
  return verifyAuthenticationResponse({
    response: authentication,
    expectedChallenge,
    expectedOrigin: env.webauthn.origin,
    expectedRPID: env.webauthn.rpID,
    credential: {
      id: credential.credentialId,
      publicKey: new Uint8Array(credential.publicKey),
      counter: Number(credential.counter),
      transports: credential.transports
    },
    requireUserVerification: true
  });
}

export function credentialPublicKeyToBytes(publicKey) {
  return Buffer.from(publicKey);
}
