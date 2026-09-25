// Passenger startup file for O2Switch (cPanel > Setup Node.js App > "Application startup file").
//
// Passenger loads the startup file with require(), but this server is native ESM
// ("type": "module" in package.json). This CommonJS shim bridges the two with a dynamic
// import() and contains no application logic. `src/index.js` then calls http.Server#listen(),
// which Passenger intercepts and binds to its own socket - so no PORT is configured.
//
// If your Passenger version can start src/index.js directly, this file is unnecessary.
import('./src/index.js').catch((err) => {
  console.error('Failed to start the Astera API:', err)
  process.exit(1)
})
