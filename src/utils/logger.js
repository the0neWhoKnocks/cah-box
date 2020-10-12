const debug = require('debug');

const ROOT_NAMESPACE = 'cahbox';
const rootLogger = debug(ROOT_NAMESPACE);
const logger = (namespace = '') => (namespace)
  ? rootLogger.extend(namespace)
  : rootLogger;

debug.enable(`${ROOT_NAMESPACE}:*`);

module.exports = logger;
