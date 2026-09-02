document.addEventListener('DOMContentLoaded', () => {
  initBurger();
  initReveal();
  initHeaderScroll();
  highlightCurrentNav();
  initLegalInfo();
  initFooterLegalLinks();
});

function getLegalInfo() {
  if (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.legal) {
    return SITE_CONFIG.legal;
  }
  return {
    status: 'Самозанятый',
    name: 'Якубова Анна Геннадьевна',
    city: 'Москва',
    inn: '503198988884',
  };
}

function formatLegalLine(legal) {
  return `${legal.status} ${legal.name} · г. ${legal.city} · ИНН ${legal.inn}`;
}

function initLegalInfo() {
  const legal = getLegalInfo();
  const line = formatLegalLine(legal);

  const brand = document.querySelector('.footer__brand');
  if (brand && !brand.querySelector('.footer__legal')) {
    const footerLegal = document.createElement('p');
    footerLegal.className = 'footer__legal';
    footerLegal.textContent = line;
    brand.appendChild(footerLegal);
  }

  const formLegal = document.getElementById('feedback-legal');
  if (formLegal) {
    formLegal.textContent = `Исполнитель услуг — ${line}`;
  }

  const operator = document.getElementById('legal-operator');
  if (operator) {
    operator.textContent = `${legal.status} ${legal.name}, г. ${legal.city}, ИНН ${legal.inn}.`;
  }
}

function initFooterLegalLinks() {
  const bottom = document.querySelector('.footer__bottom');
  if (!bottom || bottom.querySelector('.footer__docs')) return;

  const docs = document.createElement('nav');
  docs.className = 'footer__docs';
  docs.setAttribute('aria-label', 'Юридические документы');
  docs.innerHTML = `
    <a href="politika-konfidencialnosti.html">Политика конфиденциальности</a>
    <span class="footer__docs-sep" aria-hidden="true">·</span>
    <a href="politika-cookie.html">Cookie</a>
  `;

  const copyright = bottom.querySelector('span');
  if (copyright) {
    bottom.insertBefore(docs, copyright);
  } else {
    bottom.prepend(docs);
  }
}

function initBurger() {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    burger.classList.toggle('burger--active');
    nav.classList.toggle('nav--open');
    document.body.classList.toggle('menu-open');
  });

  nav.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      burger.classList.remove('burger--active');
      nav.classList.remove('nav--open');
      document.body.classList.remove('menu-open');
    });
  });
}

function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('header--scrolled', window.scrollY > 24);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((el) => observer.observe(el));

  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.reveal--visible)').forEach((el) => {
      el.classList.add('reveal--visible');
    });
  }, 2000);
}

function highlightCurrentNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === path) {
      link.classList.add('nav__link--active');
    }
  });
}
