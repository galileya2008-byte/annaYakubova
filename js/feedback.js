document.addEventListener('DOMContentLoaded', () => {
  initServiceFromUrl();
  initForm();
});

function initServiceFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const service = params.get('service') || 'general';
  const select = document.getElementById('form-service');
  const services = SITE_CONFIG.form?.services || {};

  if (select.options.length === 0) {
    Object.entries(services).forEach(([value, label]) => {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = label;
      select.appendChild(opt);
    });
  }

  if (services[service]) {
    select.value = service;
  }
}

function initForm() {
  const form = document.getElementById('feedback-form');
  const webhookUrl = SITE_CONFIG.form?.webhookUrl;
  const fallback = document.getElementById('form-fallback');
  const submitBtn = document.getElementById('form-submit');

  if (!webhookUrl) {
    fallback.style.display = 'block';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Форма скоро будет доступна';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!webhookUrl) return;

    const payload = {
      service: SITE_CONFIG.form.services[form.service.value] || form.service.value,
      name: form.name.value.trim(),
      contact: form.contact.value.trim(),
      message: form.message.value.trim(),
    };

    if (!payload.name || !payload.contact) {
      showFormStatus('Заполните имя и контакт', 'error');
      return;
    }

    setFormLoading(true);
    showFormStatus('', '');

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.ok) {
        form.reset();
        initServiceFromUrl();
        showFormStatus('Заявка отправлена! Анна свяжется с вами в ближайшее время.', 'success');
      } else {
        throw new Error(data.error || 'Ошибка отправки');
      }
    } catch {
      showFormStatus(
        'Не удалось отправить. Напишите напрямую в Telegram.',
        'error'
      );
    } finally {
      setFormLoading(false);
    }
  });
}

function setFormLoading(loading) {
  const btn = document.getElementById('form-submit');
  btn.disabled = loading;
  btn.textContent = loading ? 'Отправка…' : 'Отправить заявку';
}

function showFormStatus(text, type) {
  const el = document.getElementById('form-status');
  el.textContent = text;
  el.className = 'form-status' + (type ? ` form-status--${type}` : '');
  el.style.display = text ? 'block' : 'none';
}
