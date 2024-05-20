const { getClockEmoji, getHMTime, getDMYDate } = require("./format");
const { getLastRegisteredDate } = require("./model");

function createNewWalksNotification(infos) {
    return createNewWalksMessage(
        infos.fromDate,
        infos.toDate,
        infos.count,
        infos.walksTypes,
        getHMTime(new Date()),
        getDMYDate(new Date())
    );
}

function createWalksExpirationNotification() {
    const lastRegisteredDate = getDMYDate(getLastRegisteredDate());
    return createWalksExpirationMessage(
        lastRegisteredDate,
        getHMTime(new Date()),
        getDMYDate(new Date())
    );
}

function createNewWalksMessage(fromDate, toDate, walksNb, walksTypes, detectHourHM, detectDateDMY) {
    const emoji = getClockEmoji(new Date());
    const message = {
        text: "",
        tags: "dog,up",
        title: "Nouvelles promenades disponibles - SVPA",
        action: {
            text: "Site de la SVPA",
            link: "https://www.svpa-promenades.ch/lessons.php",
        },
    };

    message.text +=
        fromDate === toDate ? `📆 Pour le ${fromDate}` : `📆 Pour du ${fromDate} au ${toDate}`;

    message.text += `\n\n${walksNb} nouvelle${walksNb > 1 ? "s" : ""} promenade${
        walksNb > 1 ? "s" : ""
    } :`;

    for (const key in walksTypes) {
        message.text += `\n"${key}" => ${walksTypes[key]}`;
    }

    message.text += `\n\n${emoji} Ajout détecté à ${detectHourHM} le ${detectDateDMY}`;

    return message;
}

function createWalksExpirationMessage(dateBoundDMY, detectHourHM, detectDateDMY) {
    const emoji = getClockEmoji(new Date());
    return {
        text: `Il n'y a actuellement plus aucune promenade disponible jusqu'au ${dateBoundDMY}.\n\n${emoji} Détecté à ${detectHourHM} le ${detectDateDMY}`,
        title: "SVPA - Promenades expir=?UTF-8?Q?=C3=A9?=es",
        tags: "dog,x",
        action: {
            text: "C'est triste",
            link: "https://www.youtube.com/watch?v=b3rNUhDqciM",
        },
    };
}

function send(message, channel) {
    fetch(`https://ntfy.sh/${channel}`, {
        method: "POST", // PUT works too
        body: message.text,
        headers: {
            "Content-Type": "text/plain;charset=UTF-8",
            Markdown: "yes",
            Tags: message.tags,
            Action: `view, ${message.action.text}, ${message.action.link}, clear=true;`,
            Title: message.title,
        },
    })
        .then((res) => {
            return res.json();
        })
        .then((json) => {
            console.log(json);
        });
}

module.exports = {
    send,
    createNewWalksNotification,
    createWalksExpirationNotification,
};
