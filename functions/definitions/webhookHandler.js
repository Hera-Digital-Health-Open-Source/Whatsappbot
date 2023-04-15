const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const { MESSAGES, SELECTIONS } = require("./constants")
const { defineString } = require('firebase-functions/params');
const { sendWhatsappTextMessage, sendWhatsappButtonMessage } = require('./sendWhatsappMessage')
const { QUESTIONS, getFieldByIndex, getNextField, getPreviousField, getFieldIndex } = require('./messageCombos')
const { getDateFromDDMMYYYY } = require('./utils')
const { Timestamp } = require('firebase-admin/firestore');

const runtimeEnvironment = defineString("ENVIRONMENT")

if (!admin.apps.length) {
  admin.initializeApp();
}
const app = express();

// Accepts POST requests at /webhook endpoint
app.post("/whatsapp", async (req, res) => {
  if (req.body) {
    if (
      req.body.messages
    ) {
      let message = req.body.messages[0];
      let from = message.from; // extract the phone number from the webhook payload
      let type = message.type;

      const db = admin.firestore();

      const querySnap = await db.collection("facilities").where("inEdit", "==", true).where("user", "==", `${from}`).get();

      if (querySnap.empty) {
        await welcome(from);
      } else {
        const docSnap = querySnap.docs[0];
        switch (type) {
          case "text":
            await updateField(from, message.text.body, docSnap);
            break;
          case "interactive":
            await onButton(from, message.interactive.button_reply.id, docSnap);
            break;
          case "location":
            await updateField(from, message.location, docSnap);
        }
      }
      res.sendStatus(200);
    }
    else {
      res.sendStatus(200); //unexpected message type, could be status update
    }
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
});

async function welcome(to) {
  const db = admin.firestore();
  await db.collection("facilities").add({
    organisation: "",
    type: "",
    latitude: "",
    longitude: "",
    expiry: "",
    updateField: "organisation",
    inEdit: true,
    user: `${to}`
  });
  await sendWhatsappTextMessage(to, MESSAGES.WELCOME_MSG)
}

async function updateField(to, textOrLoc, docSnap) {
  const updateField = docSnap.get("updateField");
  let updateValue;
  let nextField;
  let hasError = false;
  let isLocation = false;
  if (updateField !== getFieldByIndex(Object.keys(QUESTIONS).length)) {
    nextField = getNextField(updateField);
  }
  switch (updateField) {
    case "type":
      if (!isNaN(textOrLoc) && parseInt(textOrLoc) >= 1 && parseInt(textOrLoc) <= SELECTIONS.length) {
        updateValue = SELECTIONS[parseInt(textOrLoc) - 1];
      } else {
        hasError = true;
      }
      break;
    case "expiry":
      const date = getDateFromDDMMYYYY(textOrLoc);
      if (date) {
        updateValue = Timestamp.fromDate(date);
      } else {
        hasError = true;
      }
      break;
    case "location":
      isLocation = true;
      if (typeof (textOrLoc) !== 'object') {
        hasError = true;
      }
      break;
    default:
      updateValue = textOrLoc.toUpperCase();
      break;
  }
  if (hasError) {
    await sendWhatsappTextMessage(to, MESSAGES.ERROR_MSG);
    return;
  }

  if (isLocation) {
    await docSnap.ref.update({
      latitude: textOrLoc?.latitude,
      longitude: textOrLoc?.longitude,
      updateField: nextField,
    });
    await sendWhatsappTextMessage(to, MESSAGES.EXPIRY_MSG)
  } else {
    await docSnap.ref.update({
      [updateField]: updateValue,
      updateField: nextField,
    });
    const buttons = [{
      type: "reply",
      reply: {
        id: `Yes`,
        title: "Yes / Evet / نعم",
      },
    }, {
      type: "reply",
      reply: {
        id: `Back`,
        title: "Back / Geri / رجوع",
      }
    }];
    await sendWhatsappButtonMessage(to, `Confirm ${updateField}: ${updateField === "expiry" ? updateValue.toDate().toDateString() : updateValue}`, buttons)
  }
};

async function onButton(to, buttonId, docSnap) {
  let updateField = docSnap.get("updateField");
  if (buttonId === "Back") {
    const previousField = getPreviousField(updateField);
    await docSnap.ref.update({
      updateField: previousField,
    })
    updateField = previousField;
  }
  if (updateField) {
    const nextFunc = QUESTIONS[`${updateField}`].func;
    await nextFunc(to);
  }
  if (getFieldIndex(updateField) === Object.keys(QUESTIONS).length) {
    await docSnap.ref.update({
      inEdit: false,
    })
  }
}

exports.webhookHandler = functions
  .region('europe-central2')
  .runWith({ secrets: ["WHATSAPP_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"] })
  .https.onRequest(app);

