const config = require('../config');
const url = require('url');

const isDev = process.env.mode === 'dev';

function parseEnvOrigins () {
  if (!process.env.CORS_ORIGINS) {
    return [];
  }
  return process.env.CORS_ORIGINS.split(',').map(function (item) {
    return item.trim();
  }).filter(Boolean);
}

function getConfiguredOrigins () {
  const fromConfig = (config.app && Array.isArray(config.app.corsOrigins))
    ? config.app.corsOrigins
    : [];
  return fromConfig.concat(parseEnvOrigins());
}

function isLocalOrigin (origin) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

const TRUSTED_APEX_HOSTS = [
  'jeetwinaffiliates.com',
  'jeetwinaffiliate.com',
  'jeetwinaff.com',
  'jw-aff.com'
];

function isTrustedHost (hostname) {
  if (!hostname) {
    return false;
  }
  return TRUSTED_APEX_HOSTS.some(function (apex) {
    return hostname === apex || hostname.slice(-(apex.length + 1)) === '.' + apex;
  });
}

function isAllowedOrigin (origin) {
  if (!origin) {
    return true;
  }
  const configured = getConfiguredOrigins();
  if (configured.indexOf(origin) !== -1) {
    return true;
  }
  if (isDev && isLocalOrigin(origin)) {
    return true;
  }
  try {
    const hostname = url.parse(origin).hostname;
    return isTrustedHost(hostname);
  } catch (err) {
    return false;
  }
}

function corsOrigin (origin, callback) {
  if (isAllowedOrigin(origin)) {
    return callback(null, true);
  }
  return callback(null, false);
}

module.exports = {
  isDev: isDev,
  corsOrigin: corsOrigin
};
