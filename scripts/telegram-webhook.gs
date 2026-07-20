/**
 * Google Apps Script — отправка заявок с сайта в Telegram Анне.
 *
 * НАСТРОЙКА (один раз):
 * 1. Telegram: создайте бота у @BotFather, сохраните токен.
 * 2. Напишите боту /start с аккаунта Анны.
 * 3. Откройте https://api.telegram.org/bot<ТОКЕН>/getUpdates
 *    и найдите "chat":{"id":123456789} — это CHAT_ID.
 * 4. script.google.com → Новый проект → вставьте этот код.
 * 5. Проект → Настройки → Свойства скрипта → добавьте:
 *    BOT_TOKEN = ваш токен
 *    CHAT_ID = id Анны
 * 6. Развернуть → Новое развёртывание → Веб-приложение:
 *    Выполнять от имени: меня
 *    Доступ: все пользователи
 * 7. Скопируйте URL (.../exec) в js/config.js → form.webhookUrl
 */

function doPost(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    const botToken = props.getProperty('BOT_TOKEN');
    const chatId = props.getProperty('CHAT_ID');

    if (!botToken || !chatId) {
      return jsonResponse({ ok: false, error: 'Bot not configured' });
    }

    const data = JSON.parse(e.postData.contents);
    const text = formatMessage(data);

    const tgUrl = 'https://api.telegram.org/bot' + botToken + '/sendMessage';
    const response = UrlFetchApp.fetch(tgUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
      muteHttpExceptions: true,
    });

    const result = JSON.parse(response.getContentText());
    if (!result.ok) {
      return jsonResponse({ ok: false, error: result.description });
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function formatMessage(data) {
  const lines = [
    '📝 <b>Новая заявка с сайта</b>',
    '',
    '<b>Направление:</b> ' + escapeHtml(data.service || '—'),
    '<b>Имя:</b> ' + escapeHtml(data.name || '—'),
    '<b>Контакт:</b> ' + escapeHtml(data.contact || '—'),
  ];

  if (data.message) {
    lines.push('<b>Сообщение:</b> ' + escapeHtml(data.message));
  }

  lines.push('', '<i>' + new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }) + ' (МСК)</i>');
  return lines.join('\n');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doGet() {
  return jsonResponse({ ok: true, status: 'Form webhook is running' });
}
