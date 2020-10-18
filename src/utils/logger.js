let logger;

if (
  process.env.NODE_ENV === 'production'
  && process.env.WP_BUNDLE
) {
  logger = () => () => {};
}
else {
  const debug = require('debug');
  const ROOT_NAMESPACE = 'cahbox';
  const rootLogger = debug(ROOT_NAMESPACE);
  logger = (namespace = '') => (namespace)
    ? rootLogger.extend(namespace)
    : rootLogger;
  
  debug.enable(`${ROOT_NAMESPACE}:*`);
}

module.exports = logger;
