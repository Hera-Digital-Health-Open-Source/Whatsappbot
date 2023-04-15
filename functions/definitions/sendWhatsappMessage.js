const axios = require("axios");
const functions = require('firebase-functions');
const { defineString } = require('firebase-functions/params');
const graphApiVersion = defineString("GRAPH_API_VERSION");

const runtimeEnvironment = defineString("ENVIRONMENT")

async function sendWhatsappTextMessage(to, text) {
    const data = {
        text: { body: text },
        to: to,
        messaging_product: "whatsapp",
        type: "text",
    };
    const response = await callWhatsappSendMessageApi(data);
    return response;
}

async function sendWhatsappButtonMessage(to, text, buttons) {
    const data = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "interactive",
        interactive: {
            type: "button",
            body: {
                text: text,
            },
            action: {
                buttons: buttons,
            },
        },
    };
    const response = await callWhatsappSendMessageApi(data);
    return response;
};

async function callWhatsappSendMessageApi(data) {
    const token = process.env.WHATSAPP_TOKEN;
    const response = await axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url:
            `https://graph.facebook.com/${graphApiVersion.value()}/` +
            process.env.WHATSAPP_PHONE_NUMBER_ID +
            "/messages",
        data: data,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    }).catch((error) => {
        functions.logger.log(error.response.data);
        throw new Error("An error occured calling the whatsapp API");
    }
    );
    return response;
}

exports.sendWhatsappTextMessage = sendWhatsappTextMessage;
exports.sendWhatsappButtonMessage = sendWhatsappButtonMessage;
