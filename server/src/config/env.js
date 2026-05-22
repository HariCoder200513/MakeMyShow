import 'dotenv/config';

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`${name} is required`);
  return value;
}

const isProduction = process.env.NODE_ENV === 'production';

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: required('JWT_SECRET'),
  clientOrigin: required('CLIENT_ORIGIN', isProduction ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : 'http://localhost:5173').replace(/\/+$/, ''),
  redisUrl: required('REDIS_URL', 'redis://localhost:6379'),
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  webauthn: {
    rpName: required('WEBAUTHN_RP_NAME', 'MakeMyShow'),
    rpID: required('WEBAUTHN_RP_ID', isProduction ? process.env.RENDER_EXTERNAL_HOSTNAME : 'localhost'),
    origin: required('WEBAUTHN_ORIGIN', isProduction ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : 'http://localhost:5173').replace(/\/+$/, '')
  }
};
