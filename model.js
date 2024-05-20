const { getDMYDate } = require("./format");
let existingWalks = require("./walks-storage.json");
const fs = require("fs");
const dayjs = require("dayjs");

function mapFetchedWalks(json) {
    return json.map((w) => {
        delete w.noPublicIcon;
        delete w.dayName;
        delete w.textColor;
        delete w.borderColor;

        w.isTaken = w.backgroundColor === "#f80707";
        return w;
    });
}

function getLastRegisteredDate(walks = existingWalks) {
    let allDates = walks.map((w) => new Date(w.start));
    allDates = allDates.sort((a, b) => new Date(b.date) - new Date(a.date));
    return allDates.at(-1);
}

function getFirstRegisteredDate(walks = existingWalks) {
    let allDates = walks.map((w) => new Date(w.start));
    allDates = allDates.sort((a, b) => new Date(b.date) - new Date(a.date));
    return allDates[0];
}

/**
 * Grande fonction qui va trier les walks
 * Renvoie "all-taken" si toutes les promenades s'avèrent être prises (mais que c'est pas nouveau)
 * Renvoie "nothing" s'il n'y a aucune actualité
 * Renvoie un objet contenant les infos nécessaires s'il y a des nouvelles promenades
 */
function processWalks(fetchedWalks) {
    const areExistingWalksTaken = areAllWalksTaken(existingWalks);
    const areFetchedWalksTaken = areAllWalksTaken(fetchedWalks);

    let newWalks = [];

    fetchedWalks.forEach((newWalk) => {
        const correspondingIndex = existingWalks.findIndex((w) => w.id == newWalk.id);
        const correspondingWalk =
            correspondingIndex !== -1 ? existingWalks[correspondingIndex] : undefined;

        // Si la promenade n'est pas connue et qu'elle est postérieure à mtn
        const isNewWalkUnknown = !correspondingWalk && isDateBefore(new Date(), newWalk.start);
        // Si la promenade est connue mais qu'elle s'est nouvellement libérée
        const isNewWalkAvailable = correspondingWalk?.isTaken && !newWalk.isTaken;

        if (isNewWalkUnknown || isNewWalkAvailable) {
            newWalks.push(newWalk);
        }

        if (isNewWalkUnknown) {
            existingWalks.push(newWalk);
            return;
        }

        existingWalks[correspondingIndex] = newWalk;

        // Si la promenade vient d'être prise
        if (!correspondingWalk.isTaken && newWalk.isTaken) {
            existingWalks[correspondingIndex] = newWalk;
        }
    });

    saveWalks(existingWalks);

    newWalks = newWalks.filter((w) => !w.isTaken);

    if (newWalks.length >= 1) {
        // Unique
        const walksTypesList = [...new Set(newWalks.map((w) => w.title))];
        const walksTypes = {};

        // Dénombrer les différents types de promenades
        walksTypesList.forEach((type) => {
            walksTypes[type] = newWalks.filter((w) => w.title === type).length;
        });

        return {
            fromDate: getDMYDate(getFirstRegisteredDate(newWalks)),
            toDate: getDMYDate(getLastRegisteredDate(newWalks)),
            count: newWalks.length,
            walksTypes: walksTypes,
        };
    }

    if (!areExistingWalksTaken && areFetchedWalksTaken) return "all-taken";

    return "nothing";
}

function cleanExistingWalks() {
    existingWalks = JSON.parse(fs.readFileSync("./walks-storage.json"));
    existingWalks = existingWalks.filter((w) => isDateBefore(new Date(), w.start));
    saveWalks(existingWalks);
}

function isDateBefore(date1, date2) {
    const date1StartOfDay = dayjs(date1).startOf("day");
    const date2StartOfDay = dayjs(date2).startOf("day");
    return date1StartOfDay.isBefore(date2StartOfDay);
}

function getCurrentFreeWalks() {
    existingWalks.filter((w) => w.isTaken);
}

/**
 *
 * @param {Object[]} walks
 * @returns {bool}
 */
const areAllWalksTaken = (walks) => walks.every((w) => w.isTaken);

function saveWalks(walks) {
    fs.writeFileSync("./walks-storage.json", JSON.stringify(walks, null, 2));
}

module.exports = {
    mapFetchedWalks,
    getLastRegisteredDate,
    cleanExistingWalks,
    processWalks,
};
