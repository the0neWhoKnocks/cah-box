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
  const enabled = [
    `${ROOT_NAMESPACE}:*`,
  ];
  const disabled = [
    `-${ROOT_NAMESPACE}:*heartbeat*`,
  ];

  logger = (namespace = '') => (namespace)
    ? rootLogger.extend(namespace)
    : rootLogger;

  debug.enable( [ ...enabled, ...disabled ].join(',') );
}

module.exports = logger;
