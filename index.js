require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { RateLimiter } = require('discord.js-rate-limiter');
const axios = require('axios');
const cron = require('node-cron');
const xml2js = require('xml2js');

// ── Hero tips data ─────────────────────────────────────────────────────────────
const HERO_TIPS = [
  'Use terrain to your advantage – high ground increases your unit range.',
  'Prioritise capturing resource nodes early to out-economy your opponent.',
  'Scouting is key: keep a unit on each entrance to spot enemy movements.',
  'Save hero abilities for decisive fights – don\'t waste cooldowns on stragglers.',
  'Pair tanky heroes with ranged supporters for a balanced front line.',
  'Flanking can break a turtled enemy formation quickly.',
  'Never split your forces when the enemy is concentrated – fight together.',
  'Research upgrades as soon as you have surplus resources.',
  'Ward map choke-points so you get early warning of incoming attacks.',
  'A coordinated push on two fronts forces the enemy to split and weaken.',
];

// ── Rate limiter (3 commands per 10 seconds per user) ─────────────────────────
const rateLimiter = new RateLimiter(3, 10_000);

// ── Discord client ─────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ── Helper: fetch & parse RSS feed ────────────────────────────────────────────
async function fetchLatestNews() {
  const feedUrl = process.env.NEWS_FEED_URL;
  if (!feedUrl) return null;

  const response = await axios.get(feedUrl, { timeout: 8_000 });
  const result = await xml2js.parseStringPromise(response.data, {
    explicitArray: false,
  });

  const items = result?.rss?.channel?.item;
  if (!items) return null;

  const latest = Array.isArray(items) ? items[0] : items;
  return {
    title: latest.title || 'No title',
    link: latest.link || '',
    description: latest.description
      ? String(latest.description).replace(/[<>]/g, '').slice(0, 200)
      : '',
  };
}

// ── Ready event ───────────────────────────────────────────────────────────────
client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅  Logged in as ${readyClient.user.tag}`);

  // Schedule a daily news post at 09:00 UTC if TIPS_CHANNEL_ID is set
  const channelId = process.env.TIPS_CHANNEL_ID;
  if (channelId) {
    cron.schedule('0 9 * * *', async () => {
      const channel = readyClient.channels.cache.get(channelId);
      if (!channel) return;

      try {
        const news = await fetchLatestNews();
        if (news) {
          await channel.send(
            `📰 **Warlords News**: ${news.title}\n${news.description}\n🔗 ${news.link}`,
          );
        }
      } catch (err) {
        console.error('Scheduled news post failed:', err.message);
      }
    });

    console.log(`🕘  Daily news scheduled for channel ${channelId}`);
  }
});

// ── Message event ─────────────────────────────────────────────────────────────
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim().toLowerCase();

  // Only process recognised commands
  const isCommand = ['!hero-tip', '!news', '!help'].includes(content);
  if (!isCommand) return;

  // Rate-limit check (applied only to actual commands)
  const limited = rateLimiter.take(message.author.id);
  if (limited) {
    return message.reply('⏳ You\'re sending commands too quickly. Please slow down.');
  }

  // !hero-tip  – reply with a random hero tip
  if (content === '!hero-tip') {
    const tip = HERO_TIPS[Math.floor(Math.random() * HERO_TIPS.length)];
    return message.reply(`🗡️ **Hero Tip:** ${tip}`);
  }

  // !news  – fetch latest RSS news on demand
  if (content === '!news') {
    try {
      const news = await fetchLatestNews();
      if (!news) {
        return message.reply('ℹ️ No news feed configured or no articles found.');
      }
      return message.reply(
        `📰 **Latest Warlords News**\n**${news.title}**\n${news.description}\n🔗 ${news.link}`,
      );
    } catch (err) {
      console.error('!news command error:', err.message);
      return message.reply('⚠️ Failed to fetch news. Please try again later.');
    }
  }

  // !help  – list available commands
  if (content === '!help') {
    return message.reply(
      '**Warlords Bot Commands**\n' +
      '`!hero-tip` – Get a random hero strategy tip\n' +
      '`!news`     – Fetch the latest game news\n' +
      '`!help`     – Show this help message',
    );
  }
});

// ── Start the bot ─────────────────────────────────────────────────────────────
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('❌  DISCORD_TOKEN is not set. Copy .env.example to .env and fill in your token.');
  process.exit(1);
}

client.login(token);
