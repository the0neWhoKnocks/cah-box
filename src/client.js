import * as sapper from '@sapper/app';

window.app = {
  version: process.app.version,
};

sapper.start({
	target: document.querySelector('#sapper')
});