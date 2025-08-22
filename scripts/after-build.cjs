const { cpSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const dist = resolve(__dirname, '..', 'dist');

try {
  cpSync(resolve(dist, 'index.html'), resolve(dist, '404.html'));
  console.log('Created dist/404.html');
} catch (e) {
  console.warn('postbuild: could not copy index.html to 404.html:', e.message);
}

try {
  writeFileSync(resolve(dist, '.nojekyll'), '');
  console.log('Created dist/.nojekyll');
} catch (e) {
  console.warn('postbuild: could not create dist/.nojekyll:', e.message);
}

