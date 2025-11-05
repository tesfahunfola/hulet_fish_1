# TODO: Upgrade Mongoose to Latest Version (8.5.0)

## Steps to Complete

- [x] Update mongoose version in package.json from ^5.5.2 to ^8.5.0
- [x] Run npm install in the Hulet Fish directory to update package-lock.json and install the new version
- [x] Check for breaking changes in Mongoose 6, 7, 8 by reviewing models and controllers (search for deprecated methods like .remove(), .update(), etc.)
- [x] Update deprecated connection options (useNewUrlParser, useCreateIndex, useFindAndModify, useUnifiedTopology) in server.js, import-dev-data.js, migrate-verify-legacy-users.js, and fixTxRefIndex.js
- [ ] Test the application locally or in Docker to ensure compatibility
