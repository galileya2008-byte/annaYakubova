const TYPE_LABELS = {
  quote: 'Цитата',
  topic: 'Тема',
};

let allEntries = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('diary-grid');
  if (!grid) return;

  await loadDiary();
  initFilters();
});

async function loadDiary() {
  try {
    const res = await fetch(`data/diary.json?t=${Date.now()}`);
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    allEntries = data.entries || [];
  } catch {
    allEntries = [];
  }
  renderDiary();
}

function initFilters() {
  document.querySelectorAll('.diary-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diary-filter').forEach((b) => {
        b.classList.remove('diary-filter--active');
      });
      btn.classList.add('diary-filter--active');
      currentFilter = btn.dataset.filter;
      renderDiary();
    });
  });
}

function renderDiary() {
  const grid = document.getElementById('diary-grid');
  const empty = document.getElementById('diary-empty');
  if (!grid || !empty) return;

  const filtered =
    currentFilter === 'all'
      ? allEntries
      : allEntries.filter((e) => e.type === currentFilter);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (sorted.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = sorted
    .filter((e) => e.link)
    .map(renderNote)
    .join('');
}

function renderNote(entry) {
  const typeLabel = TYPE_LABELS[entry.type] || entry.type;
  const date = formatDate(entry.date);
  const isQuote = entry.type === 'quote';
  const platform = detectPlatform(entry.link);
  const linkLabel = entry.linkLabel || 'Перейти';

  const topMeta = isQuote && entry.topic
    ? `<span class="diary-note__topic">${escapeHtml(entry.topic)}</span>`
    : '';

  const body = isQuote
    ? `<blockquote class="diary-note__quote">«${escapeHtml(entry.text)}»</blockquote>`
    : `<h3 class="diary-note__title">${escapeHtml(entry.topic)}</h3>
       <p class="diary-note__text">${escapeHtml(entry.text)}</p>`;

  return `
    <a href="${escapeAttr(entry.link)}" class="diary-note diary-note--${entry.type}" target="_blank" rel="noopener noreferrer">
      <div class="diary-note__top">
        <span class="diary-note__type">${typeLabel}</span>
        ${topMeta}
      </div>
      ${body}
      <footer class="diary-note__footer">
        <time datetime="${escapeAttr(entry.date)}">${date}</time>
        <span class="diary-note__link">
          <span class="diary-note__social diary-note__social--${platform}">${platformLabel(platform)}</span>
          ${escapeHtml(linkLabel)} →
        </span>
      </footer>
    </a>
  `;
}

function detectPlatform(url) {
  if (!url) return 'link';
  if (url.includes('vk.ru') || url.includes('vk.com')) return 'vk';
  if (url.includes('t.me/madam79kotineiro')) return 'channel';
  if (url.includes('t.me/')) return 'telegram';
  return 'link';
}

function platformLabel(platform) {
  const labels = {
    telegram: 'Telegram',
    channel: 'Канал',
    vk: 'ВКонтакте',
    link: 'Ссылка',
  };
  return labels[platform] || 'Ссылка';
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
