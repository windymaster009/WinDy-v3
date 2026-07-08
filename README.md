# WinDy Music Bot

A plug-and-play Discord music bot powered by `discord.js` v14 and `DisTube` v5.

## Requirements

- Node.js `22.12.0` or newer
- A Discord bot token
- Message Content Intent enabled in the Discord Developer Portal

## Setup

```bash
git clone https://github.com/windymaster009/WinDy-v3.git
cd WinDy-v3
npm install
cp .env.example .env
```

Open `.env` and add your real token:

```env
TOKEN=your_discord_bot_token_here
PREFIX=.
DEFAULT_VOLUME=50
```

Start the bot:

```bash
npm start
```

For development:

```bash
npm run dev
```

Check syntax without running the bot:

```bash
npm run check
```

## Commands

Default prefix: `.`

| Command | Description |
| --- | --- |
| `.help` | Show command list |
| `.ping` | Check bot latency |
| `.play <name/url>` / `.p` | Play a song |
| `.playskip <name/url>` / `.ps` | Play a new song and skip current |
| `.nowplaying` / `.np` | Show current song |
| `.queue` / `.q` | Show queue |
| `.skip` / `.s` | Skip current song |
| `.previous` / `.prev` | Play previous song |
| `.pause` | Pause music |
| `.resume` | Resume music |
| `.stop` / `.leave` | Stop and leave voice channel |
| `.shuffle` / `.mix` | Shuffle queue |
| `.autoplay` / `.ap` | Toggle autoplay |
| `.loop [0/1/2]` | Repeat off/song/queue |
| `.volume <0-100>` | Set volume |
| `.seek <seconds/mm:ss>` | Seek current song |
| `.filter list` | Show filters |
| `.filter <name>` | Toggle a filter |
| `.filter off` | Clear filters |
| `.status` | Show player status |

## Important security note

Never commit your real Discord token. If a token was committed before, reset it in the Discord Developer Portal before running the bot again.

## Notes

This version follows the current DisTube v5 style:

- Uses `messageCreate` instead of the old `message` event.
- Uses `GatewayIntentBits` from `discord.js` v14.
- Uses official DisTube plugins for YouTube, Spotify, and SoundCloud.
- Uses queue methods like `queue.skip()`, `queue.pause()`, and `queue.setVolume()` instead of deprecated DisTube shortcut methods.
