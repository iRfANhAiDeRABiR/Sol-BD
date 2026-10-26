/**
 * Telegram Long-Polling Runner for SolutionsBD Local Development & Real-Time Processing
 *
 * Runs locally to receive and process Telegram inline button callbacks (Confirm / Invalid)
 * without needing a public domain or ngrok tunnel.
 *
 * Usage:
 *   node scripts/telegram-polling.mjs
 *   or: npm run telegram:bot
 */

import fs from 'node:fs';
import path from 'node:path';

// Helper to load env variables with Next.js priority (.env.local overrides .env)
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (process.env[key] === undefined) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const LOCAL_WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`
  : 'http://localhost:3000/api/telegram/webhook';

if (!BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN is not defined in .env or .env.local');
  process.exit(1);
}

console.log('🤖 [SolutionsBD Telegram Poller] Starting listener...');
console.log(`📡 Bot Token: ${BOT_TOKEN.slice(0, 10)}... (Admin Chat ID: ${ADMIN_CHAT_ID || 'all'})`);
console.log(`🌐 Target Endpoint: ${LOCAL_WEBHOOK_URL}`);

let isRunning = true;
let offset = 0;

async function clearWebhook() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
    const data = await res.json();
    if (data.ok) {
      console.log('✅ Active webhook cleared (polling mode enabled).');
    }
  } catch (err) {
    console.warn('⚠️ Could not clear existing webhook:', err.message);
  }
}

async function forwardToLocalWebhook(update) {
  try {
    const res = await fetch(LOCAL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(update),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log(`✅ Update ${update.update_id} processed by server:`, data);
    } else {
      console.warn(`⚠️ Local webhook returned ${res.status}:`, data);
    }
  } catch (err) {
    console.error(`❌ Could not forward update to local server at ${LOCAL_WEBHOOK_URL}:`, err.message);
    console.log('💡 Ensure `npm run dev` is running on http://localhost:3000');
  }
}

async function poll() {
  await clearWebhook();

  while (isRunning) {
    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=20`;
      const res = await fetch(url);
      
      if (!res.ok) {
        console.warn(`⚠️ Telegram getUpdates returned ${res.status}. Retrying in 3s...`);
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }

      const data = await res.json();
      if (!data.ok || !Array.isArray(data.result)) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      for (const update of data.result) {
        offset = update.update_id + 1;

        if (update.callback_query) {
          const cb = update.callback_query;
          const fromUser = cb.from?.username ? `@${cb.from.username}` : cb.from?.first_name || 'Admin';
          console.log(`📩 Received button click: "${cb.data}" from ${fromUser} (Chat: ${cb.message?.chat?.id})`);
          await forwardToLocalWebhook(update);
        }
      }
    } catch (err) {
      if (!isRunning) break;
      console.error('⚠️ Polling error:', err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

process.on('SIGINT', () => {
  console.log('\n🛑 Stopping Telegram poller...');
  isRunning = false;
  process.exit(0);
});

process.on('SIGTERM', () => {
  isRunning = false;
  process.exit(0);
});

poll();

