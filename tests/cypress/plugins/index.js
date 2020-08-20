// You can read more here:
// https://on.cypress.io/plugins-guide

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// `on` is used to hook into various events Cypress emits
// `config` is the resolved Cypress config
module.exports = (on, config) => {
  return {
    baseUrl: `http://${process.env.DOCKER_HOST || 'localhost'}:3000`,
    // NOTE - The below doesn't work while in Docker (or perhaps just headless?)
    // browsers: config.browsers.filter(({ channel, name }) => {
    //   return channel === 'stable' && name === 'chrome';
    // }),
  };
}
