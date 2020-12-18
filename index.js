// Imported libararies
const Discord = require('discord.js');
const client = new Discord.Client();
const request = require("request");
const moment = require('moment');

// --- SERVER SETUP: START HERE --- //
const botToken = '';
const memberCountCategoryID = '';
const updateChannelID = '';
// --- SERVER SETUP END --- //

// Status array
const codStatus = {
    1: "✅ Undetected",
    2: "❔ Unknown",
    3: "❌ Detected",
    5: "🔄 Updating"
}

// Status-related
let firstRun = true;
let oldStatus = 2;
let curStatus = 2;

// Update cod cheat status
function updateStatus() {
    request('https://www.engineowning.com/shop/ajax/get-product-status', (e, r, body) => {
        // Parse the JSON into the status object and obtain the games from it
        status = JSON.parse(body);
        games = status["content"]["content"];

        // Attempt to obtain the cod mw 2019 game index
        codIndex = -1;
        for(i = 0; i < games.length; i++) {
            if(games[i].name === "EngineOwning for CoD MW and Warzone") {
                codIndex = i;
                break;
            }
        }

        // Verify that the cod mw 2019 index was obtained
        if(codIndex !== -1) {client.channels.fetch(updateChannelID).then(channel => {
                // Current cod status index
                let codStatusIndex = games[codIndex].status;

                // Update old and current status
                oldStatus = curStatus;
                curStatus = codStatusIndex;

                // Delete old messages
                channel.bulkDelete(100);

                // Do we notify everyone?
                let notify = false;

                // Check for first run
                if(firstRun) {
                    // Disable first run
                    firstRun = false;
                } else {
                    // Notify everyone
                    if(curStatus !== oldStatus) notify = true;
                }

                // Send the update message to the server
                channel.send((notify ? '@everyone\n' : '') + 'Current status: `' + codStatus[codStatusIndex] + '`\nLast check on `' + moment().format('MMMM Do YYYY, h:mm a') + '`').then().catch();
            }).catch();
        }
    });
}

// Updates member count
function updateMemberCount() {
    // Fetch our member count category
    client.channels.fetch(memberCountCategoryID).then(channel => {
        // Set new name and include the current guild's member count
        channel.setName('⭐ Member Count: ' + channel.guild.memberCount).then().catch();
    }).catch();
    
}

// When we connect to the discord server
client.on('ready', () => {
    // Update bot's presence
    client.user.setActivity({name: "EO COD MW 2019", type: "WATCHING"}).then().catch();

    // Start the update loop every minute
    client.setInterval(updateStatus, 60*1000);

    // Update member count every 30 seconds
    client.setInterval(updateMemberCount, 30*1000);
});

// Attempt to log in to the discord servers
client.login(botToken);
