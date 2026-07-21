document.addEventListener('DOMContentLoaded', () => {
  initBurger();
  initReveal();
  highlightCurrentNav();
  initLegalInfo();
});

function getLegalInfo() {
  if (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.legal) {
    return SITE_CONFIG.legal;
  }
  return {
    status: 'Самозанятая',
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
