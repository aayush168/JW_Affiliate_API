const crypto = require('crypto');
// jsonwebtoken@9 uses crypto.KeyObject (Node 12+). This API runs on Node 8.
const jwt = require('jsonwebtoken');
const config = require('../config');

const JWT_SECRET = process.env.JWT_SECRET
  || (config.app && config.app.jwtSecret)
  || '7kQ2pL8vR1nW4xH6cY9tB3mF0sA5dE8u';
const JWT_EXPIRES_IN = (config.app && config.app.jwtExpiresIn) || '12h';
const JWT_ALGORITHMS = ['HS256'];

function getBearerToken (req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== 'string') {
    return null;
  }
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return null;
  }
  return parts[1];
}

function signToken (claims) {
  return jwt.sign(
    claims,
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      jwtid: crypto.randomBytes(16).toString('hex'),
      algorithm: 'HS256'
    }
  );
}

function verifyTypedToken (token, typ) {
  const payload = jwt.verify(token, JWT_SECRET, { algorithms: JWT_ALGORITHMS });
  if (!payload || payload.typ !== typ || !payload.sub) {
    throw new Error('Invalid token');
  }
  const id = parseInt(payload.sub, 10);
  if (!id) {
    throw new Error('Invalid token');
  }
  return {
    id: id,
    username: payload.username,
    code: payload.code
  };
}

function readTypedFromRequest (req, typ) {
  const token = getBearerToken(req);
  if (!token) {
    return null;
  }
  try {
    return verifyTypedToken(token, typ);
  } catch (err) {
    return null;
  }
}

function signAgentToken (user) {
  return signToken({
    sub: String(user.id),
    code: user.code,
    typ: 'agent'
  });
}

function signOperatorToken (user) {
  return signToken({
    sub: String(user.id),
    username: user.username,
    typ: 'operator'
  });
}

function verifyAgentToken (token) {
  return verifyTypedToken(token, 'agent');
}

function verifyOperatorToken (token) {
  return verifyTypedToken(token, 'operator');
}

function readAgentFromRequest (req) {
  return readTypedFromRequest(req, 'agent');
}

function readOperatorFromRequest (req) {
  return readTypedFromRequest(req, 'operator');
}

module.exports = {
  getBearerToken: getBearerToken,
  signAgentToken: signAgentToken,
  signOperatorToken: signOperatorToken,
  verifyAgentToken: verifyAgentToken,
  verifyOperatorToken: verifyOperatorToken,
  readAgentFromRequest: readAgentFromRequest,
  readOperatorFromRequest: readOperatorFromRequest
};
