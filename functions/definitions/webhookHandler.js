const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const { sendWhatsappTextMessage, sendWhatsappButtonMessage, sendWhatsappTextListMessage } = require('./sendWhatsappMessage')

const runtimeEnvironment = defineString("ENVIRONMENT")

if (!admin.apps.length) {
    admin.initializeApp();
}
const app = express();

// Accepts POST requests at /webhook endpoint
app.post("/whatsapp", async (req, res) => {
    if (req.body.object) {
        if (
            req.body.entry &&
            req.body.entry[0].changes &&
            req.body.entry[0].changes[0] &&
            req.body.entry[0].changes[0].value.messages &&
            req.body.entry[0].changes[0].value.messages[0]
        ) {
            let value = req.body.entry[0].changes[0].value
            let phoneNumberId = value.metadata.phone_number_id;
            let message = value.messages[0];
            let from = message.from; // extract the phone number from the webhook payload
            let type = message.type;

            let systemPhoneNumberId

            if (runtimeEnvironment.value() === "PROD") {
                systemPhoneNumberId = process.env.WHATSAPP_CHECKERS_BOT_PHONE_NUMBER_ID;
            } else {
                systemPhoneNumberId = process.env.WHATSAPP_CHECKERS_BOT_PHONE_NUMBER_ID;
            }

            if (
                phoneNumberId === systemPhoneNumberId
            ) {

                res.sendStatus(200);
            } else {
                res.sendStatus(403)
            }
        }
        else {
            res.sendStatus(200); //unexpected message type, could be status update
        }
    } else {
        // Return a '404 Not Found' if event is not from a WhatsApp API
        res.sendStatus(404);
    }
});

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests 
app.get("/whatsapp", (req, res) => {
    /**
       * UPDATE YOUR VERIFY TOKEN
       *This will be the Verify Token value when you set up webhook
      **/
    const verifyToken = process.env.VERIFY_TOKEN;
    // Parse params from the webhook verification request
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {
        // Check the mode and token sent are correct
        if (mode === "subscribe" && token === verifyToken) {
            // Respond with 200 OK and challenge token from the request
            functions.logger.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

exports.webhookHandler = functions
    .region('asia-southeast1')
    .runWith({ secrets: ["WHATSAPP_USER_BOT_PHONE_NUMBER_ID", "WHATSAPP_CHECKERS_BOT_PHONE_NUMBER_ID", "WHATSAPP_TOKEN", "VERIFY_TOKEN"] })
    .https.onRequest(app);

