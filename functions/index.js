const functions = require("firebase-functions");
const webhookHandler =
  require("./definitions/webhookHandler");

exports.webhookHandler = webhookHandler.webhookHandler;