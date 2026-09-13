// Render may start `node index.js` directly. Enable the system CA store before
// loading the MongoDB driver so Atlas TLS works on hosted Node runtimes too.
process.env.NODE_USE_SYSTEM_CA = process.env.NODE_USE_SYSTEM_CA || '1';
require('./server');
