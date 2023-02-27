const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const { defineString } = require('firebase-functions/params');
const { SELECTIONS } = require("./constants")
const runtimeEnvironment = defineString("ENVIRONMENT");
const { timestampToString } = require('./utils');

if (!admin.apps.length) {
  admin.initializeApp();
}
const app = express();

app.get("/", async (req, res) => {
  const typeCode = req.query["type"];
  let type;
  const organisation = req.query["organisation"];
  const user = req.query["user"];
  const db = admin.firestore();
  const today = new Date();
  today.setHours(0, 0, 0, 0) //dont care about the hours, compare date only
  let query = db.collection("facilities").where('expiry', ">=", today).where('inEdit', '==', false);
  if (typeCode) {
    if (!isNaN(typeCode) && parseInt(typeCode) >= 1 && parseInt(typeCode) <= SELECTIONS.length) {
      try {
        type = SELECTIONS[parseInt(typeCode) - 1]
        query = query.where("type", "==", type);
      } catch {
        res.status(400).json({ "error": "type is invalid" });
        return;
      }
    } else {
      res.status(400).json({ "error": "type is invalid" });
      return;
    }
  }
  if (organisation) {
    query = query.where("organisation", "==", organisation.toUpperCase());
  }
  if (user) {
    query = query.where("user", "==", user)
  }
  const querySnap = await query.get()

  // Select properties to keep
  const returnProperties = ['type', 'organisation', 'latitude', 'longitude', 'user', 'expiry'];

  // Use map() to return a new array of objects with only selected properties
  const returnArray = querySnap.docs.map(facilitySnap => {
    return returnProperties.reduce((acc, curr) => {
      if (curr == 'expiry') {
        acc[curr] = timestampToString(facilitySnap.data()[curr])
      } else {
        acc[curr] = facilitySnap.data()[curr];
      }
      return acc;
    }, {});
  });
  res.status(200).json(returnArray)
});

exports.getFacilities = functions
  .region('europe-central2')
  .https.onRequest(app);