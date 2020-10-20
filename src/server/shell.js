const {
  APP__TITLE,
  DOM__SVELTE_MOUNT_POINT,
} = require('../constants');

const shell = ({ page, params } = {}) => {
  const MANIFEST_PATH = '../public/manifest.json';
  if (process.env.NODE_ENV !== 'production') delete require.cache[require.resolve(MANIFEST_PATH)];
  const manifest = require(MANIFEST_PATH);
  const buildNumber = process.env.SOURCE_VERSION; // exposed by Heroku during build
  const pageCSS = (manifest[`${page}.css`])
    ? `<link rel="stylesheet" href="${manifest[`${page}.css`]}">`
    : '';

  return `
    <!doctype html>
    <html lang="en">
    <head>
      <title>${APP__TITLE}</title>

      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1.0">
      
      <link rel="apple-touch-icon" sizes="180x180" href="/imgs/icons/apple-touch-icon.png">
      <link rel="icon" type="image/png" sizes="32x32" href="/imgs/icons/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="/imgs/icons/favicon-16x16.png">
      <link rel="manifest" href="/imgs/icons/site.webmanifest">
      <link rel="mask-icon" href="/imgs/icons/safari-pinned-tab.svg" color="#000000">
      <link rel="shortcut icon" href="/imgs/icons/favicon.ico">
      <meta name="msapplication-TileColor" content="#da532c">
      <meta name="msapplication-config" content="/imgs/icons/browserconfig.xml">
      <meta name="theme-color" content="#000000">

      <link rel="stylesheet" href="${manifest['global.css']}">
      ${pageCSS}

      <script>
        window.app = {
          buildNumber: ${buildNumber},
          params: ${JSON.stringify(params || {})},
        };

        // The request won't be made on all Browsers unless it's made before
        // \`DOMContentLoaded\` is fired.
        window.Notification.requestPermission();
      </script>
    </head>
    <body class="no-js">
      <script>
        document.body.classList.remove('no-js');
      </script>
      <svg style="display:none; position:absolute" width="0" height="0">
        <symbol id="ui-icon__crown" viewBox="0 -61 512 512" xmlns="http://www.w3.org/2000/svg">
          <path d="M91 300v90h330v-90zm0 0" fill="#ff9f00" />
          <path d="M256 300h165v90H256zm0 0" fill="#ff7816" />
          <path
            d="M422.5 169.2l-24.3 47.398H113.8l-24.3-47.399C125.2 119.7 187.3 90 256 90s130.8 29.7 166.5 79.2zm0 0"
            fill="#ff4b00"
          />
          <path d="M422.5 169.2l-24.3 47.398H256V90c68.7 0 130.8 29.7 166.5 79.2zm0 0" fill="#cc1e0d" />
          <path
            d="M477.102 139.2L421 330H91L34.898 139.2 72.7 124.8c17.102 32.7 49.801 51.9 76.5 55.2h15.602c34.5-5.398 60.297-58.2 70.8-108.602h40.801c10.5 50.403 36.301 103.204 70.797 108.602h15.602c26.699-3.3 59.398-22.5 76.5-55.2zm0 0"
            fill="#fdbf00"
          />
          <path
            d="M477.102 139.2L421 330H256V71.398h20.398C286.902 121.801 312.7 174.602 347.2 180h15.602c26.699-3.3 59.398-22.5 76.5-55.2zm0 0M46 150c-24.813 0-46-20.188-46-45s21.188-45 46-45 45 20.188 45 45-20.188 45-45 45zm0 0"
            fill="#ff9f00"
          />
          <path d="M466 150c-24.813 0-45-20.188-45-45s20.188-45 45-45 46 20.188 46 45-21.188 45-46 45zm0 0" fill="#ff7816" />
          <path
            d="M256 0c-24.902 0-45 20.098-45 45 0 24.898 20.098 45 45 45s45-20.102 45-45c0-24.902-20.098-45-45-45zm0 0"
            fill="#ff9f00"
          />
          <path d="M256 173.7L204.7 225l51.3 51.3 51.3-51.3zm0 0" fill="#ff4b00" />
          <path d="M346 233.785l21.21 21.211L346 276.207l-21.21-21.21zm0 0" fill="#cc1e0d" />
          <path d="M166 233.785l21.21 21.211L166 276.207l-21.21-21.21zm0 0" fill="#ff4b00" />
          <path d="M256 90V0c24.902 0 45 20.098 45 45 0 24.898-20.098 45-45 45zm0 0" fill="#ff7816" />
          <path d="M307.3 225L256 276.3V173.7zm0 0" fill="#cc1e0d" />
        </symbol>
        <symbol id="ui-icon__star" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512.002 512.002">
          <path
            d="M511.267 197.258a14.995 14.995 0 00-12.107-10.209l-158.723-23.065-70.985-143.827a14.998 14.998 0 00-26.901 0l-70.988 143.827-158.72 23.065a14.998 14.998 0 00-8.312 25.585l114.848 111.954-27.108 158.083a14.999 14.999 0 0021.763 15.812l141.967-74.638 141.961 74.637a15 15 0 0021.766-15.813l-27.117-158.081 114.861-111.955a14.994 14.994 0 003.795-15.375z"
          />
        </symbol>
        <symbol id="ui-icon__menu" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1792 1792">
          <path d="M1664 1344v128q0 26-19 45t-45 19H192q-26 0-45-19t-19-45v-128q0-26 19-45t45-19h1408q26 0 45 19t19 45zm0-512v128q0 26-19 45t-45 19H192q-26 0-45-19t-19-45V832q0-26 19-45t45-19h1408q26 0 45 19t19 45zm0-512v128q0 26-19 45t-45 19H192q-26 0-45-19t-19-45V320q0-26 19-45t45-19h1408q26 0 45 19t19 45z"></path>
        </symbol>
        <symbol id="ui-icon__clipboard" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512.001 512.001">
          <path
            d="M112 64.001h288c17.672 0 32 14.328 32 32v384c0 17.672-14.328 32-32 32H112c-17.672 0-32-14.328-32-32v-384c0-17.672 14.328-32 32-32z"
            fill="#bd6428" />
          <path d="M120 480.001c-4.416 0-8-3.584-8-8v-368c0-4.416 3.584-8 8-8h272c4.416 0 8 3.584 8 8v288l-88 88H120z"
            fill="#f5f6f6" />
          <path d="M176 96.001h-16v-16c0-8.84 7.16-16 16-16v32z" fill="#a35623" />
          <path d="M400 392.001h-80c-4.416 0-8 3.584-8 8v80l88-88z" fill="#cecece" />
          <path d="M88 88.001c4.416 0 8 3.584 8 8v264c0 4.416-3.584 8-8 8s-8-3.584-8-8v-264c0-4.416 3.584-8 8-8z"
            fill="#d17f4d" />
          <g fill="#e9e9e9">
            <path
              d="M304 408.001v16c0 4.416-3.584 8-8 8s-8 3.584-8 8-3.584 8-8 8h-8c-4.416 0-8 3.584-8 8s-3.584 8-8 8H112v8c0 4.416 3.584 8 8 8h192v-80c-4.416 0-8 3.584-8 8zM392 96.001H160c.128 2.4.128 4.8 0 7.2-.44 8.824 6.352 16.336 15.176 16.776.28.016.552.024.824.024h192c8.84 0 16 7.16 16 16v24c0 8.84 7.16 16 16 16v-72c0-4.416-3.584-8-8-8z" />
          </g>
          <path
            d="M308.72 45.121a24.714 24.714 0 01-14.32-16c-6.184-21.208-28.392-33.384-49.6-27.2a39.983 39.983 0 00-27.2 27.2 24.714 24.714 0 01-14.32 16l-17.2 6.88a15.998 15.998 0 00-10.08 14.8v29.2c0 8.84 7.16 16 16 16h128c8.84 0 16-7.16 16-16v-29.2a15.998 15.998 0 00-10.08-14.8l-17.2-6.88zM256 56.001c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16z"
            fill="#9ba7af" />
          <path
            d="M312 64.001c-4.416 0-8 3.584-8 8s-3.584 8-8 8h-16c-4.416 0-8 3.584-8 8s-3.584 8-8 8h-88c0 8.84 7.16 16 16 16h128c8.84 0 16-7.16 16-16v-32h-24z"
            fill="#72818b" />
          <path
            d="M225.04 40.001c-4.416.144-8.112-3.328-8.248-7.744a8.24 8.24 0 01.248-2.256c4.584-17.744 20.632-30.104 38.96-30 4.416 0 8 3.584 8 8s-3.584 8-8 8c-10.96-.016-20.544 7.392-23.28 18a7.996 7.996 0 01-7.68 6z"
            fill="#afbabf" />
          <path
            d="M400 80.001h-32c-8.84 0-16-7.16-16-16h-16v32h56c4.416 0 8 3.584 8 8v288l-88 88H120c0 8.84 7.16 16 16 16h194.72a31.998 31.998 0 0022.64-9.36l53.28-53.28a31.998 31.998 0 009.36-22.64V96.001c0-8.832-7.16-16-16-16z"
            fill="#a35623" />
          <circle cx="256" cy="264.001" r="104" fill="#3cb54a" />
          <path
            d="M296 248.001h-24v-24c0-8.84-7.16-16-16-16s-16 7.16-16 16v24h-24c-8.84 0-16 7.16-16 16s7.16 16 16 16h24v24c0 8.84 7.16 16 16 16s16-7.16 16-16v-24h24c8.84 0 16-7.16 16-16 0-8.832-7.16-16-16-16z"
            fill="#fff" />
          <g fill="#0e9347">
            <path
              d="M240 280.001h-24a16.017 16.017 0 01-6.56-1.44 15.998 15.998 0 0014.56 9.44h16v-8zM272 224.001v24h8v-16a15.998 15.998 0 00-9.44-14.56 16.017 16.017 0 011.44 6.56zM312 264.001c0 8.84-7.16 16-16 16h-24v24c-.016 8.84-7.2 15.984-16.032 15.968a16.125 16.125 0 01-6.528-1.408c3.664 8.04 13.152 11.592 21.192 7.928A16.018 16.018 0 00280 312.001v-24h24c8.84-.04 15.968-7.24 15.928-16.072a16.018 16.018 0 00-9.368-14.488 16.017 16.017 0 011.44 6.56z" />
          </g>
          <g fill="#dddfe1">
            <path
              d="M240 280.001c0-4.416-3.584-8-8-8h-24a16.017 16.017 0 01-6.56-1.44 15.998 15.998 0 0014.56 9.44h24zM272 248.001c-4.416 0-8-3.584-8-8v-24a16.017 16.017 0 00-1.44-6.56 15.998 15.998 0 019.44 14.56v24zM302.56 249.441a15.96 15.96 0 011.44 9.52 16.878 16.878 0 01-17.12 13.04H272c-4.416 0-8 3.584-8 8v14.88a16.878 16.878 0 01-13.04 17.12 16.011 16.011 0 01-9.52-1.12 16.006 16.006 0 0017.92 9.12 16.486 16.486 0 0012.64-16v-24h23.28a16.486 16.486 0 0016-12.64 16 16 0 00-8.72-17.92z" />
          </g>
          <path
            d="M344 248.001c-8.84 0-16 7.16-16 16 0 39.768-32.232 72-72 72-8.84 0-16 7.16-16 16s7.16 16 16 16c57.44 0 104-46.56 104-104 0-8.832-7.16-16-16-16z"
            fill="#0e9347" />
          <path
            d="M168 280.001c8.84 0 16-7.16 16-16 0-39.768 32.232-72 72-72 8.84 0 16-7.16 16-16s-7.16-16-16-16c-57.44 0-104 46.56-104 104 0 8.84 7.16 16 16 16z"
            fill="#89c763" />
        </symbol>
      </svg>
      
      <div class="root">
        <div class="loading-msg">
          <span class="msg">Loading...</span>
          <noscript>
            This App requires Javascript. You'll have to enable it if you want to play.
          </noscript>
        </div>
        <div id="${DOM__SVELTE_MOUNT_POINT}"></div>
        <div id="portal"></div>
      </div>
      
      <script src="${manifest['vendor.js']}"></script>
      <script src="${manifest[`${page}.js`]}"></script>
    </body>
    </html>
  `;
};
module.exports = shell;
