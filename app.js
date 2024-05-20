const CONFIG = require("./config.json");

const { writeInLogs } = require("./format");
const { send, createNewWalksNotification, createWalksExpirationNotification } = require("./ntfy");
const { mapFetchedWalks, cleanExistingWalks, processWalks } = require("./model");

(() => {
    app();
    setInterval(app, 60000);
})();

async function app() {
    cleanExistingWalks();

    const json = await fetchSVPA();
    let fetchedWalks = mapFetchedWalks(json);

    // fetchedWalks.forEach((w) => {
    //     w.isTaken = true;
    // }); // temp test

    // Garder que les nouvelles promenades intéressantes
    const newWalks = processWalks(fetchedWalks);

    if (newWalks === "nothing") {
        console.log("nothing new");
        writeInLogs("nothing new");
        return;
    }

    if (newWalks === "all-taken") {
        console.log("all-taken");
        writeInLogs("all-taken");
        const message = createWalksExpirationNotification();
        send(message, CONFIG.NTFY_CHANNEL);

        return;
    }

    const message = createNewWalksNotification(newWalks);
    writeInLogs(`${message.count} new walks are free`);
    send(message, CONFIG.NTFY_CHANNEL);
}

async function fetchSVPA() {
    return fetch("https://www.svpa-promenades.ch/processor_fullcalendar.php", {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        cache: "no-cache",
        body: "Lessons=1",
        method: "POST",
    })
        .then((res) => {
            return res.json();
        })
        .then((json) => {
            return json;
        });
}
