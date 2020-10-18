// You can read more here:
// https://on.cypress.io/plugins-guide

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// `on` is used to hook into various events Cypress emits
// `config` is the resolved Cypress config
module.exports = (on, config) => {
  return {
    baseUrl: `http://${process.env.DOCKER_HOST || 'localhost'}:3000`,
    // NOTE - In headless mode, the `electron` Browser always has to be present
    // or the tests won't run.
    // I move Electron to the top of the Browsers list since it seems to be
    // the most reliable on all OS's (as far as display).
    browsers: config.browsers.sort(({ name }) => name === 'electron' ? -1 : 0),
  };
}
