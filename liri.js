require("dotenv").config();

// const dotenv = require("dotenv");
const fs = require("fs");
const moment = require("moment");
const request = require("request");

const keys = require("./keys.js");

const Spotify = require("node-spotify-api");
const bandsintown = require("bandsintown");
const omdb = require("omdb");

const spotify = new Spotify(keys.spotify);

const constructInquiry = function () {
    let inquiry = process.argv[3];
    for (i = 4; i < process.argv.length; i++) {
        inquiry += ` ${process.argv[i]}`;
    }
    if (inquiry) {
        inquiry = inquiry.trim();
    }
    return inquiry;
}

const concertThis = function () {

}

const spotifyThisSong = function (input) {
    spotify.search({ type: "track", query: input || "What's My Age Again", limit: 10 }, function (err, data) {
        if (err) {
            return console.log(`Error occurred: ${err}`);
        }
        console.log(`Artist: ${data.tracks.items[0].artists[0].name}`);
        console.log(`Song title: ${data.tracks.items[0].name}`);
        console.log(`Preview song: ${data.tracks.items[0].preview_url}`);
        console.log(`Album: ${data.tracks.items[0].album.name}`);
    })
}

const movieThis = function (input) {
    omdb.search(input || "Mr. Nobody", function(err, movies) {
        if(err) {
            return console.error(err);
        }
        if(movies.length < 1) {
            return console.log('No movies were found!');
        }
        movies.forEach(function(movie) {
            console.log('%s (%d)', movie.title, movie.year);
        });
    });
}

const doWhatItSays = function () {
    fs.readFile("random.txt", "utf8", function(error, data) {
        if (error) {
            return console.log(error);
        }  
        let arguments = data.split(",");
        process.argv[2] = arguments[0];
        process.argv[3] = arguments[1].replace(/"/g, "");
        run();
    })
}

const run = function() {
    switch (process.argv[2]) {
        case "concert-this":
            concertThis(constructInquiry());
            break;
        case "spotify-this-song":
            spotifyThisSong(constructInquiry());
            break;
        case "movie-this":
            movieThis(constructInquiry());
            break;
        case "do-what-it-says":
            doWhatItSays(constructInquiry());
            break;
        default:
            console.log("Command not found.");
    }
}

run();

// 1. `node liri.js concert-this <artist/band name here>`

//    * This will search the Bands in Town Artist Events API (`https://rest.bandsintown.com/artists/${artist}/events?app_id=codingbootcamp`) for an artist and render the following information about each event to the terminal:

//      * Name of the venue

//      * Venue location

//      * Date of the Event (use moment to format this as "MM/DD/YYYY")

// 3. `node liri.js movie-this '<movie name here>'`

//    * This will output the following information to your terminal/bash window:

//      ```
//        * Title of the movie.
//        * Year the movie came out.
//        * IMDB Rating of the movie.
//        * Rotten Tomatoes Rating of the movie.
//        * Country where the movie was produced.
//        * Language of the movie.
//        * Plot of the movie.
//        * Actors in the movie.
//      ```

//    * If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'

//    * You'll use the request package to retrieve data from the OMDB API. Like all of the in-class activities, the OMDB API requires an API key. You may use `trilogy`.