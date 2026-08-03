(function initSeo() {
  const seoConfig = typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.seo
    ? SITE_CONFIG.seo
    : {
        siteUrl: 'https://anna-yakubova.ru',
        siteName: 'Анна Якубова — Путь к гармонии',
        locale: 'ru_RU',
        language: 'ru-RU',
        defaultImage: 'images/anna-yakubova-expert.png',
        twitterCard: 'summary_large_image',
      };

  const path = window.location.pathname.split('/').pop() || 'index.html';
  const pageKey = path === '' ? 'index.html' : path;

  const pages = {
    'index.html': {
      title: 'Анна Якубова — Матрица Судьбы, нейрографика, интегративный подход',
      description:
        'Анна Якубова — сертифицированный специалист: Матрица Судьбы, нейрографика, интегративный подход MAGICART. Консультации и мастер-классы, Москва и онлайн.',
      image: 'images/anna-yakubova-expert.png',
      keywords:
        'Анна Якубова, Матрица Судьбы, нейрографика, интегративный подход, MAGICART, консультация, Москва',
    },
    'matrica-sudby.html': {
      title: 'Матрица Судьбы — консультации с Анной Якубовой',
      description:
        'Разбор Матрицы Судьбы: предназначение, таланты, финансы, отношения, детская матрица и совместимость. Запись на консультацию к Анне Якубовой.',
      image: 'images/matrix-cert-profession.png',
      keywords: 'Матрица Судьбы, разбор матрицы, нумерология, Анна Якубова, консультация',
    },
    'neyrografika.html': {
      title: 'Нейрографика — сессии и мастер-классы | Анна Якубова',
      description:
        'Нейрографика с сертифицированным специалистом: индивидуальные сессии, групповые практики, снятие тревожности и блоков через рисование.',
      image: 'images/neyrografika-showcase.png',
      keywords: 'нейрографика, нейроарт, мастер-класс, Анна Якубова, арт-терапия',
    },
    'integrativny-podhod.html': {
      title: 'Интегративный подход MAGICART | Анна Якубова',
      description:
        'Интегративное рисование MAGICART — работа с сознанием через art-терапию, нейрографику и сакральную геометрию. Сертифицированный инструктор.',
      image: 'images/integrativny-podhod-hero.png',
      keywords: 'MAGICART, интегративный подход, интегративное рисование, Анна Якубова',
    },
    'dnevnik.html': {
      title: 'Личный дневник — Анна Якубова',
      description:
        'Цитаты и темы из практики: Матрица Судьбы, нейрографика, интегративный подход. Переход к постам в Telegram и ВКонтакте.',
      image: 'images/anna-yakubova.png',
      keywords: 'дневник, Анна Якубова, Telegram, нейрографика, матрица судьбы',
    },
    'quiz.html': {
      title: 'Квизы — найти направление | Анна Якубова',
      description:
        'Пройдите квиз: подберите направление — Матрица Судьбы, нейрографика или интегративный подход — или раскройте потенциал в «Древе потенциала».',
      image: 'images/anna-yakubova.png',
      keywords: 'квиз, самопознание, древо потенциала, Анна Якубова',
    },
    'quiz-napravlenie.html': {
      title: 'Квиз «Найти направление» | Анна Якубова',
      description:
        'Три вопроса — и вы узнаете, что вам ближе сейчас: Матрица Судьбы, нейрографика или интегративный подход.',
      image: 'images/anna-yakubova.png',
      keywords: 'квиз направление, матрица судьбы, нейрографика',
    },
    'potencial-drevo.html': {
      title: 'Древо потенциала — интерактив | Анна Якубова',
      description:
        'Интерактив «Древо потенциала»: сильные стороны, точки роста и персональные рекомендации для раскрытия потенциала.',
      image: 'images/anna-yakubova.png',
      keywords: 'древо потенциала, интерактив, самопознание',
    },
    'zapis.html': {
      title: 'Запись на консультацию | Анна Якубова',
      description:
        'Оставьте заявку на консультацию: Матрица Судьбы, нейрографика, интегративный подход. Анна свяжется с вами в Telegram.',
      image: 'images/anna-yakubova.png',
      keywords: 'запись, консультация, Анна Якубова',
    },
    'politika-konfidencialnosti.html': {
      title: 'Политика конфиденциальности | Анна Якубова',
      description: 'Политика обработки персональных данных на сайте Анны Якубовой (152-ФЗ).',
      robots: 'noindex, follow',
    },
    'politika-cookie.html': {
      title: 'Политика cookie | Анна Якубова',
      description: 'Информация об использовании cookie и localStorage на сайте Анны Якубовой.',
      robots: 'noindex, follow',
    },
    'admin.html': {
      robots: 'noindex, nofollow',
    },
  };

  const page = pages[pageKey] || {};
  const baseUrl = seoConfig.siteUrl.replace(/\/$/, '');
  const canonicalPath = pageKey === 'index.html' ? '' : pageKey;
  const canonicalUrl = `${baseUrl}/${canonicalPath}`.replace(/\/$/, '') || baseUrl;

  const title = page.title || document.title;
  const description =
    page.description ||
    document.querySelector('meta[name="description"]')?.getAttribute('content') ||
    seoConfig.siteName;

  if (page.title) document.title = page.title;

  setMeta('name', 'description', description);

  if (page.keywords) {
    setMeta('name', 'keywords', page.keywords);
  }

  setMeta('name', 'author', 'Анна Якубова');
  setMeta('name', 'robots', page.robots || 'index, follow');
  setMeta('name', 'googlebot', page.robots || 'index, follow');

  setLink('canonical', canonicalUrl);
  setLink('icon', absoluteUrl(baseUrl, 'images/anna-yakubova.png'));

  const imagePath = page.image || seoConfig.defaultImage;
  const imageUrl = absoluteUrl(baseUrl, imagePath);

  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:site_name', seoConfig.siteName);
  setMeta('property', 'og:locale', seoConfig.locale);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('property', 'og:image', imageUrl);

  setMeta('name', 'twitter:card', seoConfig.twitterCard);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', imageUrl);

  injectJsonLd(baseUrl, pageKey, title, description, canonicalUrl);

  function setMeta(attr, key, value) {
    if (!value) return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  }

  function setLink(rel, href) {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  function absoluteUrl(base, path) {
    if (/^https?:\/\//i.test(path)) return path;
    return `${base}/${path.replace(/^\//, '')}`;
  }

  function injectJsonLd(baseUrl, key, title, description, url) {
    const graph = [];

    if (key === 'index.html') {
      graph.push(
        {
          '@type': 'WebSite',
          '@id': `${baseUrl}/#website`,
          url: baseUrl,
          name: seoConfig.siteName,
          description,
          inLanguage: seoConfig.language,
          publisher: { '@id': `${baseUrl}/#person` },
        },
        {
          '@type': 'Person',
          '@id': `${baseUrl}/#person`,
          name: 'Анна Якубова',
          jobTitle: 'Специалист по Матрице Судьбы, нейрографике и интегративному подходу',
          url: baseUrl,
          image: absoluteUrl(baseUrl, seoConfig.defaultImage),
          sameAs: [
            'https://t.me/anna_yakubova79',
            'https://t.me/madam79kotineiro',
            'https://vk.ru/club236251530',
          ],
        },
        {
          '@type': 'ProfessionalService',
          '@id': `${baseUrl}/#service`,
          name: 'Консультации Анны Якубовой',
          url: baseUrl,
          image: absoluteUrl(baseUrl, seoConfig.defaultImage),
          description,
          areaServed: {
            '@type': 'City',
            name: 'Москва',
          },
          provider: { '@id': `${baseUrl}/#person` },
          serviceType: [
            'Матрица Судьбы',
            'Нейрографика',
            'Интегративный подход MAGICART',
          ],
        }
      );
    }

    const breadcrumb = buildBreadcrumb(baseUrl, key, title);
    if (breadcrumb) graph.push(breadcrumb);

    if (!graph.length) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': graph,
    });
    document.head.appendChild(script);
  }

  function buildBreadcrumb(baseUrl, key, title) {
    if (key === 'index.html') return null;

    const crumbs = [{ name: 'Главная', url: baseUrl }];
    const pages = {
      'matrica-sudby.html': [{ name: 'Матрица Судьбы' }],
      'neyrografika.html': [{ name: 'Нейрографика' }],
      'integrativny-podhod.html': [{ name: 'Интегративный подход' }],
      'dnevnik.html': [{ name: 'Личный дневник' }],
      'quiz.html': [{ name: 'Квизы' }],
      'quiz-napravlenie.html': [
        { name: 'Квизы', path: 'quiz.html' },
        { name: 'Найти направление' },
      ],
      'potencial-drevo.html': [
        { name: 'Квизы', path: 'quiz.html' },
        { name: 'Древо потенциала' },
      ],
      'zapis.html': [{ name: 'Записаться' }],
      'politika-konfidencialnosti.html': [{ name: 'Политика конфиденциальности' }],
      'politika-cookie.html': [{ name: 'Политика cookie' }],
    };

    const chain = pages[key];
    if (!chain) return null;

    chain.forEach((item) => {
      const url = item.path ? `${baseUrl}/${item.path}` : `${baseUrl}/${key}`;
      crumbs.push({ name: item.name, url });
    });

    return {
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }
})();
