require("dotenv").config();
const fs = require("fs");
const moment = require("moment");
const request = require("request");
const keys = require("./keys.js");
const Spotify = require("node-spotify-api");
const spotify = new Spotify(keys.spotify);

const writeLog = function (logData) {
    logData += "\n";
    fs.appendFile("log.txt", logData, function (error) {
        if (error) {
            return doubleLog(error);
        }
    })
}

const doubleLog = function (logData) {
    console.log(logData);
    writeLog(logData);
}

const concertThis = function (artist) {
    request(`https://rest.bandsintown.com/artists/${artist}/events?app_id=${keys.omdb.id}`, function (error, response, body) {
        if (error) {
            return doubleLog(error);
        }
        if (!artist) {
            return doubleLog("Artist not found.");
        }
        if (body.length > 20) {
            let bodyObj = JSON.parse(body);
            for (i = 0; i < bodyObj.length; i++) {
                doubleLog(`Venue: ${bodyObj[i].venue.name || "N/A"}`);
                if (bodyObj[i].venue.region) {
                    doubleLog(`Location: ${bodyObj[i].venue.city || "N/A"}, ${bodyObj[i].venue.region}, ${bodyObj[i].venue.country || "N/A"}`);
                } else {
                    doubleLog(`Location: ${bodyObj[i].venue.city || "N/A"}, ${bodyObj[i].venue.country || "N/A"}`);
                }
                doubleLog(`Date: ${moment(bodyObj[i].datetime).format("l") || "N/A"}`);
            }
        } else {
            return doubleLog("Artist not found.");
        }
    })
}

const spotifyThisSong = function (song) {
    spotify.search({ type: "track", query: song || "What's My Age Again", limit: 1 }, function (err, data) {
        if (err) {
            return doubleLog(`Error occurred: ${err}`);
        }
        if (data.tracks.items[0]) {
            let trackObj = data.tracks.items[0];
            if (trackObj.artists) {
                if (trackObj.artists[0]) {
                    doubleLog(`Artist: ${trackObj.artists[0].name || "N/A"}`);
                } else {
                    doubleLog("Artist: N/A");
                }
            } else {
                doubleLog("Artist: N/A");
            }
            doubleLog(`Song title: ${trackObj.name || "N/A"}`);
            doubleLog(`Preview song: ${trackObj.preview_url || "N/A"}`);
            if (trackObj.album) {
                doubleLog(`Album: ${trackObj.album.name || "N/A"}`);
            } else {
                doubleLog("Album: N/A");
            }
        } else {
            return (doubleLog("Song not found."));
        }
    })
}

const movieThis = function (movie) {
    request(`http://www.omdbapi.com/?apikey=${keys.omdb.id}&t=${movie || "Mr. Nobody"}`, function (error, response, body) {
        if (error) {
            return doubleLog(error);
        }
        let bodyObj = JSON.parse(body);
        if (bodyObj.Title) {
            doubleLog(`Title: ${bodyObj.Title}`);
        } else {
            return (doubleLog("Title not found."));
        }
        doubleLog(`Year: ${bodyObj.Year || "N/A"}`);
        if (bodyObj.Ratings) {
            if (bodyObj.Ratings[0]) {
                if (bodyObj.Ratings[0].Source && bodyObj.Ratings[0].Value) {
                    for (i = 0; i < bodyObj.Ratings.length; i++) {
                        if (bodyObj.Ratings[i].Source === "Internet Movie Database") {
                            bodyObj.Ratings[i].Source = "IMDb";
                        }
                        doubleLog(`${bodyObj.Ratings[i].Source} Rating: ${bodyObj.Ratings[i].Value || "N/A"}`);
                    }
                } else {
                    doubleLog("IMDb Rating: N/A");
                }
            } else {
                doubleLog("IMDb Rating: N/A");
            }
        } else {
            doubleLog("IMDb Rating: N/A");
        }
        doubleLog(`Country: ${bodyObj.Country || "N/A"}`);
        doubleLog(`Language: ${bodyObj.Language || "N/A"}`);
        doubleLog(`Plot: ${bodyObj.Plot || "N/A"}`);
        doubleLog(`Actors: ${bodyObj.Actors || "N/A"}`);
    })
}

const doWhatItSays = function () {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return doubleLog(error);
        }
        let arguments = data.split(",");
        process.argv[2] = arguments[0];
        process.argv[3] = arguments[1].replace(/"/g, "");
        run();
    })
}

const run = function () {
    switch (process.argv[2]) {
        case "concert-this":
            writeLog(`\nconcert-this,"${process.argv.slice(3).join(" ").trim() || ""}"`);
            concertThis(process.argv.slice(3).join(" ").trim());
            break;
        case "spotify-this-song":
            writeLog(`\nspotify-this-song,"${process.argv.slice(3).join(" ").trim() || ""}"`);
            spotifyThisSong(process.argv.slice(3).join(" ").trim());
            break;
        case "movie-this":
            writeLog(`\nmovie-this,"${process.argv.slice(3).join(" ").trim() || ""}"`);
            movieThis(process.argv.slice(3).join(" ").trim());
            break;
        case "do-what-it-says":
            writeLog(`\ndo-what-it-says,"${process.argv.slice(3).join(" ").trim() || ""}"`);
            doWhatItSays(process.argv.slice(3).join(" ").trim());
            break;
        default:
            doubleLog("\nCommand not found.\n");
    }
}

run();