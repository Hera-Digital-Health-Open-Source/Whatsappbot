const axios = require("axios");
const functions = require('firebase-functions');
const { defineString } = require('firebase-functions/params');


const runtimeEnvironment = defineString("ENVIRONMENT")

async function sendWhatsappTextMessage(to, text) {
    const data = {
        text: { body: text },
        to: to,
        type: "text"
    };
    const response = await callWhatsappSendMessageApi(data);
    return response;
}

async function sendWhatsappTextListMessage(to, text, buttonText, sections) {
    data = {
        to: to,
        type: "interactive",
        interactive: {
            type: "list",
            body: {
                text: text,
            },
            action: {
                button: buttonText,
                sections: sections,
            },
        },
    };
    const response = await callWhatsappSendMessageApi(data);
    return response;
}

async function sendWhatsappButtonMessage(to, text, buttons) {
    data = {
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
    const token = process.env.TURNIO_TOKEN;
    // console.log(token)
    // console.log(JSON.stringify(data, null, 2));
    const response = await axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url: `https://whatsapp.turn.io/v1/messages`,
        data: data,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    }).catch((error) => {
        functions.logger.log(error.response);
        throw (error);
    }
    );
    return response;
}

exports.sendWhatsappTextMessage = sendWhatsappTextMessage;
exports.sendWhatsappTextListMessage = sendWhatsappTextListMessage;
exports.sendWhatsappButtonMessage = sendWhatsappButtonMessage;
