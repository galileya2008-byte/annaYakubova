const CATEGORY_LABELS = {
  masterclass: 'Мастер-класс',
  news: 'Новость',
  article: 'Статья',
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
    const res = await fetch('data/diary.json');
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
      : allEntries.filter((e) => e.category === currentFilter);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (sorted.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = sorted.map(renderCard).join('');
}

function renderCard(entry) {
  const label = CATEGORY_LABELS[entry.category] || entry.category;
  const date = formatDate(entry.date);
  const linkStart = entry.link
    ? `<a href="${escapeAttr(entry.link)}" class="diary-card" ${isExternal(entry.link) ? 'target="_blank" rel="noopener noreferrer"' : ''}>`
    : '<article class="diary-card">';
  const linkEnd = entry.link ? '</a>' : '</article>';

  return `
    ${linkStart}
      <span class="diary-card__category">${label}</span>
      <time class="diary-card__date" datetime="${escapeAttr(entry.date)}">${date}</time>
      <h3 class="diary-card__title">${escapeHtml(entry.title)}</h3>
      <p class="diary-card__excerpt">${escapeHtml(entry.excerpt)}</p>
      ${entry.link ? '<span class="diary-card__more">Читать →</span>' : ''}
    ${linkEnd}
  `;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isExternal(url) {
  return url.startsWith('http');
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
