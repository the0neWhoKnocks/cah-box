// You can read more here:
// https://on.cypress.io/plugins-guide

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  return {
    browsers: config.browsers.filter(({ channel, name }) => {
      return channel === 'stable' && name === 'chrome';
    }),
  };
}
