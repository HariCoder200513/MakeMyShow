export function base64urlToBuffer(value) {
  return Buffer.from(value, 'base64url');
}

export function bufferToBase64url(value) {
  return Buffer.from(value).toString('base64url');
}
