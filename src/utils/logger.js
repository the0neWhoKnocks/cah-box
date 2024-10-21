const { NAMESPACE__LOGGER } = require('../constants');
const ulog = require('ulog');
// NOTE: Overriding the log_format because of: https://github.com/Download/ulog/issues/68
ulog.config.log_format = 'lvl noPadName message';
if (process.env.FOR_CLIENT_BUNDLE) {
  ulog.config.log = 'info';
  window.localStorage.log = ulog.config.log;
  window.localStorage.log_format = ulog.config.log_format;
}
// else {
//   process.env.DEBUG = `info,${NAMESPACE__LOGGER}:*,-${NAMESPACE__LOGGER}:*heartbeat*`;
// }
ulog.use({
  use: [ require('ulog/mods/formats') ],
  formats: {
    noPadName: () => {
      const fmt = (rec) => rec.name;
      fmt.color = 'logger';
      return fmt;
    },
  },
});

const aL = require('anylogger');
const rootLogger = aL(NAMESPACE__LOGGER);

const logger = (namespace = '') => (namespace)
  ? aL(`${NAMESPACE__LOGGER}:${namespace}`)
  : rootLogger;

module.exports = logger;
