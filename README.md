# Warlords-agent-bot

A Discord bot for **Warlords** that delivers hero strategy tips, fetches the latest game news from an RSS feed, and posts daily scheduled announcements.

## Features

- `!hero-tip` – Get a random hero strategy tip
- `!news` – Fetch the latest Warlords news (via RSS)
- `!help` – List all available commands
- 🕘 Daily scheduled news post at 09:00 UTC (configurable)
- ⏱ Per-user rate limiting (3 commands / 10 s)

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Discord application & bot token](https://discord.com/developers/applications)

### Installation

```bash
git clone https://github.com/pacman1000/Warlords-agent-bot.git
cd Warlords-agent-bot
npm install
```

### Configuration

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Your Discord bot token |
| `CLIENT_ID` | Your Discord application client ID |
| `GUILD_ID` | The ID of your Discord server |
| `NEWS_FEED_URL` | URL of an RSS feed for Warlords news (optional) |
| `TIPS_CHANNEL_ID` | Channel ID for the daily news post (optional) |

### Running

```bash
npm start
# or
node index.js
```

The console will log `✅ Logged in as <BotName>#XXXX` when the bot is online.

## Commands

| Command | Description |
|---|---|
| `!hero-tip` | Random hero strategy tip |
| `!news` | Latest news from the configured RSS feed |
| `!help` | Command list |

## Deployment (24/7)

Host for free on [Railway](https://railway.app) or [Render](https://render.com):

1. Push this repo to GitHub.
2. Import the GitHub repo in Railway / Render.
3. Set the environment variables from `.env.example`.
4. The service will run `npm start` automatically.

## License

ISC
