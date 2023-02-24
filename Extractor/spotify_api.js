const { Playlist, Track } = require('discord-Player');
var SpotifyWebApi  = require("spotify-web-api-node");
const { Spotify} = require('spotify-url-info');
require('dotenv').config();

function parseMS(milliseconds) {
    if (isNaN(milliseconds)) milliseconds = 0;
    const round = milliseconds > 0 ? Math.floor : Math.ceil;

    return {
        days: round(milliseconds / 86400000),
        hours: round(milliseconds / 3600000) % 24,
        minutes: round(milliseconds / 60000) % 60,
        seconds: round(milliseconds / 1000) % 60
    }
}

function buildTimeCode(duration) {
    const items = Object.keys(duration);
    const required = ['days', 'hours', 'minutes', 'seconds'];

    const parsed = items.filter((x) => required.includes(x)).map((m) => duration[m]);
    const final = parsed
        .slice(parsed.findIndex((x) => x !== 0))
        .map((x) => x.toString().padStart(2, '0'))
        .join(':');

    return final.length <= 3 ? `0:${final.padStart(2, '0') || 0}` : final;

}

var spotifyApi = new SpotifyWebApi({
    clientId: process.env.spotify_id,
    clientSecret: process.env.spotify_secret,
    redirectUri: "localhost:8888"
})

async function ApplyToken(){ 
    var token = await spotifyApi.clientCredentialsGrant()
    token = token["body"]["access_token"]

    console.log("SET TO ", token)

    await spotifyApi.setAccessToken(token)
}

async function getData(id){
    await ApplyToken()

    var trackData = await spotifyApi.getPlaylistTracks(id, {offset:0})
    var tracks = new Array()
    var offset = 0
    var total = trackData["body"]["total"]

    for (track in trackData["body"]["items"]) {
        track = trackData["body"]["items"][track]
        tracks.push(track)
    }

    offset += 100
    
    while (offset < total) {
        var trackData = await spotifyApi.getPlaylistTracks(id, {offset:offset})

        for (track in trackData["body"]["items"]) {
            track = trackData["body"]["items"][track]
            tracks.push(track)
        }

        offset += 100
    }

    console.log(`${tracks.length}/${total}`)
    
    // for (track in tracks) {
    //     console.log(tracks[track])
    // }

    return tracks
}

async function main(){
    await ApplyToken()

    await getTracks("0vvXsWCC9xrXsKd4FyS8kM")
}

// main()

async function getFetch() {
    if ('fetch' in globalThis) return globalThis.fetch;
    for (const lib of ['node-fetch', 'undici']) {
        try {
            return await import(lib).then((res) => res.fetch || res.default?.fetch || res.default);
        } catch {
            try {
                // eslint-disable-next-line
                const res = require(lib);
                if (res) return res.fetch || res.default?.fetch || res.default;
            } catch {
                // no?
            }
        }
    }
}

module.exports = {
    getData: getData,
    parseMS: parseMS,
    buildTimeCode: buildTimeCode
}

// module.exports = {
//     spot_API_EXAC:  {
//         version: "1.0.0",
//         important: true,
//         validate: async (query) => {
//             if (query.includes("spotify") && query.includes("playlist")) {
//                 return true
//             }else{
//                 return false
//             }
//         },
//         getInfo: async (query) => {
//             ref = query.split("/")[4].split("?")[0]

//             await ApplyToken()
//             var Data = await getData(ref)

//             if (!Data) {
//                 return {playlist: null, tracks: []}
//             }

//             var ret = {
//                 title: "Custom EXEC",
//                 engine: "url",
//                 views: 0,
//                 author: "Some Artist",
//                 description: "",
//                 url: "https://open.spotify.com/track/7262yTaZqR0OM0IzZhzFJ7?si=08e81a5285c24179"
//             }

//             await console.log(query)
//             await console.log(ret)

//             return ret

//             ref = query.split("/")[4].split("?")[0]
//             await ApplyToken()
//             var Data = await getTracks(ref)


//         }
//     }
// }