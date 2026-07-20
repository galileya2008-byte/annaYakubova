const ADMIN_PASSWORD = 'anna_anna';
const AUTH_KEY = 'anna_admin_auth';
const TOKEN_KEY = 'anna_github_token';

const TYPE_LABELS = {
  quote: 'Цитата',
  topic: 'Тема',
};

let entries = [];
let isPublishing = false;

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});

function initAuth() {
  const loginForm = document.getElementById('login-form');
  const loginScreen = document.getElementById('admin-login');

  if (sessionStorage.getItem(AUTH_KEY) === 'true') {
    showAdminPanel();
    return;
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    const token = document.getElementById('github-token').value.trim();
    const error = document.getElementById('login-error');

    if (password !== ADMIN_PASSWORD) {
      error.textContent = 'Неверный пароль';
      error.classList.add('is-visible');
      document.getElementById('admin-password').value = '';
      return;
    }

    sessionStorage.setItem(AUTH_KEY, 'true');
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    error.classList.remove('is-visible');
    showAdminPanel();
  });

  function showAdminPanel() {
    loginScreen.style.display = 'none';
    document.getElementById('admin-panel').classList.add('is-visible');
    initAdmin();
  }
}

async function initAdmin() {
  initTypeToggle();
  initTokenPanel();
  await loadEntries();
  document.getElementById('entry-form').addEventListener('submit', handleSubmit);
  document.getElementById('cancel-btn').addEventListener('click', resetForm);
  document.getElementById('save-token-btn').addEventListener('click', saveToken);
  document.getElementById('entry-date').valueAsDate = new Date();
  updateTypeHints('quote', document.getElementById('topic-hint'), document.getElementById('text-hint'));
  updatePublishStatus();
}

function initTypeToggle() {
  const typeInput = document.getElementById('entry-type');
  const topicHint = document.getElementById('topic-hint');
  const textHint = document.getElementById('text-hint');

  document.querySelectorAll('[data-type]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-type]').forEach((b) => b.classList.remove('type-toggle__btn--active'));
      btn.classList.add('type-toggle__btn--active');
      typeInput.value = btn.dataset.type;
      updateTypeHints(typeInput.value, topicHint, textHint);
    });
  });
}

function updateTypeHints(type, topicHint, textHint) {
  if (type === 'quote') {
    topicHint.textContent = 'Необязательно — тема или настроение цитаты';
    textHint.textContent = 'Короткая цитата или мысль (1–2 предложения)';
  } else {
    topicHint.textContent = 'Заголовок темы — о чём запись';
    textHint.textContent = 'Краткое описание — куда ведёт ссылка в соцсети';
  }
}

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) || '';
}

function initTokenPanel() {
  const input = document.getElementById('token-input');
  const token = getToken();
  if (input && token) input.value = token;
}

function saveToken() {
  const token = document.getElementById('token-input').value.trim();
  if (!token) {
    showToast('Вставьте GitHub-токен', 'error');
    return;
  }
  sessionStorage.setItem(TOKEN_KEY, token);
  showToast('Токен сохранён', 'success');
  updatePublishStatus();
}

async function githubGetFile(path, token) {
  const { owner, repo } = SITE_CONFIG.github;
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function githubPutFile(path, contentBase64, message, token, sha = null) {
  const { owner, repo } = SITE_CONFIG.github;
  const body = { message, content: contentBase64 };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function publishDiary() {
  const token = getToken();
  if (!token) {
    showToast('Подключите GitHub-токен', 'error');
    updatePublishStatus('error');
    return false;
  }

  const { diaryPath } = SITE_CONFIG.github;
  const json = JSON.stringify({ entries }, null, 2);
  const content = btoa(unescape(encodeURIComponent(json)));

  isPublishing = true;
  updatePublishStatus('saving');

  try {
    const existing = await githubGetFile(diaryPath, token);
    await githubPutFile(
      diaryPath,
      content,
      'Обновление дневника',
      token,
      existing?.sha || null
    );
    updatePublishStatus('saved');
    showToast('Опубликовано на сайте', 'success');
    return true;
  } catch (err) {
    console.error(err);
    updatePublishStatus('error');
    showToast('Ошибка публикации — проверьте токен', 'error');
    return false;
  } finally {
    isPublishing = false;
  }
}

async function loadEntries() {
  try {
    const res = await fetch(`${SITE_CONFIG.github.diaryPath}?t=${Date.now()}`);
    const data = await res.json();
    entries = data.entries || [];
  } catch {
    entries = [];
  }
  renderEntriesList();
}

function renderEntriesList() {
  const list = document.getElementById('entries-list');
  if (entries.length === 0) {
    list.innerHTML = '<p class="admin-empty">Записей пока нет</p>';
    return;
  }

  list.innerHTML = entries
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((e) => {
      const social = SITE_CONFIG.social[e.social]?.label || e.social;
      return `
        <article class="admin-entry">
          <div class="admin-entry__main">
            <span class="admin-entry__badge admin-entry__badge--${e.type}">${TYPE_LABELS[e.type] || e.type}</span>
            <h4 class="admin-entry__title">${escapeHtml(e.topic || e.text.slice(0, 40))}</h4>
            <p class="admin-entry__meta">${social} · ${formatDate(e.date)}</p>
          </div>
          <div class="admin-entry__actions">
            <button type="button" class="admin-btn admin-btn--edit" data-id="${escapeAttr(e.id)}">Изменить</button>
            <button type="button" class="admin-btn admin-btn--delete" data-id="${escapeAttr(e.id)}">Удалить</button>
          </div>
        </article>
      `;
    })
    .join('');

  list.querySelectorAll('.admin-btn--edit').forEach((btn) => {
    btn.addEventListener('click', () => editEntry(btn.dataset.id));
  });
  list.querySelectorAll('.admin-btn--delete').forEach((btn) => {
    btn.addEventListener('click', () => deleteEntry(btn.dataset.id));
  });
}

async function handleSubmit(e) {
  e.preventDefault();
  if (isPublishing) return;

  const id = document.getElementById('entry-id').value;
  const entry = {
    id: id || String(Date.now()),
    type: document.getElementById('entry-type').value,
    topic: document.getElementById('entry-topic').value.trim(),
    text: document.getElementById('entry-text').value.trim(),
    social: document.getElementById('entry-social').value,
    date: document.getElementById('entry-date').value,
  };

  if (!entry.text) {
    showToast('Введите текст записи', 'error');
    return;
  }

  if (id) {
    const idx = entries.findIndex((item) => item.id === id);
    if (idx !== -1) entries[idx] = entry;
  } else {
    entries.push(entry);
  }

  const ok = await publishDiary();
  if (!ok) return;

  resetForm();
  renderEntriesList();
}

function editEntry(id) {
  const entry = entries.find((e) => e.id === id);
  if (!entry) return;

  document.getElementById('entry-id').value = entry.id;
  document.getElementById('entry-type').value = entry.type || 'quote';
  document.getElementById('entry-topic').value = entry.topic || '';
  document.getElementById('entry-text').value = entry.text || '';
  document.getElementById('entry-social').value = entry.social || 'telegram';
  document.getElementById('entry-date').value = entry.date;

  document.querySelectorAll('[data-type]').forEach((btn) => {
    btn.classList.toggle('type-toggle__btn--active', btn.dataset.type === entry.type);
  });
  updateTypeHints(entry.type, document.getElementById('topic-hint'), document.getElementById('text-hint'));

  document.getElementById('submit-btn').textContent = 'Сохранить';
  document.getElementById('cancel-btn').style.display = 'inline-flex';
  document.getElementById('form-title').textContent = 'Редактирование';
}

async function deleteEntry(id) {
  if (!confirm('Удалить запись с сайта?')) return;
  entries = entries.filter((e) => e.id !== id);
  const ok = await publishDiary();
  if (ok) renderEntriesList();
}

function resetForm() {
  document.getElementById('entry-form').reset();
  document.getElementById('entry-id').value = '';
  document.getElementById('entry-type').value = 'quote';
  document.getElementById('entry-date').valueAsDate = new Date();
  document.querySelectorAll('[data-type]').forEach((btn) => {
    btn.classList.toggle('type-toggle__btn--active', btn.dataset.type === 'quote');
  });
  updateTypeHints('quote', document.getElementById('topic-hint'), document.getElementById('text-hint'));
  document.getElementById('submit-btn').textContent = 'Опубликовать';
  document.getElementById('cancel-btn').style.display = 'none';
  document.getElementById('form-title').textContent = 'Новая запись';
}

function updatePublishStatus(state) {
  const el = document.getElementById('publish-status');
  if (!el) return;

  if (!getToken()) {
    el.className = 'publish-status publish-status--warn';
    el.textContent = 'Подключите GitHub-токен';
    return;
  }

  const states = {
    saving: ['publish-status--saving', 'Публикация…'],
    saved: ['publish-status--ok', 'На сайте'],
    error: ['publish-status--error', 'Ошибка'],
  };

  if (state && states[state]) {
    el.className = `publish-status ${states[state][0]}`;
    el.textContent = states[state][1];
  } else {
    el.className = 'publish-status publish-status--ok';
    el.textContent = 'GitHub подключён';
  }
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('admin-toast');
  toast.textContent = message;
  toast.className = `admin-toast admin-toast--${type} admin-toast--visible`;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('admin-toast--visible'), 4000);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return escapeHtml(str);
}
