document.addEventListener('DOMContentLoaded', initServicesLists);

async function initServicesLists() {
  const lists = document.querySelectorAll('[data-services-list]');
  if (!lists.length) return;

  const data = await loadServicesData();
  if (!data?.sections) return;

  lists.forEach((list) => {
    const sectionKey = list.dataset.servicesList;
    const section = data.sections[sectionKey];
    if (!section) return;
    list.innerHTML = renderServicesItems(section.items);
  });
}

async function loadServicesData() {
  const path = SITE_CONFIG?.github?.servicesPath || 'data/services.json';
  try {
    const res = await fetch(`${path}?t=${Date.now()}`);
    if (!res.ok) throw new Error('services fetch failed');
    return await res.json();
  } catch {
    return null;
  }
}

function renderServicesItems(items) {
  if (!items?.length) {
    return '<li class="sidebar-list__empty">Услуги скоро появятся</li>';
  }

  return [...items]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(renderServiceItem)
    .join('');
}

function renderServiceItem(item) {
  const title = escapeServicesHtml(item.title || '');
  const price = formatServicePrice(item.price);
  const url = (item.prodamusUrl || '').trim();
  const hitClass = item.hit ? ' sidebar-list__item--hot' : '';
  const hasLink = Boolean(url);

  if (!hasLink) {
    return `
      <li class="sidebar-list__item sidebar-list__item--static${hitClass}">
        ${item.hit ? '<span class="sidebar-sticker" title="Популярная услуга" aria-hidden="true">ХИТ</span>' : ''}
        <span class="sidebar-list__label">${title}</span>
        ${price ? `<span class="sidebar-service__price">${price}</span>` : ''}
      </li>
    `;
  }

  return `
    <li class="sidebar-list__item sidebar-list__item--link${hitClass}">
      <a href="${escapeServicesAttr(url)}" class="sidebar-service" target="_blank" rel="noopener noreferrer">
        ${item.hit ? '<span class="sidebar-sticker" title="Популярная услуга" aria-hidden="true">ХИТ</span>' : ''}
        <span class="sidebar-list__label">${title}</span>
        ${price ? `<span class="sidebar-service__price">${price}</span>` : '<span class="sidebar-service__cta">Подробнее →</span>'}
      </a>
    </li>
  `;
}

function formatServicePrice(price) {
  const raw = String(price || '').trim();
  if (!raw) return '';
  if (/₽|руб/i.test(raw)) return escapeServicesHtml(raw);
  const digits = raw.replace(/\s/g, '');
  if (/^\d+$/.test(digits)) {
    return `${Number(digits).toLocaleString('ru-RU')} ₽`;
  }
  return escapeServicesHtml(raw);
}

function escapeServicesHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeServicesAttr(str) {
  return escapeServicesHtml(str);
}
