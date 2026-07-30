const COOKIE_CONSENT_KEY = 'anna_cookie_consent';

document.addEventListener('DOMContentLoaded', () => {
  initCookieBanner();
});

function hasCookieConsent() {
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';
}

function initCookieBanner() {
  if (hasCookieConsent()) return;

  const banner = document.createElement('aside');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Уведомление об использовании cookie');
  banner.innerHTML = `
    <div class="cookie-banner__inner container">
      <p class="cookie-banner__text">
        Сайт использует файлы cookie и локальное хранилище браузера для корректной работы
        и сохранения ваших настроек. Продолжая пользоваться сайтом, вы соглашаетесь
        с <a href="politika-cookie.html">политикой cookie</a>
        и <a href="politika-konfidencialnosti.html">политикой конфиденциальности</a>.
      </p>
      <div class="cookie-banner__actions">
        <button type="button" class="btn btn--primary btn--sm" id="cookie-accept">Принять</button>
        <a href="politika-cookie.html" class="btn btn--secondary btn--sm">Подробнее</a>
      </div>
    </div>
  `;

  document.body.appendChild(banner);
  document.body.classList.add('cookie-banner-visible');

  banner.querySelector('#cookie-accept').addEventListener('click', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    banner.remove();
    document.body.classList.remove('cookie-banner-visible');
  });
}
