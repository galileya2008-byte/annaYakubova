document.addEventListener('DOMContentLoaded', () => {
  initContactPage();
});

const SERVICE_LABELS = {
  matrix: 'Матрица Судьбы',
  neuro: 'Нейрографика',
  integrative: 'Интегративный подход',
  general: 'Общий вопрос',
};

const MESSAGE_TEMPLATES = {
  matrix: `Здравствуйте, Анна!

Хочу записаться на консультацию по Матрице Судьбы.

Меня зовут:
Дата рождения (для расчёта):
Удобное время для связи:

Кратко о запросе (необязательно):`,

  neuro: `Здравствуйте, Анна!

Хочу записаться на занятие / практику по нейрографике.

Меня зовут:
Удобное время для связи:

Кратко о запросе (необязательно):`,

  integrative: `Здравствуйте, Анна!

Хочу записаться на консультацию по интегративному подходу.

Меня зовут:
Удобное время для связи:

Кратко о запросе (необязательно):`,

  general: `Здравствуйте, Анна!

Хочу записаться на консультацию.

Меня зовут:
Удобное время для связи:

Кратко о запросе:`,
};

function initContactPage() {
  const textarea = document.getElementById('contact-message');
  const topicRoot = document.getElementById('contact-topics');
  if (!textarea || !topicRoot) return;

  const services = SITE_CONFIG.form?.services || SERVICE_LABELS;
  const params = new URLSearchParams(window.location.search);
  let activeService = params.get('service') || 'general';
  if (!services[activeService] && !MESSAGE_TEMPLATES[activeService]) {
    activeService = 'general';
  }

  topicRoot.innerHTML = '';
  Object.entries(services).forEach(([value, label]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'contact-topic';
    btn.dataset.service = value;
    btn.textContent = label;
    btn.setAttribute('aria-pressed', value === activeService ? 'true' : 'false');
    if (value === activeService) btn.classList.add('contact-topic--active');
    btn.addEventListener('click', () => setActiveService(value, textarea, topicRoot));
    topicRoot.appendChild(btn);
  });

  setActiveService(activeService, textarea, topicRoot, false);
  initDirectContactLinks(textarea);
  initCopyButton(textarea);
}

function setActiveService(service, textarea, topicRoot, focusTextarea = true) {
  const template = MESSAGE_TEMPLATES[service] || MESSAGE_TEMPLATES.general;
  textarea.value = template;

  topicRoot.querySelectorAll('.contact-topic').forEach((btn) => {
    const isActive = btn.dataset.service === service;
    btn.classList.toggle('contact-topic--active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  updateMessengerLinks(textarea.value);
  if (focusTextarea) textarea.focus();
}

function initDirectContactLinks(textarea) {
  const formConfig = typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.form ? SITE_CONFIG.form : {};
  const base = {
    telegram: formConfig.telegramFallback || 'https://t.me/anna_yakubova79',
    max: formConfig.maxProfile || '',
    whatsapp: formConfig.whatsappChat || 'https://wa.me/79264941424',
  };

  document.querySelectorAll('[data-contact-link]').forEach((link) => {
    const key = link.getAttribute('data-contact-link');
    link.dataset.baseHref = base[key] || '';
    if (!base[key]) link.hidden = true;
  });

  textarea.addEventListener('input', () => updateMessengerLinks(textarea.value));
  updateMessengerLinks(textarea.value);
}

function updateMessengerLinks(message) {
  const text = message.trim();
  document.querySelectorAll('[data-contact-link]').forEach((link) => {
    const key = link.getAttribute('data-contact-link');
    const base = link.dataset.baseHref;
    if (!base) return;

    if (key === 'whatsapp') {
      const waBase = base.split('?')[0];
      link.href = text ? `${waBase}?text=${encodeURIComponent(text)}` : base;
      return;
    }

    link.href = base;
  });
}

function initCopyButton(textarea) {
  const copyBtn = document.getElementById('contact-copy');
  const status = document.getElementById('contact-copy-status');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const text = textarea.value;
    try {
      await navigator.clipboard.writeText(text);
      if (status) {
        status.textContent = 'Текст скопирован — вставьте его в сообщение';
        status.className = 'contact-copy-status contact-copy-status--ok';
      }
    } catch {
      textarea.select();
      document.execCommand('copy');
      if (status) {
        status.textContent = 'Текст выделен — нажмите «Копировать» или Ctrl+C';
        status.className = 'contact-copy-status';
      }
    }
  });
}
