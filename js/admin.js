const ADMIN_PASSWORD = 'anna_anna';
const AUTH_KEY = 'anna_admin_auth';
const TOKEN_KEY = 'anna_github_token';
const TOKEN_REMEMBER_KEY = 'anna_github_token_remember';

const TYPE_LABELS = {
  quote: 'Цитата',
  topic: 'Тема',
};

let entries = [];
let isPublishing = false;

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});

function isTokenRemembered() {
  return localStorage.getItem(TOKEN_REMEMBER_KEY) === 'true';
}

function getToken() {
  if (isTokenRemembered()) {
    return localStorage.getItem(TOKEN_KEY) || '';
  }
  return sessionStorage.getItem(TOKEN_KEY) || '';
}

function saveTokenValue(token, remember) {
  sessionStorage.removeItem(TOKEN_KEY);

  if (remember && token) {
    localStorage.setItem(TOKEN_REMEMBER_KEY, 'true');
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  localStorage.removeItem(TOKEN_REMEMBER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
}

function clearStoredToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_REMEMBER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

function initAuth() {
  const loginForm = document.getElementById('login-form');
  const loginScreen = document.getElementById('admin-login');
  const tokenInput = document.getElementById('github-token');
  const rememberCheckbox = document.getElementById('remember-token');

  if (rememberCheckbox) {
    rememberCheckbox.checked = isTokenRemembered() || rememberCheckbox.checked;
  }

  if (tokenInput && isTokenRemembered()) {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      tokenInput.value = savedToken;
      tokenInput.placeholder = 'Токен сохранён на этом устройстве';
    }
  }

  if (sessionStorage.getItem(AUTH_KEY) === 'true') {
    showAdminPanel();
    return;
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    const tokenFromInput = document.getElementById('github-token').value.trim();
    const remember = rememberCheckbox?.checked ?? true;
    const token = tokenFromInput || getToken();
    const error = document.getElementById('login-error');

    if (password !== ADMIN_PASSWORD) {
      error.textContent = 'Неверный пароль';
      error.classList.add('is-visible');
      document.getElementById('admin-password').value = '';
      return;
    }

    sessionStorage.setItem(AUTH_KEY, 'true');
    if (token) saveTokenValue(token, remember);
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
  document.getElementById('forget-token-btn').addEventListener('click', forgetToken);
  document.getElementById('entry-date').valueAsDate = new Date();
  updateTypeHints('quote', document.getElementById('topic-hint'), document.getElementById('text-hint'));
  updatePublishStatus();
  updateTokenCardDesc();
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

function initTokenPanel() {
  const input = document.getElementById('token-input');
  const rememberCheckbox = document.getElementById('token-remember');
  const token = getToken();

  if (rememberCheckbox) {
    rememberCheckbox.checked = isTokenRemembered();
  }

  if (input && token) {
    input.value = token;
    input.placeholder = isTokenRemembered()
      ? 'Токен сохранён на этом устройстве'
      : 'Вставьте токен';
  }
}

function updateTokenCardDesc() {
  const desc = document.getElementById('token-card-desc');
  if (!desc) return;

  desc.textContent = isTokenRemembered() && getToken()
    ? 'Токен сохранён на этом устройстве — достаточно вводить только пароль.'
    : 'Нужен для автопубликации на сайте.';
}

function saveToken() {
  const token = document.getElementById('token-input').value.trim();
  const remember = document.getElementById('token-remember')?.checked ?? true;

  if (!token) {
    showToast('Вставьте GitHub-токен', 'error');
    return;
  }

  saveTokenValue(token, remember);
  showToast(
    remember ? 'Токен сохранён на устройстве' : 'Токен сохранён до закрытия вкладки',
    'success'
  );
  updatePublishStatus();
  updateTokenCardDesc();
}

function forgetToken() {
  if (!confirm('Удалить сохранённый токен с этого устройства?')) return;

  clearStoredToken();

  const input = document.getElementById('token-input');
  if (input) {
    input.value = '';
    input.placeholder = 'Вставьте токен';
  }

  const rememberCheckbox = document.getElementById('token-remember');
  if (rememberCheckbox) rememberCheckbox.checked = false;

  updatePublishStatus();
  updateTokenCardDesc();
  showToast('Токен удалён с этого устройства', 'info');
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
      const label = TYPE_LABELS[e.type] || e.type;
      const linkPreview = e.link
        ? e.link.replace(/^https?:\/\//, '').slice(0, 40)
        : 'без ссылки';
      return `
        <article class="admin-entry">
          <div class="admin-entry__main">
            <span class="admin-entry__badge admin-entry__badge--${e.type}">${label}</span>
            <h4 class="admin-entry__title">${escapeHtml(e.topic || e.text.slice(0, 40))}</h4>
            <p class="admin-entry__meta">${escapeHtml(linkPreview)} · ${formatDate(e.date)}</p>
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
    link: document.getElementById('entry-link').value.trim(),
    linkLabel: document.getElementById('entry-link-label').value.trim(),
    date: document.getElementById('entry-date').value,
  };

  if (!entry.text) {
    showToast('Введите текст записи', 'error');
    return;
  }

  if (!entry.link) {
    showToast('Укажите ссылку на пост', 'error');
    return;
  }

  if (!entry.linkLabel) delete entry.linkLabel;

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
  document.getElementById('entry-link').value = entry.link || '';
  document.getElementById('entry-link-label').value = entry.linkLabel || '';
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
