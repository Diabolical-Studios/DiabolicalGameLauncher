console.log("Loaded database.js!");
const axios = require("axios");
const {getMainWindow} = require("./windowManager");
require('dotenv').config();

//Ping the game storage bucket to see health
function pingDatabase(url) {
    axios
        .get(url)
        .then((response) => {
            if (response.status >= 200 && response.status < 300) {
                console.log(`Website ${url} is up! Status Code: ${response.status}`);
                getMainWindow().webContents.send("db-status", "rgb(72, 216, 24)");
            } else {
                console.log(`Website ${url} returned status code ${response.status}`);
                getMainWindow().webContents.send("db-status", "red");
            }
        })
        .catch((error) => {
            console.error(`Error checking ${url}: ${error}`);
            getMainWindow().webContents.send("db-status", "red");
        });
}

module.exports = {pingDatabase};
