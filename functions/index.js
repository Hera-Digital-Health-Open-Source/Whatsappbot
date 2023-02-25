const functions = require("firebase-functions");
const webhookHandler =
  require("./definitions/webhookHandler");
const apiHandler =
  require("./definitions/apiHandler");

exports.webhookHandler = webhookHandler.webhookHandler;
exports.facilities = apiHandler.getFacilities;