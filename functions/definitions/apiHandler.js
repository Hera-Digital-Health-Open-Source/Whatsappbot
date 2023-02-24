const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

const runtimeEnvironment = defineString("ENVIRONMENT");

if (!admin.apps.length) {
    admin.initializeApp();
}
const app = express();