require("dotenv").config();

const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require("discord.js");
const { DisTube, Events } = require("distube");
const { YouTubePlugin } = require("@distube/youtube");
const { SpotifyPlugin } = require("@distube/spotify");

const soundCloudModule = require("@distube/soundcloud");
const SoundCloudPlugin = soundCloudModule.default ?? soundCloudModule.SoundCloudPlugin ?? soundCloudModule;

const PREFIX = process.env.PREFIX || ".";
const TOKEN = process.env.TOKEN;
const DEFAULT_VOLUME = Number(process.env.DEFAULT_VOLUME || 50);

if (!TOKEN) {
  console.error("Missing TOKEN. Copy .env.example to .env and add your Discord bot token.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const distube = new DisTube(client, {
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
  plugins: [
    new YouTubePlugin(),
    new SpotifyPlugin(),
    new SoundCloudPlugin(),
  ],
});

client.once("ready", () => {
  console.log(`${client.user.tag} is online.`);
  client.user.setActivity(`${PREFIX}help | DisTube v5`, { type: ActivityType.Listening });
});

client.on("messageCreate", async message => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
  const command = args.shift()?.toLowerCase();
  if (!command) return;

  const queue = distube.getQueue(message.guildId);

  try {
    switch (command) {
      case "help":
      case "h":
      case "about":
      case "info":
        return sendHelp(message);

      case "ping":
        return message.reply(`Pong! ${Math.round(client.ws.ping)}ms`);

      case "play":
      case "p": {
        const voiceChannel = message.member?.voice?.channel;
        if (!voiceChannel) return message.reply("Join a voice channel first bro.");

        const query = args.join(" ");
        if (!query) return message.reply(`Use: \`${PREFIX}play <song name or url>\``);

        await message.channel.send(`🔎 Searching: \`${query}\``);
        await distube.play(voiceChannel, query, {
          message,
          textChannel: message.channel,
          member: message.member,
        });
        return;
      }

      case "playskip":
      case "ps": {
        const voiceChannel = message.member?.voice?.channel;
        if (!voiceChannel) return message.reply("Join a voice channel first bro.");

        const query = args.join(" ");
        if (!query) return message.reply(`Use: \`${PREFIX}playskip <song name or url>\``);

        await distube.play(voiceChannel, query, {
          message,
          textChannel: message.channel,
          member: message.member,
          skip: true,
        });
        return message.channel.send("⏭️ Playing your new song next.");
      }

      case "skip":
      case "s":
        if (!queue) return noQueue(message);
        await queue.skip();
        return message.channel.send("⏭️ Skipped.");

      case "previous":
      case "prev":
        if (!queue) return noQueue(message);
        await queue.previous();
        return message.channel.send("⏮️ Back to previous song.");

      case "stop":
      case "leave":
        if (!queue) return noQueue(message);
        await queue.stop();
        return message.channel.send("⏹️ Stopped and left the channel.");

      case "pause":
      case "pu":
        if (!queue) return noQueue(message);
        await queue.pause();
        return message.channel.send("⏸️ Paused.");

      case "resume":
      case "r":
      case "ru":
        if (!queue) return noQueue(message);
        await queue.resume();
        return message.channel.send("▶️ Resumed.");

      case "shuffle":
      case "mix":
        if (!queue) return noQueue(message);
        await queue.shuffle();
        return message.channel.send("🔀 Queue shuffled.");

      case "autoplay":
      case "ap":
        if (!queue) return noQueue(message);
        return message.channel.send(`♾️ Autoplay is now **${queue.toggleAutoplay() ? "ON" : "OFF"}**.`);

      case "loop":
      case "repeat": {
        if (!queue) return noQueue(message);
        const modeArg = args[0];
        const mode = ["0", "1", "2"].includes(modeArg) ? queue.setRepeatMode(Number(modeArg)) : queue.setRepeatMode();
        const modeText = ["Off", "Song", "Queue"][mode] || "Off";
        return message.channel.send(`🔁 Repeat mode: **${modeText}**`);
      }

      case "volume":
      case "vol": {
        if (!queue) return noQueue(message);
        const volume = Number(args[0]);
        if (!Number.isInteger(volume) || volume < 0 || volume > 100) {
          return message.reply("Volume must be a number from 0 to 100.");
        }
        queue.setVolume(volume);
        return message.channel.send(`🔊 Volume set to **${volume}%**.`);
      }

      case "seek": {
        if (!queue) return noQueue(message);
        const seconds = parseTimeToSeconds(args[0]);
        if (seconds === null) return message.reply(`Use: \`${PREFIX}seek 90\` or \`${PREFIX}seek 1:30\``);
        await queue.seek(seconds);
        return message.channel.send(`⏩ Seeked to **${formatSeconds(seconds)}**.`);
      }

      case "jump":
      case "ju": {
        if (!queue) return noQueue(message);
        const position = Number(args[0]);
        if (!Number.isInteger(position) || position === 0) return message.reply(`Use: \`${PREFIX}jump <queue number>\``);
        await queue.jump(position);
        return message.channel.send(`⏭️ Jumped to song position **${position}**.`);
      }

      case "queue":
      case "q":
      case "qu":
        if (!queue) return noQueue(message);
        return sendQueue(message, queue);

      case "nowplaying":
      case "np":
        if (!queue) return noQueue(message);
        return sendNowPlaying(message, queue);

      case "status":
      case "check":
        if (!queue) return noQueue(message);
        return sendStatus(message, queue);

      case "filter":
      case "filters":
        if (!queue) return noQueue(message);
        return handleFilter(message, queue, args);

      default:
        return;
    }
  } catch (error) {
    console.error(error);
    return message.channel.send(`❌ ${safeError(error)}`);
  }
});

distube
  .on(Events.INIT_QUEUE, queue => {
    queue.setVolume(Math.min(Math.max(DEFAULT_VOLUME, 0), 100));
  })
  .on(Events.PLAY_SONG, (queue, song) => {
    queue.textChannel?.send({ embeds: [songEmbed(queue, song, "🎶 Now playing")] });
  })
  .on(Events.ADD_SONG, (queue, song) => {
    queue.textChannel?.send(`➕ Added **${song.name || song.url || "Unknown song"}** - \`${song.formattedDuration}\``);
  })
  .on(Events.ADD_LIST, (queue, playlist) => {
    queue.textChannel?.send(`📃 Added playlist **${playlist.name}** with **${playlist.songs.length}** songs.`);
  })
  .on(Events.EMPTY, queue => {
    queue.textChannel?.send("👋 Voice channel is empty, leaving.");
  })
  .on(Events.FINISH, queue => {
    queue.textChannel?.send("✅ Queue finished.");
  })
  .on(Events.NO_RELATED, (queue, error) => {
    queue.textChannel?.send(`No related song found: ${safeError(error)}`);
  })
  .on(Events.ERROR, (error, queue) => {
    console.error(error);
    queue?.textChannel?.send(`❌ ${safeError(error)}`);
  });

function sendHelp(message) {
  const embed = new EmbedBuilder()
    .setColor(0x00aeef)
    .setTitle("WinDy Music Commands")
    .setDescription(`Prefix: \`${PREFIX}\``)
    .addFields(
      {
        name: "Music",
        value: [
          `\`${PREFIX}play <name/url>\` - Play a song`,
          `\`${PREFIX}playskip <name/url>\` - Play and skip current song`,
          `\`${PREFIX}nowplaying\` - Show current song`,
          `\`${PREFIX}queue\` - Show queue`,
          `\`${PREFIX}skip\` / \`${PREFIX}previous\` - Move songs`,
          `\`${PREFIX}pause\` / \`${PREFIX}resume\` - Pause/resume`,
          `\`${PREFIX}stop\` - Stop and leave`,
        ].join("\n"),
      },
      {
        name: "Controls",
        value: [
          `\`${PREFIX}volume <0-100>\``,
          `\`${PREFIX}seek <seconds|mm:ss>\``,
          `\`${PREFIX}loop [0|1|2]\` - Off/song/queue`,
          `\`${PREFIX}autoplay\``,
          `\`${PREFIX}shuffle\``,
          `\`${PREFIX}filter <name|off|list>\``,
          `\`${PREFIX}status\``,
        ].join("\n"),
      },
    )
    .setFooter({ text: "Powered by discord.js v14 + DisTube v5" });

  return message.channel.send({ embeds: [embed] });
}

function sendQueue(message, queue) {
  const songs = queue.songs
    .slice(0, 10)
    .map((song, index) => {
      const label = index === 0 ? "▶️" : `${index}.`;
      return `${label} ${formatSongLink(song)} - \`${song.formattedDuration}\``;
    })
    .join("\n");

  const extra = queue.songs.length > 10 ? `\n...and ${queue.songs.length - 10} more song(s)` : "";
  const embed = new EmbedBuilder()
    .setColor(0x00aeef)
    .setTitle("Server Queue")
    .setDescription((songs || "Queue is empty.") + extra)
    .setFooter({ text: `Total duration: ${queue.formattedDuration}` });

  return message.channel.send({ embeds: [embed] });
}

function sendNowPlaying(message, queue) {
  const song = queue.songs[0];
  if (!song) return noQueue(message);
  return message.channel.send({ embeds: [songEmbed(queue, song, "🎧 Now playing")] });
}

function sendStatus(message, queue) {
  const repeatText = ["Off", "Song", "Queue"][queue.repeatMode] || "Off";
  const filters = queue.filters.names.join(", ") || "Off";
  const embed = new EmbedBuilder()
    .setColor(0x00aeef)
    .setTitle("Player Status")
    .addFields(
      { name: "Volume", value: `${queue.volume}%`, inline: true },
      { name: "Repeat", value: repeatText, inline: true },
      { name: "Autoplay", value: queue.autoplay ? "On" : "Off", inline: true },
      { name: "Paused", value: queue.paused ? "Yes" : "No", inline: true },
      { name: "Filters", value: filters, inline: true },
      { name: "Queue", value: `${queue.songs.length} song(s)`, inline: true },
    );

  return message.channel.send({ embeds: [embed] });
}

function handleFilter(message, queue, args) {
  const filterName = args[0]?.toLowerCase();
  const available = Object.keys(distube.filters).sort();

  if (!filterName || filterName === "list") {
    return message.channel.send(`Available filters:\n\`${available.join("`, `")}\``);
  }

  if (["off", "clear", "none"].includes(filterName)) {
    queue.filters.clear();
    return message.channel.send("🎚️ Filters cleared.");
  }

  if (!available.includes(filterName)) {
    return message.reply(`Unknown filter. Use \`${PREFIX}filter list\`.`);
  }

  if (queue.filters.has(filterName)) {
    queue.filters.remove(filterName);
    return message.channel.send(`🎚️ Removed filter: **${filterName}**`);
  }

  queue.filters.add(filterName);
  return message.channel.send(`🎚️ Added filter: **${filterName}**`);
}

function songEmbed(queue, song, title) {
  const requester = song.user?.toString?.() || song.member?.toString?.() || "Unknown";
  const embed = new EmbedBuilder()
    .setColor(0x00aeef)
    .setTitle(title)
    .setDescription(formatSongLink(song))
    .addFields(
      { name: "Duration", value: `${queue.formattedCurrentTime} / ${song.formattedDuration}`, inline: true },
      { name: "Requested by", value: requester, inline: true },
      { name: "Volume", value: `${queue.volume}%`, inline: true },
    );

  if (song.thumbnail) embed.setThumbnail(song.thumbnail);
  return embed;
}

function formatSongLink(song) {
  const name = song.name || song.url || song.id || "Unknown song";
  return song.url ? `[${name}](${song.url})` : name;
}

function noQueue(message) {
  return message.channel.send("Nothing is playing right now.");
}

function parseTimeToSeconds(value) {
  if (!value) return null;
  if (/^\d+$/.test(value)) return Number(value);

  const parts = value.split(":").map(Number);
  if (parts.some(Number.isNaN) || parts.length < 2 || parts.length > 3) return null;

  return parts.reduce((total, part) => total * 60 + part, 0);
}

function formatSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

function safeError(error) {
  return (error?.message || String(error)).slice(0, 1900);
}

client.login(TOKEN);
