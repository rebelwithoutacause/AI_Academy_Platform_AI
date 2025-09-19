// services/telegram.js - Telegram service with mock and production support
const fetch = require('node-fetch');

const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development' || process.env.SKIP_DB === 'true';

/**
 * Send OTP via Telegram (production) or console (development)
 * @param {string} chatId - Telegram chat ID
 * @param {string} code - 6-digit OTP code
 * @param {string} userEmail - User email for logging (optional)
 * @returns {Promise<Object>} Result object with success status
 */
async function sendTelegramOtp(chatId, code, userEmail = null) {
  // Development/Testing: Log to console
  if (!isProd || isDev) {
    console.log('\n📱 TELEGRAM 2FA MOCK - OTP SENT');
    console.log('===================================');
    console.log(`💬 Chat ID: ${chatId}`);
    console.log(`🔢 OTP Code: ${code}`);
    console.log(`⏰ Expires: 5 minutes`);
    console.log(`👤 User: ${userEmail || 'Unknown'}`);
    console.log(`🕐 Time: ${new Date().toLocaleString()}`);
    console.log('===================================\n');

    return {
      success: true,
      method: 'mock',
      message: 'OTP logged to console (development mode)'
    };
  }

  // Production: Send via Telegram Bot API
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    const message = generateTelegramMessage(code);
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.description || 'Telegram API error');
    }

    console.log(`📱 Telegram message sent successfully to chat ${chatId}. MessageId: ${result.result.message_id}`);

    return {
      success: true,
      method: 'telegram',
      messageId: result.result.message_id,
      message: 'OTP sent via Telegram'
    };

  } catch (error) {
    console.error('Telegram sending error:', error);
    throw new Error(`Failed to send Telegram message: ${error.message}`);
  }
}

/**
 * Generate Telegram message for OTP
 * @param {string} code - OTP code
 * @returns {string} Formatted Telegram message
 */
function generateTelegramMessage(code) {
  return `
🔐 *${process.env.APP_NAME || 'AI Tools Platform'} Verification*

Your verification code is:

\`${code}\`

⚠️ *Important:*
• This code expires in *5 minutes*
• Use it only once for login
• Keep it confidential

If you didn't request this code, please ignore this message.
  `.trim();
}

/**
 * Send a link token to user via Telegram for account linking
 * @param {string} chatId - Telegram chat ID
 * @param {string} linkToken - Generated link token
 * @param {string} userEmail - User email
 * @returns {Promise<Object>} Result object
 */
async function sendTelegramLinkToken(chatId, linkToken, userEmail = null) {
  if (!isProd || isDev) {
    console.log('\n📱 TELEGRAM LINK MOCK');
    console.log('=====================');
    console.log(`💬 Chat ID: ${chatId}`);
    console.log(`🔗 Link Token: ${linkToken}`);
    console.log(`👤 User: ${userEmail || 'Unknown'}`);
    console.log('=====================\n');

    return {
      success: true,
      method: 'mock',
      message: 'Link token logged to console (development mode)'
    };
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    const message = `
🔗 *Account Linking*

Please confirm linking your Telegram account to ${process.env.APP_NAME || 'AI Tools Platform'}:

Link Token: \`${linkToken}\`

Send this command to complete linking:
/link ${linkToken}

This token expires in 10 minutes.
    `.trim();

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.description || 'Telegram API error');
    }

    return {
      success: true,
      method: 'telegram',
      messageId: result.result.message_id,
      message: 'Link token sent via Telegram'
    };

  } catch (error) {
    console.error('Telegram link token error:', error);
    throw new Error(`Failed to send link token: ${error.message}`);
  }
}

/**
 * Get Telegram bot info (for testing connection)
 * @returns {Promise<Object>} Bot information
 */
async function getBotInfo() {
  if (!isProd || isDev) {
    return {
      success: true,
      method: 'mock',
      bot: {
        id: 'mock-bot-id',
        is_bot: true,
        first_name: 'Mock Bot',
        username: 'mock_bot'
      }
    };
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    const url = `https://api.telegram.org/bot${token}/getMe`;
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.description || 'Failed to get bot info');
    }

    return {
      success: true,
      method: 'telegram',
      bot: result.result
    };

  } catch (error) {
    console.error('Get bot info error:', error);
    throw new Error(`Failed to get bot info: ${error.message}`);
  }
}

/**
 * Test Telegram bot configuration
 * @returns {Promise<boolean>} True if bot is configured correctly
 */
async function testTelegramConfig() {
  try {
    const info = await getBotInfo();
    if (info.success) {
      console.log('📱 Telegram bot configuration verified successfully');
      if (info.bot && info.bot.username) {
        console.log(`📱 Bot: @${info.bot.username} (${info.bot.first_name})`);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('📱 Telegram configuration test failed:', error.message);
    return false;
  }
}

/**
 * Generate deep link for Telegram bot
 * @param {string} linkToken - Link token for account linking
 * @returns {string} Telegram deep link URL
 */
function generateTelegramDeepLink(linkToken) {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  if (!botUsername) {
    console.warn('TELEGRAM_BOT_USERNAME not configured, cannot generate deep link');
    return null;
  }

  return `https://t.me/${botUsername}?start=link_${linkToken}`;
}

module.exports = {
  sendTelegramOtp,
  sendTelegramLinkToken,
  getBotInfo,
  testTelegramConfig,
  generateTelegramDeepLink,
  generateTelegramMessage
};