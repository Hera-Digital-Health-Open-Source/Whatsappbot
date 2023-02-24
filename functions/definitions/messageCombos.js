const { sendWhatsappTextMessage, sendWhatsappButtonMessage, sendWhatsappTextListMessage } = require('./sendWhatsappMessage')
const { MESSAGES, SELECTIONS } = require("./constants")
const { sleep } = require('./utils');
const admin = require('firebase-admin');

const QUESTIONS = {
  organisation: {
    func: askOrganisation,
    index: 1,
  },
  type: {
    func: askType,
    index: 2,
  },
  location: {
    func: askLocation,
    index: 3,
  },
  expiry: {
    func: askExpiry,
    index: 4,
  },
  end: {
    func: sendEndMessage,
    index: 5,
  }
}

function getFieldIndex(fieldName) {
  const question = QUESTIONS[`${fieldName}`]
  if (question) {
    return question.index;
  }
  // If no matching field is found, return -1
  return -1;
}

function getFieldByIndex(index) {
  for (let key in QUESTIONS) {
    if (QUESTIONS[key].index === index) {
      return key;
    }
  }
  return null; // no question found with the given index
}

function getNextField(fieldName) {
  const index = getFieldIndex(fieldName)
  if (index < Object.keys(QUESTIONS).length) {
    return getFieldByIndex(index + 1)
  } else {
    return null;
  }
}

function getPreviousField(fieldName) {
  const index = getFieldIndex(fieldName)
  if (index > 1) {
    return getFieldByIndex(index - 1)
  } else {
    return null;
  }
}

async function askOrganisation(to) {
  await sendWhatsappTextMessage(to, MESSAGES.WELCOME_MSG);
}

async function askType(to) {
  await sendWhatsappTextMessage(to, MESSAGES.SELECTION_PROMPT_MSG);
  await sleep(1000);
  let selectionMsg = ""
  for (let i = 0; i < SELECTIONS.length; i++) {
    selectionMsg = `${selectionMsg}\n\n${i + 1}. ${SELECTIONS[i]}`
  }
  await sendWhatsappTextMessage(to, selectionMsg);
}

async function askLocation(to) {
  await sendWhatsappTextMessage(to, MESSAGES.LOCATION_MSG);
}

async function askExpiry(to) {
  await sendWhatsappTextMessage(to, MESSAGES.EXPIRY_MSG);
}

async function sendEndMessage(to) {
  await sendWhatsappTextMessage(to, MESSAGES.END_MSG);
  const db = admin.firestore();

}

exports.getFieldByIndex = getFieldByIndex;
exports.QUESTIONS = QUESTIONS;
exports.getNextField = getNextField;
exports.getPreviousField = getPreviousField;
exports.getFieldIndex = getFieldIndex;