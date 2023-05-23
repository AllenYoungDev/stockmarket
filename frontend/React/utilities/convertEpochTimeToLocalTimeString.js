export function convertEpochTimeToLocalTimeString(epochTime) {
    var date = new Date(epochTime);
    return date.toLocaleDateString("default") + " " + date.toLocaleTimeString("default");
}