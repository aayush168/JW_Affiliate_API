const jwtAuth = require('./jwt');

function unauthorized (res) {
  return res.status(401).json({ code: 'code.auth.unauthorized', msg: 'Not logged in.' });
}

function isPublicPath (reqPath, publicPaths) {
  return publicPaths.indexOf(reqPath) !== -1;
}

function requireAgentAuth (req, res, next) {
  const agent = jwtAuth.readAgentFromRequest(req);
  if (!agent || !agent.id) {
    return unauthorized(res);
  }
  req.agent = agent;
  next();
}

function requireOperatorAuth (req, res, next) {
  const operator = jwtAuth.readOperatorFromRequest(req);
  if (!operator || !operator.id) {
    return unauthorized(res);
  }
  req.operator = operator;
  req.operatorId = operator.id;
  if (req.body && typeof req.body === 'object') {
    req.body.operatorId = operator.id;
  }
  next();
}

function skipPublic (publicPaths, guard) {
  return function (req, res, next) {
    if (isPublicPath(req.path, publicPaths)) {
      return next();
    }
    return guard(req, res, next);
  };
}

function getAgentId (req) {
  if (req.agent && req.agent.id) {
    return req.agent.id;
  }
  return undefined;
}

function getAgentCode (req) {
  if (req.agent && req.agent.code) {
    return req.agent.code;
  }
  return undefined;
}

function getOperatorId (req) {
  if (req.operatorId) {
    return req.operatorId;
  }
  if (req.operator && req.operator.id) {
    return req.operator.id;
  }
  return undefined;
}

module.exports = {
  requireAgentAuth: requireAgentAuth,
  requireOperatorAuth: requireOperatorAuth,
  skipPublic: skipPublic,
  getAgentId: getAgentId,
  getAgentCode: getAgentCode,
  getOperatorId: getOperatorId,
  signAgentToken: jwtAuth.signAgentToken,
  signOperatorToken: jwtAuth.signOperatorToken,
  readAgentFromRequest: jwtAuth.readAgentFromRequest,
  readOperatorFromRequest: jwtAuth.readOperatorFromRequest,
  AGENT_PUBLIC_PATHS: [
    '/auth/register',
    '/auth/login',
    '/auth/forgotPassword',
    '/auth/reset-password/verify',
    '/auth/reset-password',
    '/checklogin',
    '/logout',
    '/setting/getList'
  ],
  OPERATOR_PUBLIC_PATHS: [
    '/auth/login',
    '/checkLogin',
    '/logout'
  ]
};
