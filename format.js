const dayjs = require("dayjs");
const fs = require("fs");

const getHMTime = (date) => dayjs(date).format("HH[h]mm");

const getDMYDate = (date) => dayjs(date).format("DD.MM.YYYY");

function getClockEmoji(date) {
    let emoji = ~~((date.getHours() % 12) * 2 + date.getMinutes() / 30 + 0.5);
    emoji += emoji < 2 ? 24 : 0;
    return String.fromCharCode(55357, 56655 + (emoji % 2 ? 23 + emoji : emoji) / 2);
}

function writeInLogs(msg) {
    fs.appendFileSync("logs.log", `[${dayjs().toISOString()}] ${msg}\n`);
}

module.exports = {
    getHMTime,
    getDMYDate,
    getClockEmoji,
    writeInLogs,
};
