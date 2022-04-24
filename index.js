const Discord = require('discord.js'),
    DisTube = require('distube'),
    client = new Discord.Client(),
    config = {
        prefix: ".",
        token: process.env.TOKEN || "ODA2NDQ1MTc2NDIzNTc5Njk4.YBpimQ.FwxhciThXZSm8ydDJh_xr3p6_Og"
    };
const distube = new DisTube(client, {
    youtubeCookie: "",
    searchSongs: true,
    emitNewSongOnly: true,
    highWaterMark: 1 << 25,
    leaveOnEmpty: true,
    leaveOnFinish: true,
    leaveOnStop: true,
    customFilters:
    {
        "clear": "dynaudnorm=f=200",
        "bassboost": "bass=g=19,dynaudnorm=f=200",
        "8d": "apulsator=hz=0.08",
        "vaporwave": "aresample=48000,asetrate=48000*0.8",
        "nightcore": "aresample=48000,asetrate=48000*1.25",
        "phaser": "aphaser=in_gain=0.4",
        "purebass": "bass=g=20,dynaudnorm=f=200,asubboost",
        "tremolo": "tremolo",
        "vibrato": "vibrato=f=6.5",
        "reverse": "areverse",
        "treble": "treble=g=5",
        "surrounding": "surround",
        "pulsator": "apulsator=hz=1",
        "subboost": "asubboost",
        "karaoke": "stereotools=mlev=0.03",
        "flanger": "flanger",
        "gate": "agate",
        "haas": "haas",
        "mcompand": "mcompand"
    }
})

const { PREFIX, } = require("./config.json")
const filters = [
    "mcompand",
    "gate",
    "haas",
    "pulsator",
    "surrounding",
    "clear",
    "8d",
    "bassboost",
    "echo",
    "karaoke",
    "nightcore",
    "vaporwave",
    "flanger",
    "subboost",
    "phaser",
    "tremolo",
    "vibrato",
    "reverse",
    "purebass",
    "treble"
];
const fs = require("fs")
const db = require('quick.db');
const CatLoggr = require("cat-loggr")
const { getLyrics } = require('genius-lyrics-api');
client.logger = new CatLoggr()
client.commands = new Discord.Collection()
client.prefix = PREFIX
client.aliases = new Discord.Collection()
const { MessageEmbed } = require("discord.js")
const cooldowns = new Discord.Collection()
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
client.on("ready", () => {
    client.logger.info(`${client.user.username} ready!`)
    const server = client.guilds.cache.size
    const cstatuslist = [
        `${PREFIX}help`,
        `${PREFIX}invite`,
        `${PREFIX}play`,
        `${server} server`
    ]
    setInterval(() => {
        const index = Math.floor(Math.random() * cstatuslist.length)
        client.user.setActivity(cstatuslist[index] + " |v3", { type: "COMPETING" })
    }, 10000)
})

client.on("message", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift();



    if (command === "ping") {
        const ping = Math.round(client.ws.ping)
        if (ping <= 250) message.channel.send(`${ping}ms, \`⚠️WOW I may be responding fast⚠️\``)
        if (ping > 250) message.channel.send(`${ping}ms, \`⚠️aww I may be responding a little late!⚠️\` `)

    }

    if (command === "help" || command === "about" || command === "h" || command === "info") {
        let helpembed = new Discord.MessageEmbed()
            .setColor("#fffff0")
            .setTitle("***__COMMANDS__***")
            .setURL("https://harmonymusic.tk")
            .setAuthor(message.author.tag, message.member.user.displayAvatarURL({ dynamic: true }), "https://harmonymusic.tk")
            .setFooter(client.user.username + " | Syntax:  <>...must    []...optional", client.user.displayAvatarURL())
            .setDescription(`
        **Prefix:** \`.\`   *change with:* 
        \`.help\`  \`.h\`  ➖➖ *List of all Commands*
        \`.play <URL/NAME>\`  \`.p\`  ➖➖ *Plays a song*
        \`.radio [radiostation]\`  ➖➖ *Plays a radiostation*(API ERROR !!!)
        \`.status\`  ➖➖ *Shows queue status*
        \`.nowplaying\`  \`.np\`  ➖➖ *Shows current song*
        \`.pause\`  ➖➖ *Pauses the song*
        \`.resume\`  \`.r\`  ➖➖ *Resume the song*
        \`.shuffle\`  \`.mix\`  ➖➖ *Shuffles the queue*
        \`.playskip\`  \`.ps\`  ➖➖ *Plays new song and skips current*
        \`.autoplay\`  \`.ap\`  ➖➖ *Enables autoplay - random similar songs
        \`.skip\`  \`.s\`  ➖➖ *Skips current song*
        \`.stop\`  \`.leave\`  ➖➖ *Stops playing and leaves the channel*
        \`.seek <DURATION>\`  ➖➖ *Moves in the Song in: seconds*
        \`.volume <VOLUME\`  \`.vol\`  ➖➖ *Changes volume*
        \`.queue\`  \`.qu\`  ➖➖ *Shows current Queue*
        \`.loop <0/1/2>\`  \`.repeat\`  ➖➖ *Enables loop for off / song / queue*
        \`.lyircs\`  \`.ly\`  ➖➖ *Shows lyrics for this song*(API ERROR !!!)
        \`.jump <Queue num.>\`  ➖➖ *Jumps to a queue song*
        \`.ping\`  ➖➖ *Gives you the ping*
        \`.uptime\`  ➖➖ *Shows you the Bot's Uptime*
        \`.invite\`  ➖➖ *Invite the Bot to your Server :heart:*
        `)
            .addField("***FILTER COMMANDS:***", `
        \`${PREFIX}gate\` | \`${PREFIX}haas\` | \`${PREFIX}pulsator\` | \`${PREFIX}surrounding\` | \`${PREFIX}clear\` | \`${PREFIX}8d\` | \`${PREFIX}bassboost\` | \`${PREFIX}echo\` | \`${PREFIX}karaoke\` | \`${PREFIX}nightcore\` | \`${PREFIX}vaporwave\` | \`${PREFIX}flanger\` | \`${PREFIX}subboost\` | \`${PREFIX}phaser\` | \`${PREFIX}tremolo\` | \`${PREFIX}vibrato\` | \`${PREFIX}reverse\` | \`${PREFIX}treble\` | \`${PREFIX}clear\`   
        `)
            // .addField("***SUPPORTED SOURCES:***",`
            // \`Youtube\`, \`Soundcloud\`, [\`More\`](URL), ...
            //  `)
            .addField("***BOT BY:***", `
        <@591978731925536806> \`WinDy </>#2278\`[\`More\`](https://www.instagram.com/kevin_nhim/)
        `)
            .addField("***SUPPORT:***", `
        [\`Server\`](https://discord.gg/gGUyE8CF) | [\`Invite\`](https://discord.com/api/oauth2/authorize?client_id=806445176423579698&permissions=0&scope=bot)
        `)
        message.channel.send(helpembed)
        return;
    }

    if (command == "shuffle" || command == "mix") {
        embedbuilder(client, message, "RANDOM", "Shuffled!")
        return distube.shuffle(message);
    }

    if (command == "np" || command === "nowplaying") {
        let queue = distube.getQueue(message);
        if (!queue) return embedbuilder(client, message, "RED", "There is nothing playing!").then(msg => msg.delete({ timeout: 5000 }).catch(console.error));

        let cursong = queue.songs[0];

        return embedbuilder(client, message, "RANDOM", "Current Song!", `[${cursong.name}](${cursong.url})\n\nPlaying for: \`${(Math.floor(queue.currentTime / 1000 / 60 * 100) / 100).toString().replace(".", ":")} Minutes\`\n\nDuration: \`${cursong.formattedDuration}\``, cursong.thumbnail)
    }

    if (command === "play" || command === "p") {
        embedbuilder(client, message, "YELLOW", "Searching!🕵️🧐", args.join(" "))
        return distube.play(message, args.join(" "));
    }


    if (command === "skip" || command === "s") {
        embedbuilder(client, message, "YELLOW", "SKIPPED!👌", "\`Skipped the song\`")
        return distube.skip(message);
    }

    if (command === "pause" || command === "pu") {
        embedbuilder(client, message, "PURPLE", "⏸PAUSE!⏸", "\`pause the song\`")
        return distube.pause(message);
    }


    if (command === "resume" || command === "ru") {
        embedbuilder(client, message, "PURPLE", "▶️RESUME!▶️", "\`resume the song\`")
        return distube.resume(message);
    }

    if (command === "stop" || command === "leave") {
        embedbuilder(client, message, "RED", "❌STOPPED!❌", "\`See you again next time😉👋\`")
        return distube.stop(message);
    }


    if (command === "seek" || command === "sk") {
        embedbuilder(client, message, "PURPLE", "⏩Seeked!⏩", `seeked the song for \`${args[0]} seconds\``)
        return distube.seek(message, Number(args[0] * 1000));
    }


    if (filters.includes(command)) {
        let filter = await distube.setFilter(message, command);
        await message.guild.channels.cache.get(db.get(`playingchannel_${message.guild.id}`)).messages.cache.get(db.get(`playingembed_${message.guild.id}`), false, true).edit(curembed(message))
        await embedbuilder(client, message, "RANDOM", "Adding filter!", filter)
        await delay(5000);
        await message.channel.bulkDelete(2)
        return
    }

    if (command === "volume" || command === "vol") {

        embedbuilder(client, message, "PURPLE", "🔊VOLUME!🔊", `changed volume to \`${args[0]} %\``)
        return distube.setVolume(message, args[0]);
    }


    if (command === "queue" || command === "qu") {

        let currentPage = 0;
        let queue = distube.getQueue(message);
        if (!queue) return embedbuilder(client, message, "RED", "There is nothing playing!").then(msg => msg.delete({ timeout: 5000 }).catch(console.error));

        const embeds = QueueEmbed(queue.songs);
        const queueEmbed = await message.channel.send(`
        **Current Page - ${currentPage + 1}/${embeds.length}**`,
            embeds[currentPage]);
        try {
            await queueEmbed.react("⬅️");
            await queueEmbed.react("⏹");
            await queueEmbed.react("➡️");
        } catch (error) {
            console.error(error)

        }
        const filter = (reaction, user) =>
            ["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) && message.author.id === user.id;
        const collector = queueEmbed.createReactionCollector(filter, { time: 60000 });
        collector.on("collect", async (reaction, user) => {
            try {
                if (reaction.emoji.name === "➡️") {
                    if (currentPage < embeds.length - 1) {
                        currentPage++;
                        queueEmbed.edit(`**Current Page - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                    }
                } else if (reaction.emoji.name === "⬅️") {
                    if (currentPage !== 0) {
                        --currentPage;
                        queueEmbed.edit(`**Current Page - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                    }
                } else {
                    collector.stop();
                    reaction.message.reactions.removeAll();
                }
                await reaction.users.remove(message.author.id);
            } catch (error) {
                console.error(error)

            }
        })
    }

    if (command === "loop" || command === "repeat") {
        if (0 <= Number(args[0]) && Number(args[0]) <= 2) {
            distube.setRepeatMode(message, parseInt(args[0]))
            embedbuilder(client, message, "GREEN", "🔁Repeat mode set to:!🔁", `${args[0].replace("0", "OFF").replace("1", "Repeat song").replace("2", "Repeat Queue")}`)
        }
        else {
            embedbuilder(client, message, "RED", "ERROR", `Please use a number between **0** and **2**   |   *(0: disabled, 1: Repeat a song, 2: Repeat all the queue)*`)
        }
    }


    if (command === "jump" || command === "ju") {
        let queue = distube.getQueue(message);
        if (0 <= Number(args[0]) && Number(args[0]) <= queue.songs.length) {
            embedbuilder(client, message, "RED", "ERROR", `⏭Jumped ${parseInt(args[0])} songs!⏭`)
            return distube.jump(message, parseInt(args[0]))
                .catch(err => message.channel.send("Invalid song number."));
        }
        else {
            embedbuilder(client, message, "RED", "ERROR", `Please use a number between **0** and **${DisTube.getQueue(message).length}**   |   *(0: disabled, 1: Repeat a song, 2: Repeat all the queue)*`)
        }


    }
    if (command === "invite") {
        let invite = new MessageEmbed()
            .setTitle("😍សូមអរគុណចំពោះការគាំទ្ររបស់អ្នក។😍")
            .setColor("RANDOM")
            .setDescription("https://discord.com/api/oauth2/authorize?client_id=806445176423579698&permissions=0&scope=bot")
        invite.setTimestamp()
        return message.channel.send(invite)
    }


    if (command == "lyrics" || command == "ly") {

    }

    if (command == "playskip" || command == "ps") {
        embedbuilder(client, message, "YELLOW", "Searching and Skipping!", args.join(" "))
        try {
            await message.guild.channels.cache.get(db.get(`playingchannel_${message.guild.id}`)).messages.cache.get(db.get(`playingembed_${message.guild.id}`), false, true).delete().catch(console.error);
        } catch (error) {
            console.error(error)

        }
        return distube.playSkip(message, args.join(" "));
    }

    if (command === "uptime") {
        let days = Math.floor(client.uptime / 86400000);
        let hours = Math.floor(client.uptime / 3600000) % 24;
        let minutes = Math.floor(client.uptime / 60000) % 60;
        let seconds = Math.floor(client.uptime / 1000) % 60;
        return embedbuilder(client, message, `RED`, `UPTIME:`, `\`${days}d\` \`${hours}h\` \`${minutes}m\` \`${seconds}s\n\``)
    }

    if (command == "status" || "check") {
        let queue = distube.getQueue(message);
        if (!queue) return embedbuilder(client, message, "RED", "There is nothing playing!").then(msg => msg.delete({ timeout: 5000 }).catch(console.error));

        const status = `Volume: \`${queue.volume}\` | Filter: \`${queue.filter || "❌"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode === 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``
        return embedbuilder(client, message, "RANDOM", "Current status:", status)
    }

})

//queue
const status = (queue) => `Volume: \`${queue.volume}\` | Filter: \`${queue.filter || "OFF"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode === 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``
//distube
distube
    .on("playSong", async (message, queue, song) => {
        try {
            playsongyes(message, queue, song);
        } catch (error) {
            console.error
        }
    })
    .on("addSong", (message, queue, song) => {
        try {
            return embedbuilder(client, message, "RANDOM", "Added a Song!", `Song: [\`${song.name}\`](${song.url})  -  \`${song.formattedDuration}\` \n\nRequested by: ${song.user}\n\nEstimated Time: ${queue.songs.length - 1} song(s) - \`${(Math.floor((queue.duration - song.duration) / 60 * 100) / 100).toString().replace(".", ":")}\`\nQueue duration: \`${queue.formattedDuration}\``, song.thumbnail)
        } catch (error) {
            console.error
        }
    })
    .on("playList", (message, queue, playlist, song) => {
        try {
            playplaylistyes(message, queue, playlist, song);
        } catch (error) {
            console.error
        }
    })
    .on("addList", (message, queue, playlist, song) => {
        try {
            return embedbuilder(client, message, "RANDOM", "Added a Playling!", `Playlist: [\`${playlist.name}\`](${playlist.url})  -  \`${playlist.songs.length} songs\` \n\nRequested by: ${song.user}`, playlist.thumbnail)
        } catch (error) {
            console.error
        }
    })
    .on("searchResult", (message, result) => {
        try {
            let i = 0;
            return embedbuilder(client, message, "YELLOW", "", `**Choose an option from below**\n${result.map(song => `**${++i}**. [${song.name}](${song.url}) - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`)
        } catch (error) {
            console.error
        }
    })
    .on("searchCancel", (message) => {
        try {
            message.reactions.removeAll();
            message.react("❌")
        } catch (error) {
            console.error(error)

        }
        try {
            return embedbuilder(client, message, "RED", `Searching canceled`, "").then(msg => msg.delete({ timeout: 5000 }).catch(console.error))
        } catch (error) {
            console.error
        }
    })
    .on("error", (message, err) => {
        try {
            message.reactions.removeAll();
            message.react("❌")
        } catch (error) {
            console.error(error)
        }
        console.log(err);
        try {
            return embedbuilder(client, message, "RED", "An error encountered:", "```" + err + "```")
        } catch (error) {
            console.error
        }
    })
    .on("finish", message => {
        try {
            return embedbuilder(client, message, "RED", "LEFT THE CHANNEL", "There are no more songs left").then(msg => msg.delete({ timeout: 5000 }).catch(console.error))
        } catch (error) {
            console.error
        }
    })
    .on("empty", message => {

        try {
            return embedbuilder(client, message, "RED", "Left the channel cause it got empty!").then(msg => msg.delete({ timeout: 5000 }).catch(console.error))
        } catch (error) {
            console.error
        }
    })
    .on("noRelated", message => {
        try {
            return embedbuilder(client, message, "RED", "Can't find related video to play. Stop playing music.").then(msg => msg.delete({ timeout: 5000 }).catch(console.error))
        } catch (error) {
            console.error
        }
    })
    .on("initQueue", queue => {
        try {
            queue.autoplay = true;
            queue.volume = 100;
            queue.filter = filters[5];
        } catch (error) {
            console.error
        }
    });
///////////////
///FUNCTIONS///
///////////////
//function embeds creates embeds
function embedbuilder(client, message, color, title, description, thumbnail) {
    try {
        let embed = new Discord.MessageEmbed()
            .setColor(color)
            .setAuthor(message.author.tag, message.member.user.displayAvatarURL({ dynamic: true }), "https://harmonymusic.tk")
            .setFooter(client.user.username, client.user.displayAvatarURL());
        if (title) embed.setTitle(title);
        if (description) embed.setDescription(description);
        if (thumbnail) embed.setThumbnail(thumbnail)
        return message.channel.send(embed);
    } catch (error) {
        console.error
    }
}

//this function is for playing the song
async function playsongyes(message, queue, song) {
    try {
        let embed1 = new Discord.MessageEmbed()

            .setColor("RANDOM")
            .setTitle("Playing Song!")
            .setDescription(`Song: [\`${song.name}\`](${song.url})`)
            .addField("⏱ Duration:", ` \`${queue.formattedCurrentTime} / ${song.formattedDuration}\``, true)
            .addField("🌀 Queue:", `\`${queue.songs.length} song(s) - ${queue.formattedDuration}\``, true)
            .addField("🔊 Volume:", `\`${queue.volume} %\``, true)
            .addField("♾ Loop:", `  \`${queue.repeatMode ? queue.repeatMode === 2 ? "✅ Queue" : "✅ Song" : "❌"}\``, true)
            .addField("↪️ Autoplay:", `\`${queue.autoplay ? "✅" : "❌"}\``, true)
            .addField("❔ Filter:", `\`${queue.filter || "❌"}\``, true)
            .setFooter(client.user.username, client.user.displayAvatarURL())
            .setAuthor(message.author.tag, message.member.user.displayAvatarURL({ dynamic: true }), "https://harmonymusic.tk")
            .setThumbnail(song.thumbnail)

        var playingMessage = await message.channel.send(embed1)

        db.set(`playingembed_${message.guild.id}`, playingMessage.id)
        db.set(`playingchannel_${message.guild.id}`, message.channel.id)
        try {
            await playingMessage.react("⏭");
            await playingMessage.react("⏹");
            await playingMessage.react("🔉");
            await playingMessage.react("🔊");
            await playingMessage.react("⏪");
            await playingMessage.react("⏩");
        }
        catch (error) {
            message.reply("Missing permissions, i need to add reactions!")
            console.log(error);
        }

        const filter = (reaction, user) =>
            ["⏭", "⏹", "🔉", "🔊", "⏪", "⏩ "].includes(reaction.emoji.name) && user.id !== message.client.user.id;
        var collector = playingMessage.createReactionCollector(filter, {
            time: song.duration > 0 ? song.duration * 1000 : 600000
        });
        collector.on("collect", async (reaction, user) => {
            if (!queue) return;
            const member = message.guild.member(user);
            if (member.voice.connection && member.voice.connection !== member.guild.me.voice.connection) return;

            switch (reaction.emoji.name) {
                case "⏭":
                    distube.skip(message);
                    embedbuilder(client, message, "RANDOM", "SKIPPED!", `Skipped the song`).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    playingMessage.reactions.removeAll().catch(console.error);
                    playingMessage.delete({ timeout: client.ws.ping }).catch(console.error);
                    break;

                case "⏹":
                    distube.stop(message);
                    playingMessage.reactions.removeAll().catch(console.error);
                    playingMessage.delete({ timeout: client.ws.ping }).catch(console.error);
                    embedbuilder(client, message, "RED", "STOPPED!", `Left the channel`).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    break;

                case "🔉":

                    reaction.users.remove(user).catch(console.error);
                    await distube.setVolume(message, Number(queue.volume) - 10);
                    embedbuilder(client, message, "RANDOM", "Volume!", `Redused the Volume to \`${queue.volume}\``).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    await playingMessage.edit(curembed(message)).catch(console.error);
                    break;

                case "🔊":

                    reaction.users.remove(user).catch(console.error);
                    await distube.setVolume(message, Number(queue.volume) + 10);
                    embedbuilder(client, message, "RANDOM", "Volume!", `Raised the Volume to \`${queue.volume}\``).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    await playingMessage.edit(curembed(message)).catch(console.error);
                    break;

                case "⏪":

                    reaction.users.remove(user).catch(console.error);
                    let seektime = queue.currentTime - 10000;
                    if (seektime < 0) seektime = 0;
                    await distube.seek(message, Number(seektime));
                    playingMessage.edit(curembed(message)).catch(console.error);
                    embedbuilder(client, message, "RANDOM", "Seeked!", `Seeked the song for \`-10 seconds\``).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))

                    break;

                case "⏩":
                    reaction.users.remove(user).catch(console.error);
                    let seektime2 = queue.currentTime + 10000;
                    if (seektime2 >= queue.songs[0].duration * 1000) { seektime2 = queue.songs[0].duration * 1000 - 1; }
                    console.log(seektime2)
                    await distube.seek(message, seektime2);
                    playingMessage.edit(curembed(message)).catch(console.error);
                    embedbuilder(client, message, "RANDOM", "Seeked!", `Seeked the song for \`+10 seconds\``).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    break;

                default:
                    reaction.users.remove(user).catch(console.error);
                    break;
            }
        });
        collector.on("end", () => {
            playingMessage.reactions.removeAll().catch(console.error);
            playingMessage.delete({ timeout: client.ws.ping }).catch(console.error);
        })
    } catch (error) {
        console.error
    }
}

//this function is for playlistsong playing like the function above
async function playplaylistyes(message, queue, playlist, song) {
    try {
        var playingMessage = await embedbuilder(client, message, "#fffff0", "Playling playlist", `Playlist: [\`${playlist.name}\`](${playlist.url})  -  \`${playlist.songs.length} songs\` \n\nRequested by: ${song.user}\n\nVolume: \`${queue.volume} %\`\nLoop: \`${queue.repeatMode ? "On" : "Off"}\`\nAutoplay: \`${queue.autoplay ? "On" : "Off"}\`\nFilter: \`${queue.filter || "❌"}\``, playlist.thumbnail)
        await playingMessage.react("⏭");
        await playingMessage.react("⏹");
        await playingMessage.react("🔉");
        await playingMessage.react("🔊");
        await playingMessage.react("◀️");
        await playingMessage.react("▶️");
    }
    catch {
        console.error(error);
    }
    try {
        const filter = (reaction, user) =>
            ["⏭", "⏹", "🔉", "🔊", "◀️", "▶️"].includes(reaction.emoji.name) && user.id !== message.client.user.id;
        var collector = playingMessage.createReactionCollector(filter, {
            time: song.duration > 0 ? song.duration * 1000 : 600000
        });
        collector.on("collect", (reaction, user) => {
            if (!queue) return;
            const member = message.guild.member(user);
            if (member.voice.connection && member.voice.connection !== member.guild.me.voice.connection) return;

            switch (reaction.emoji.name) {

                case "⏭":
                    reaction.users.remove(user).catch(console.error);
                    embedbuilder(client, message, "RED", "SKIPPED!", `Skipped the song`).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    distube.skip(message);
                    break;

                case "⏹":
                    reaction.users.remove(user).catch(console.error);
                    embedbuilder(client, message, "RED", "STOPPED!", `Left the channel`).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    distube.stop(message);
                    break;

                case "🔉":
                    reaction.users.remove(user).catch(console.error);
                    distube.setVolume(message, Number(queue.volume) - 10);
                    embedbuilder(client, message, "RED", "Volume!", `Redused the Volume to \`${queue.volume}\``).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    break;

                case "🔊":
                    reaction.users.remove(user).catch(console.error);
                    distube.setVolume(message, Number(queue.volume) + 10);
                    embedbuilder(client, message, "RED", "Volume!", `Raised the Volume to \`${queue.volume}\``).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    break;

                case "◀️":
                    reaction.users.remove(user).catch(console.error);
                    embedbuilder(client, message, "RED", "Seeked!", `Seeked the song for \`-10 seconds\``).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    let seektime = queue.currentTime - 10000;
                    if (seektime < 0) seektime = 0;
                    distube.seek(message, Number(seektime));
                    break;

                case "▶️":
                    reaction.users.remove(user).catch(console.error);
                    embedbuilder(client, message, "RED", "Seeked!", `Seeked the song for \`+10 seconds\``).then(msg => msg.delete({ timeout: 3000 }).catch(console.error))
                    let seektime2 = queue.currentTime + 10000;
                    console.log(seektime2);
                    if (seektime2 > queue.songs[0].duration) seektime2 = queue.songs[0].duration - 1;
                    distube.seek(message, Number(seektime2));
                    break;

                default:
                    reaction.users.remove(user).catch(console.error);
                    break;
            }
        });
        collector.on("end", () => {
            playingMessage.reactions.removeAll().catch(console.error);
            playingMessage.delete({ timeout: client.ws.ping }).catch(console.error);
        })
    } catch (error) {
        console.error
    }
}

//this function is for embed editing for the music info msg
function curembed(message) {
    try {
        let queue = distube.getQueue(message); //get the current queue
        let song = queue.songs[0];
        embed = new Discord.MessageEmbed()
            .setColor("#fffff0")
            .setTitle("Playing Song!")
            .setDescription(`Song: [\`${song.name}\`](${song.url})`)
            .addField("⏱ Duration:", `\`${queue.formattedCurrentTime} / ${song.formattedDuration}\``, true)
            .addField("🌀 Queue:", `\`${queue.songs.length} song(s) - ${queue.formattedDuration}\``, true)
            .addField("🔊 Volume:", `\`${queue.volume} %\``, true)
            .addField("♾ Loop:", `\`${queue.repeatMode ? queue.repeatMode === 2 ? "✅ Queue" : "✅ Song" : "❌"}\``, true)
            .addField("↪️ Autoplay:", `\`${queue.autoplay ? "✅" : "❌"}\``, true)
            .addField("❔ Filter:", `\`${queue.filter || "❌"}\``, true)
            .setFooter(client.user.username, client.user.displayAvatarURL())
            .setAuthor(message.author.tag, message.member.user.displayAvatarURL({ dynamic: true }), "https://harmonymusic.tk")
            .setThumbnail(song.thumbnail)
        return embed; //sending the new embed back
    } catch (error) {
        console.error
    }
}

//this function is for current Queue
function QueueEmbed(queue) {
    try {
        let embeds = [];
        let k = 10;
        //defining each Pages
        for (let i = 0; i < queue.length; i += 10) {
            const current = queue.slice(i, k)
            let j = i;
            k += 10;
            const info = current.map((track) => `**${++j} -** [\`${track.name}\`](${track.url})`).join("\n")
            const embed = new Discord.MessageEmbed()
                .setTitle("Server Queue")
                .setColor("#fffff0")
                .setDescription(`**Current Song - [\`${queue[0].name}\`](${queue[0].url})**\n\n${info}`)
                .setFooter(client.user.username, client.user.displayAvatarURL())
            embeds.push(embed);
        }
        //returning the Embed
        return embeds;
    } catch (error) {
        console.error
    }

}

//this function is for lyrics embed
function lyricsEmbed(message, lyrics, song) {
    try {
        let embeds = [];
        let k = 1000;

        for (let i = 0; i < lyrics.length; i += 1000) {
            const current = lyrics.slice(i, k);
            let j = i;
            k += 1000;
            const embed = new Discord.MessageEmbed()
                .setTitle("Lyrics - " + song.name)
                .setURL(song.url)
                .setThumbnail(song.thumbnail)
                .setColor("#fffff0")
                .setDescription(current)
            embeds.push(embed);
        }
        return embeds;
    } catch (error) {
        console.error
    }
}

/////////////
///GENERAL///
/////////////
//this function is for delaying stuff if needed
function delay(delayInms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(2);
        }, delayInms);
    });
}

//this function is for getting a random number
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

client.login(config.token);