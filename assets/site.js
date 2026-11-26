const A = "/assets/";

const rawPath = window.location.pathname.replace(/\/+$/, "") || "/";
const language = rawPath === "/en" || rawPath.startsWith("/en/") ? "en" : "fr";
const isEnglish = language === "en";
const routePath = isEnglish ? (rawPath.slice(3) || "/") : rawPath;
const localPath = (target) => {
  if (!isEnglish || !target.startsWith("/")) return target;
  if (target === "/") return "/en";
  return `/en${target}`;
};

const navItems = isEnglish ? [
  ["/", "Home"],
  ["/industries", "Industries"],
  ["/services", "Our Services"],
  ["/entreprises", "For Companies"],
  ["/candidats", "For Candidates"],
  ["/catalogue", "Training"],
  ["/reseau-experts", "Expert Network"],
  ["/a-propos", "About Us"],
  ["/contact", "Contact Us"],
] : [
  ["/", "Accueil"],
  ["/industries", "Les Industries"],
  ["/services", "Nos services"],
  ["/entreprises", "Espace Entreprises"],
  ["/candidats", "Espace Candidats"],
  ["/catalogue", "Formations"],
  ["/reseau-experts", "Réseau d’experts"],
  ["/a-propos", "À propos"],
  ["/contact", "Nous contacter"],
];

const cleanPath = () => {
  return routePath;
};

const header = (path) => `
  <header class="site-header">
    <a class="header-logo" href="${localPath("/")}" aria-label="Agile Resources International — ${isEnglish ? "Home" : "Accueil"}">
      <img src="${A}logo-ari.webp" alt="Agile Resources International">
    </a>
    <div class="language-switcher" aria-label="${isEnglish ? "Choose language" : "Choisir la langue"}">
      <a href="${path === "/" ? "/" : path}" lang="fr"${!isEnglish ? ' class="active" aria-current="true"' : ""}>FR</a>
      <span aria-hidden="true">|</span>
      <a href="${path === "/" ? "/en" : `/en${path}`}" lang="en"${isEnglish ? ' class="active" aria-current="true"' : ""}>EN</a>
    </div>
    <button class="menu-button" type="button" aria-label="${isEnglish ? "Open menu" : "Ouvrir le menu"}" aria-expanded="false" aria-controls="main-navigation">☰</button>
    <nav class="main-nav" id="main-navigation" aria-label="${isEnglish ? "Main navigation" : "Navigation principale"}">
      ${navItems.map(([href, label]) => href === "/a-propos" ? `
        <details class="about-navigation${[href, '/mot-du-president', '/mot-du-directeur-general', '/sirexe-2026'].includes(path) ? ' active' : ''}">
          <summary>${label}<span aria-hidden="true">⌄</span></summary>
          <div class="about-submenu">
            <a href="${localPath(href)}"${path === href ? ' aria-current="page"' : ''}>${isEnglish ? 'About ARI' : 'Présentation d’ARI'}</a>
            <a href="${localPath('/sirexe-2026')}"${path === '/sirexe-2026' ? ' aria-current="page"' : ''}>${isEnglish ? 'ARI at SIREXE 2026' : 'ARI au SIREXE 2026'}</a>
            <a href="${localPath('/mot-du-president')}"${path === '/mot-du-president' ? ' aria-current="page"' : ''}>${isEnglish ? 'A word from the President' : 'Le mot du président'}</a>
            <a href="${localPath('/mot-du-directeur-general')}"${path === '/mot-du-directeur-general' ? ' aria-current="page"' : ''}>${isEnglish ? 'A word from the Managing Director' : 'Le mot du directeur général'}</a>
          </div>
        </details>` : `<a href="${localPath(href)}"${path === href || (href === '/catalogue' && path.startsWith('/catalogue/')) ? ' class="active"' : ""}${path === href ? ' aria-current="page"' : ''}>${label}</a>`).join("")}
    </nav>
  </header>`;

const footer = () => `
  <footer class="site-footer">
    <div class="footer-intro">
      <span class="footer-rule"></span>
      <a class="footer-brand" href="${localPath("/")}">Agile Resources<br>International (ARI)</a>
      <p>${isEnglish ? "Your trusted partner for efficient, agile <br>and international talent sourcing." : "Votre partenaire de confiance pour un sourcing <br>efficace, agile et international."}</p>
    </div>
    <div>
      <h4>${isEnglish ? "NAVIGATION" : "NAVIGATION"}</h4>
      ${navItems.filter(([href]) => href !== "/contact").map(([href, label]) => `<a href="${localPath(href)}">${label.toUpperCase()}</a>`).join("\n")}
      <a href="${localPath('/sirexe-2026')}">${isEnglish ? 'ARI AT SIREXE 2026' : 'ARI AU SIREXE 2026'}</a>
      <a href="${localPath('/mot-du-president')}">${isEnglish ? 'A WORD FROM THE PRESIDENT' : 'LE MOT DU PRÉSIDENT'}</a>
      <a href="${localPath('/mot-du-directeur-general')}">${isEnglish ? 'A WORD FROM THE MANAGING DIRECTOR' : 'LE MOT DU DIRECTEUR GÉNÉRAL'}</a>
    </div>
    <div>
      <h4>${isEnglish ? "CONTACT US" : "NOUS CONTACTER"}</h4>
      <a class="footer-contact-link" href="${localPath("/contact")}">contact@agileresources-intl.com</a>
      <p>${isEnglish ? "Côte d’Ivoire · West Africa · International" : "Côte d’Ivoire · Afrique de l’Ouest · International"}</p>
    </div>
    <div class="footer-bottom">
      <small>© 2026 Agile Resources International (ARI)</small>
      <small>${isEnglish ? "STRATEGIC INTERNATIONAL TALENT ACQUISITION" : "ACQUISITION STRATÉGIQUE DE TALENTS INTERNATIONAUX"}</small>
    </div>
  </footer>`;

const cta = ({title = isEnglish ? "Ready to secure the right talent?" : "Prêt à sécuriser vos talents ?", text, button = isEnglish ? "Contact an expert" : "Contacter un expert"} = {}) => `
  <section class="cta-section">
    <div>
      <h2>${title}</h2>
      <p>${text || (isEnglish ? "Contact our consultants to design a sourcing strategy tailored to your ambitions." : "Prenez contact avec nos consultants pour concevoir une stratégie de sourcing adaptée à vos ambitions.")}</p>
    </div>
    <a class="button" href="${localPath("/contact")}">${button}</a>
  </section>`;

const home = () => `
  <main>
    <section class="workshop-banner" aria-labelledby="workshop-banner-title">
      <div class="workshop-banner-copy">
        <p class="workshop-kicker">${isEnglish ? 'Free career workshop' : 'Formation carrière gratuite'} <span aria-hidden="true">·</span> <time datetime="2026-11-28">${isEnglish ? 'Saturday 28 November' : 'Samedi 28 novembre'}</time></p>
        <h2 id="workshop-banner-title">${isEnglish ? 'Prepare for your next opportunity.' : 'Préparez votre prochaine opportunité.'}</h2>
        <ul class="workshop-topics">
          <li>${isEnglish ? 'Build your professional network.' : 'Développer son réseau professionnel.'}</li>
          <li>${isEnglish ? 'Strengthen your CV, LinkedIn profile and pitch.' : 'Valoriser son CV, son profil LinkedIn et son pitch.'}</li>
          <li>${isEnglish ? 'Prepare for and succeed in job interviews.' : 'Préparer et réussir son entretien d’embauche.'}</li>
        </ul>
        <p class="workshop-location">${isEnglish
          ? '<strong>Time:</strong> 10:00 a.m. to 2:00 p.m. (Abidjan time)<br><strong>Venue:</strong> IPCE — Cocody Cité des Arts, Lot 10A – Villa 174 – Rue C30, Impasse des Tapissiers, Abidjan, 01 BP 1203, Côte d’Ivoire.<br><a class="workshop-map-link" href="https://www.google.com/maps/search/?api=1&amp;query=IPCE%2C%20Cocody%20Cit%C3%A9%20des%20Arts%2C%20Lot%2010A%2C%20Villa%20174%2C%20Rue%20C30%2C%20Impasse%20des%20Tapissiers%2C%20Abidjan%2C%20C%C3%B4te%20d%E2%80%99Ivoire" target="_blank" rel="noopener noreferrer"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg><span>View location on Google Maps</span><span aria-hidden="true">↗</span></a>'
          : '<strong>Horaires :</strong> De 10 h à 14 h (heure d’Abidjan)<br><strong>Lieu :</strong> IPCE — Cocody Cité des Arts, Lot 10A – Villa 174 – Rue C30, Impasse des Tapissiers, Abidjan, 01 BP 1203, Abidjan, CI.<br><a class="workshop-map-link" href="https://www.google.com/maps/search/?api=1&amp;query=IPCE%2C%20Cocody%20Cit%C3%A9%20des%20Arts%2C%20Lot%2010A%2C%20Villa%20174%2C%20Rue%20C30%2C%20Impasse%20des%20Tapissiers%2C%20Abidjan%2C%20C%C3%B4te%20d%E2%80%99Ivoire" target="_blank" rel="noopener noreferrer"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg><span>Voir le lieu sur Google Maps</span><span aria-hidden="true">↗</span></a>'}</p>
      </div>
      <div class="workshop-banner-action">
        <span class="workshop-places">${isEnglish ? 'Only 30 places available' : '30 places disponibles uniquement'}</span>
        <button class="button" type="button" data-registration-open>${isEnglish ? 'Register for free' : 'Je m’inscris gratuitement'}</button>
        <span class="workshop-small">${isEnglish ? 'Registration takes just a few minutes.' : 'Inscription en quelques minutes.'}</span>
      </div>
    </section>

    <section class="home-hero two-columns">
      <div>
        <p class="eyebrow">Agile Resources International</p>
        <h1>Acquisition <br>stratégique de <br>talents <br>internationaux</h1>
        <span class="title-rule"></span>
        <p>Agile Resources International met à votre disposition un réseau mondial de professionnels hautement qualifiés. Nous accompagnons les organisations exigeantes dans l’identification, l’évaluation et le recrutement de profils stratégiques, avec une approche agile, discrète et orientée résultats.</p>
        <div class="home-primary-actions"><a class="button" href="${localPath('/contact')}?type=entreprise#contact-form">${isEnglish ? 'Discuss a search mandate' : 'Confier un mandat'}</a> <a class="button home-cv-link" href="${localPath('/candidats')}#candidature">${isEnglish ? 'Submit my CV' : 'Déposer mon CV'}</a></div>
      </div>
      <img src="${A}mine.webp" alt="Site minier vu du ciel" fetchpriority="high" decoding="async">
    </section>

    <section class="section solutions" id="solutions">
      <p class="eyebrow">Notre Expertise</p>
      <h2>Solutions sur mesure</h2>
      <span class="title-rule"></span>
      <p>Nous concevons des solutions adaptées à vos enjeux afin d’optimiser la gestion de votre capital humain, de sécuriser la mobilité internationale et de favoriser l’intégration durable de vos collaborateurs.</p>
      <div class="solution-grid">
        <article>
          <div class="card-media"><span><img src="${A}icon-enterprises.png" alt="" loading="lazy"></span><img src="${A}solution-enterprises.webp" alt="Mine et industrie" loading="lazy" decoding="async"></div>
          <h3>Entreprises</h3>
          <p>Nous accompagnons les entreprises dans la recherche, la sélection et le recrutement de profils qualifiés, de spécialistes et de dirigeants. Grâce à une approche personnalisée, nous identifions les compétences les plus adaptées à vos objectifs et vous aidons à constituer des équipes performantes, en Côte d’Ivoire, en Afrique de l’Ouest et à l’international.</p>
        </article>
        <article>
          <div class="card-media"><span><img src="${A}icon-candidates.png" alt="" loading="lazy"></span><img src="${A}solution-candidates.webp" alt="Professionnelle préparant sa carrière" loading="lazy" decoding="async"></div>
          <h3>Candidats</h3>
          <p>Nous accompagnons les professionnels dans leur évolution en leur donnant accès à des opportunités de carrière correspondant à leurs compétences et à leurs ambitions. De la préparation de leur candidature à leur intégration, nous assurons un suivi personnalisé à chaque étape de leur parcours.</p>
        </article>
        <article>
          <div class="card-media"><span><img src="${A}icon-advice.png" alt="" loading="lazy"></span><img src="${A}solution-advice.webp" alt="Consultants en réunion" loading="lazy" decoding="async"></div>
          <h3>Conseil</h3>
          <p>Nous conseillons les entreprises dans leurs projets de recrutement, de mobilité internationale et de développement organisationnel. Notre accompagnement permet de sécuriser vos recrutements, d’optimiser vos processus et de mettre en place des solutions durables favorisant votre croissance.</p>
        </article>
      </div>
    </section>
    ${window.ARISirexe.home(isEnglish, localPath)}

    <section class="section home-leadership" aria-labelledby="home-leadership-title">
      <h2 id="home-leadership-title">${isEnglish ? 'Agile Resources Leadership' : 'La direction d’Agile Resources'}</h2>
      <div class="home-leadership-grid">
        <article class="home-leader">
          <img class="home-president-photo" src="${A}alpha-toure-president.webp" alt="" width="832" height="1210" loading="eager" decoding="async">
          <div class="home-leader-copy">
            <h3>Alpha Touré</h3>
            <p class="home-leader-role">${isEnglish ? 'President' : 'Président'}</p>
            <p>${isEnglish ? '“ARI will be the ideal partner to support your company’s growth and performance.”' : '« ARI sera le partenaire idéal pour soutenir la croissance et la performance de votre entreprise. »'}</p>
            <a href="${localPath('/mot-du-president')}">${isEnglish ? 'Read the President’s message' : 'Lire le mot du président'} <span aria-hidden="true">→</span></a>
          </div>
        </article>
        <article class="home-leader">
          <img class="home-director-photo" src="${A}youssouf-camara-dg.webp" alt="" width="824" height="1024" loading="eager" decoding="async">
          <div class="home-leader-copy">
            <h3>Youssouf Camara</h3>
            <p class="home-leader-role">${isEnglish ? 'Managing Director' : 'Directeur général'}</p>
            <p>${isEnglish ? '“Our commitment is clear: to create tangible value within your organisation.”' : '« Notre engagement est clair : créer une valeur tangible au sein de votre organisation. »'}</p>
            <a href="${localPath('/mot-du-directeur-general')}">${isEnglish ? 'Read the Managing Director’s message' : 'Lire le mot du directeur général'} <span aria-hidden="true">→</span></a>
          </div>
        </article>
      </div>
    </section>

    <img class="full-photo" src="${A}team.webp" alt="Équipe en réunion" loading="lazy" decoding="async">
  </main>
  ${cta({title:"Prêt à optimiser vos équipes ?", text:"Contactez nos consultants pour concevoir une stratégie d’embauche adaptée à vos ambitions professionnelles.", button:"Nous contacter"})}`;

const industries = () => `
  <main>
    <section class="industry-hero two-columns">
      <img src="${A}worker.webp" alt="Professionnel de l’industrie" fetchpriority="high" decoding="async">
      <div>
        <h1>Une expertise dédiée aux talents rares</h1>
        <span class="title-rule"></span>
        <p>Pour répondre aux exigences des industries de pointe, nous mobilisons des consultants experts, capables d’identifier les compétences techniques les plus rares et de sécuriser vos recrutements stratégiques à l’échelle internationale.</p>
        <a class="button" href="#domains">Consulter nos secteurs</a>
        <img class="africa-map" src="${A}africa-map.png" alt="Carte de l’Afrique" loading="lazy" decoding="async">
      </div>
    </section>
    <section class="section domains" id="domains">
      <p class="eyebrow">Nos secteurs</p>
      <span class="small-rule"></span>
      <div class="domain-grid">
        <article><span class="domain-icon"><img src="${A}icon-industry.png" alt=""></span><h3>${isEnglish ? 'Mining, Oil &amp; Energy' : 'Mines, Pétrole &amp; Énergie'}</h3><p>${isEnglish ? 'Geologists, mining engineers, HSE and maintenance specialists, and site finance and HR professionals. We prioritise local skills in line with local content objectives.' : 'Géologues, ingénieurs mines, spécialistes HSE et maintenance, profils finance et RH de site. Nous privilégions les compétences locales selon les objectifs de contenu local.'}</p></article>
        <article><span class="domain-icon"><img src="${A}icon-technology.png" alt=""></span><h3>Technologie &amp; Digital</h3><p>Identification d’ingénieurs cloud, d’architectes de données et d’experts en cybersécurité pour renforcer vos infrastructures critiques.</p></article>
        <article><span class="domain-icon"><img src="${A}icon-industry.png" alt=""></span><h3>Ingénierie</h3><p>Recrutement d’ingénieurs et d’experts en automatisation, robotique et pilotage de projets techniques à l’international.</p></article>
        <article><span class="domain-icon"><img src="${A}icon-finance.png" alt=""></span><h3>Finance &amp; Conseil</h3><p>Identification de cadres dirigeants et de spécialistes en gestion des risques pour sécuriser vos opérations financières à l’échelle mondiale.</p></article>
      </div>
      <a class="button centered-button" href="${localPath('/services')}">Parmi de nombreux autres services</a>
    </section>
    <img class="full-photo" src="${A}quarry.webp" alt="Carrière minière" loading="lazy" decoding="async">
  </main>
  ${cta({text:"Échangez avec notre équipe pour définir vos besoins de recrutement et trouver les profils adaptés à votre secteur."})}`;

const about = () => `
  <main>
    <section class="about-hero two-columns">
      <div>
        <h1>Une nouvelle vision du capital humain</h1>
        <span class="title-rule"></span>
        <p>Née de la volonté d’offrir une véritable alternative aux cabinets de recrutement traditionnels, ARI accompagne les organisations d’envergure dans la gestion de leur capital humain avec agilité et réactivité.</p>
        <a class="president-entry-link" href="${localPath('/mot-du-president')}">${isEnglish ? 'Read a word from our President' : 'Lire le mot du président'} <span aria-hidden="true">→</span></a>
        <br><a class="president-entry-link" href="${localPath('/mot-du-directeur-general')}">${isEnglish ? 'Read a word from our Managing Director' : 'Lire le mot du directeur général'} <span aria-hidden="true">→</span></a>
        <p class="eyebrow engagement-label">Nos engagements</p>
        <p>Nous combinons la force d’un réseau international à l’attention personnalisée d’une structure à taille humaine, sans jamais transiger sur l’excellence.</p>
      </div>
      <div class="about-media">
        <img src="${A}office.webp" alt="Collaborateurs au bureau" fetchpriority="high" decoding="async">
        <a class="button" href="#engagements">Nos engagements</a>
      </div>
    </section>
    <section class="section pillar-section" id="engagements">
      <h2>Les piliers de notre excellence</h2>
      <div class="pillar-grid">
        <article><b>1</b><h3>Exigence opérationnelle</h3><img src="${A}pillar-excellence.png" alt="" loading="lazy"><p>Chaque recrutement fait l’objet d’un alignement stratégique rigoureux pour garantir l’adéquation parfaite avec vos ambitions de croissance globale.</p></article>
        <article><b>2</b><h3>Agilité internationale</h3><img src="${A}pillar-agility.png?v=2" alt="" loading="lazy"><p>Une approche agile et réactive, capable de mobiliser des compétences rares à travers les frontières géographiques en un temps record.</p></article>
        <article><b>3</b><h3>Éthique &amp; transparence</h3><img src="${A}pillar-ethics.png?v=2" alt="" loading="lazy"><p>Une approche humaine et transparente, unissant nos équipes multiculturelles autour du respect absolu de chaque parcours professionnel.</p></article>
      </div>
    </section>
    <section class="section vision-section">
      <p class="eyebrow vision-label">Notre Vision</p>
      <img src="${A}about-vision.webp" alt="Croissance des secteurs minier, technologique et des services en Afrique" loading="lazy" decoding="async">
      <p class="vision-text">Des solutions stratégiques en ressources humaines, en formation et en opérations pour soutenir une croissance durable dans les secteurs minier, technologique et des services en Afrique.</p>
    </section>
  </main>
  ${cta({text:"Échangez avec notre équipe pour définir vos besoins de recrutement et trouver les profils adaptés à votre secteur."})}`;

const president = () => {
  const paragraphs = isEnglish ? [
    'Many business leaders devote most of their energy to the day-to-day running of their company, at the expense of the growth strategy that should guide their decisions. Yet effective operational management requires a skilled team, supported by a strong HR policy aligned with the company’s vision and ambitions.',
    'ARI’s mission is to support your organisation in acquiring scarce talent, training and developing skills, administering personnel, and establishing a coherent HR policy fully aligned with your strategic objectives.',
    'Our objective is threefold: to bring qualified experts into your business, ease your operational workload through reliable outsourcing solutions, and reduce your risks by structuring your people management practices, while optimising your costs through high-value services. Business leaders can then focus fully on their growth priorities and on activities that create value.',
    'With more than twenty years of experience in human resources, we are confident that ARI will be the ideal partner to support your company’s growth and performance.'
  ] : [
    'De nombreux dirigeants consacrent l’essentiel de leur énergie au fonctionnement quotidien de leur entreprise, au détriment de la stratégie de croissance censée guider leurs décisions. Or, un pilotage opérationnel efficace suppose une équipe compétente, soutenue par une politique RH solide et alignée sur la vision et les ambitions de l’entreprise.',
    'La mission d’ARI est d’accompagner votre organisation dans l’acquisition de talents rares, la formation et le développement des compétences, la gestion administrative du personnel, ainsi que la mise en place d’une politique RH cohérente, en parfaite synergie avec vos objectifs stratégiques.',
    'Notre objectif est triple : intégrer à votre entreprise des experts qualifiés, alléger votre charge opérationnelle grâce à des solutions de sous-traitance fiables, et réduire vos risques en structurant vos pratiques de gestion du personnel, tout en optimisant vos coûts grâce à des prestations à forte valeur ajoutée. Les dirigeants peuvent ainsi se concentrer pleinement sur leurs priorités de croissance et sur les actions génératrices de valeur.',
    'Forts de plus de vingt ans d’expérience dans le domaine des ressources humaines, nous sommes convaincus qu’ARI sera le partenaire idéal pour soutenir la croissance et la performance de votre entreprise.'
  ];
  return `<main class="president-page">
    <header class="president-heading">
      <nav class="president-breadcrumb" aria-label="${isEnglish ? 'Breadcrumb' : 'Fil d’Ariane'}"><a href="${localPath('/')}">${isEnglish ? 'Home' : 'Accueil'}</a><span aria-hidden="true">/</span><a href="${localPath('/a-propos')}">${isEnglish ? 'About Us' : 'À propos'}</a></nav>
      <p class="eyebrow">Agile Resources International</p>
      <h1>${isEnglish ? 'A word from the President' : 'Le mot du président'}</h1>
      <span class="title-rule"></span>
    </header>
    <div class="president-layout">
      <figure class="president-portrait">
        <img src="${A}alpha-toure-president.webp" alt="Alpha Touré, ${isEnglish ? 'President of Agile Resources International' : 'président d’Agile Resources International'}" width="832" height="1210" fetchpriority="high" decoding="async">
        <figcaption><strong>Alpha Touré</strong><span>${isEnglish ? 'President' : 'Président'}</span></figcaption>
      </figure>
      <article class="president-message" aria-label="${isEnglish ? 'Message from Alpha Touré' : 'Message d’Alpha Touré'}">
        ${paragraphs.map((text, index) => `<p${index === 0 ? ' class="president-lead"' : ''}>${text}</p>`).join('')}
        <footer class="president-signature"><strong>Alpha Touré</strong><span>${isEnglish ? 'President · Agile Resources International' : 'Président · Agile Resources International'}</span></footer>
      </article>
    </div>
  </main>${cta()}`;
};

const managingDirector = () => {
  const title = isEnglish ? 'A word from the Managing Director' : 'Le mot du directeur général';
  const role = isEnglish ? 'Managing Director' : 'Directeur général';
  const pillars = isEnglish ? ['Trust', 'Professionalism', 'Expertise'] : ['La confiance', 'Le professionnalisme', 'La compétence'];
  const commitments = isEnglish ? [
    'Bringing highly qualified talent into your organisation',
    'Improving the performance of your teams',
    'Measurably reducing your operating costs',
    'Strengthening stability within your organisation'
  ] : [
    'L’intégration de talents hautement qualifiés',
    'Une performance accrue de vos équipes',
    'Une réduction mesurable de vos coûts opérationnels',
    'Une stabilité renforcée au sein de votre structure'
  ];
  return `<main class="president-page director-page">
    <header class="president-heading">
      <nav class="president-breadcrumb" aria-label="${isEnglish ? 'Breadcrumb' : 'Fil d’Ariane'}"><a href="${localPath('/')}">${isEnglish ? 'Home' : 'Accueil'}</a><span aria-hidden="true">/</span><a href="${localPath('/a-propos')}">${isEnglish ? 'About Us' : 'À propos'}</a></nav>
      <p class="eyebrow">Agile Resources International</p>
      <h1>${title}</h1><span class="title-rule"></span>
    </header>
    <div class="president-layout">
      <figure class="president-portrait director-portrait">
        <img src="${A}youssouf-camara-dg.webp" alt="Youssouf Camara, ${role}" width="824" height="1024" fetchpriority="high" decoding="async">
        <figcaption><strong>Youssouf Camara</strong><span>${role}</span></figcaption>
      </figure>
      <article class="president-message" aria-label="${isEnglish ? 'Message from Youssouf Camara' : 'Message de Youssouf Camara'}">
        <p class="president-lead">${isEnglish ? 'ARI is driven by an unwavering commitment to excellence. We provide your organisation with tailored HR support, fully adapted to your structure, challenges and ambitions. Our approach rests on three fundamental pillars:' : 'ARI cultive une obsession pour l’excellence. Nous apportons à votre organisation un accompagnement RH sur mesure, entièrement adapté à votre structure, vos enjeux et vos ambitions. Notre approche repose sur trois piliers fondamentaux :'}</p>
        <ul class="director-principles">${pillars.map(text => `<li><strong>${text}</strong></li>`).join('')}</ul>
        <p>${isEnglish ? 'These pillars form the foundation of a lasting and effective partnership, essential for any business seeking to safeguard its development and strengthen its human capital.' : 'Ces piliers constituent la base d’une collaboration durable et performante, essentielle à toute entreprise souhaitant sécuriser son évolution et renforcer son capital humain.'}</p>
        <p>${isEnglish ? 'Our commitment is clear: to create tangible value within your organisation. This means:' : 'Notre engagement est clair : créer une valeur tangible au sein de votre organisation. Cela se traduit par :'}</p>
        <ul class="director-commitments">${commitments.map(text => `<li><strong>${text}</strong></li>`).join('')}</ul>
        <p>${isEnglish ? 'We are confident that ARI’s solutions will exceed your expectations and contribute directly to your company’s growth, resilience and competitiveness.' : 'Nous sommes convaincus que les solutions d’ARI dépasseront vos attentes et contribueront directement à la croissance, la solidité et la compétitivité de votre entreprise.'}</p>
        <footer class="president-signature"><strong>Youssouf Camara</strong><span>${role} · Agile Resources International</span></footer>
      </article>
    </div>
  </main>${cta()}`;
};

const detailHero = (eyebrow, title, text, modifier = "") => `
  <section class="detail-hero ${modifier}">
    <p class="eyebrow">${eyebrow}</p><h1>${title}</h1><span class="title-rule"></span><p>${text}</p>
  </section>`;

const steps = (items) => `<div class="feature-grid">${items.map(([n,t,d])=>`<article><b>${n}</b><h3>${t}</h3><p>${d}</p></article>`).join("")}</div>`;

const enterprises = () => `
  <main>
    <section class="enterprise-cover">
      <div class="enterprise-cover-content">
        <p class="eyebrow">Acquisition de talents</p>
        <h1>Identifiez les <br>talents qui <br>feront la <br>différence</h1>
        <p>ARI simplifie vos recrutements stratégiques en identifiant rapidement des profils qualifiés, expérimentés et adaptés à vos exigences. De l’expertise technique au leadership, nous vous aidons à renforcer vos équipes là où l’impact compte.</p>
        <a class="button" href="/contact?type=entreprise">Confier un mandat</a>
      </div>
    </section>
    <section class="section enterprise-solutions">
      <p class="eyebrow">Notre Expertise</p>
      <h2>Solutions sur mesure</h2>
      <span class="title-rule"></span>
      <p class="section-lead">Grâce à notre réseau international, nous mettons en relation les entreprises les plus exigeantes avec des dirigeants et experts hautement qualifiés.</p>
      <div class="enterprise-card-grid">
        <article><div class="enterprise-card-head"><span><img src="${A}icon-enterprises.png" alt="" loading="lazy"></span><img src="${A}solution-enterprises.webp" alt="Exploitation minière" loading="lazy" decoding="async"></div><h3>Recherche exécutive</h3><p>Identification et sélection de dirigeants, cadres et experts stratégiques capables d’accompagner vos transformations et de créer une valeur durable.</p></article>
        <article><div class="enterprise-card-head"><span><img src="${A}icon-candidates.png" alt="" loading="lazy"></span><img src="${A}solution-candidates.webp" alt="Professionnelle en entreprise" loading="lazy" decoding="async"></div><h3>Réseau d’excellence</h3><p>Mobilisation rapide de profils hautement qualifiés grâce à notre réseau international, afin de répondre efficacement à vos enjeux de recrutement et aux pénuries de compétences.</p></article>
        <article><div class="enterprise-card-head"><span><img src="${A}icon-advice.png" alt="" loading="lazy"></span><img src="${A}solution-advice.webp" alt="Échange avec un consultant" loading="lazy" decoding="async"></div><h3>Performance et alignement</h3><p>Nous optimisons votre capital humain en alignant vos talents, votre organisation et vos objectifs stratégiques pour soutenir une croissance durable.</p></article>
      </div>
    </section>
    <section class="enterprise-method">
      <p class="eyebrow">Notre méthode</p><h2>Trois étapes vers l’excellence</h2>
      <div class="enterprise-method-grid">
        <article><b>1.</b><h3>Analyse des exigences</h3><p>Nous définissons avec précision vos exigences techniques, opérationnelles et culturelles afin d’identifier le profil le plus adapté à votre organisation.</p></article>
        <article><b>2.</b><h3>Identification des talents</h3><p>Grâce à notre réseau international et à notre accès privilégié à des profils qualifiés, nous identifions les experts répondant précisément à vos besoins.</p></article>
        <article><b>3.</b><h3>Intégration et suivi</h3><p>Nous accompagnons chaque étape de l’intégration et de l’alignement contractuel afin de garantir une prise de fonction fluide et une efficacité opérationnelle immédiate.</p></article>
      </div>
    </section>
  </main>
  ${cta({title:"Renforcez vos équipes avec des experts qualifiés, prêts à contribuer à vos ambitions.", text:"Votre prochain talent stratégique est peut-être déjà identifié.", button:"Confier un mandat"})}`;

const candidates = () => `
  <main>
    <section class="candidate-intro">
      <h1>Votre expertise, de nouvelles <br>perspectives</h1>
      <p>ARI vous accompagne dans votre évolution professionnelle en vous connectant à des opportunités adaptées à vos compétences, votre expérience et vos ambitions.</p>
      <a class="button" href="#candidature">Déposer mon dossier</a>
    </section>
    <section class="candidate-collage" aria-label="Professionnels accompagnés par ARI">
      <img src="${A}candidate-work.webp" alt="Professionnelle au travail" loading="lazy" decoding="async">
      <img src="${A}candidate-success.webp" alt="Professionnel célébrant une réussite" loading="lazy" decoding="async">
      <img src="${A}candidate-mobile.webp" alt="Professionnelle consultant une opportunité" loading="lazy" decoding="async">
    </section>
    <section class="candidate-network">
      <div><h2>Un réseau au service de vos ambitions</h2><p>ARI met en relation des talents qualifiés avec des entreprises à la recherche d’expertises spécifiques. Nous prenons le temps de comprendre votre parcours, vos compétences et vos ambitions afin d’identifier les opportunités qui correspondent réellement à votre profil. De la sélection des opportunités à la mise en relation avec les recruteurs, jusqu’à votre prise de fonction, nous vous accompagnons pour vous permettre d’aborder chaque nouvelle étape de votre carrière avec confiance.</p><p>Notre rôle : révéler votre potentiel, créer les bonnes connexions et vous ouvrir les portes d’opportunités qui correspondent à vos ambitions.</p><a class="button" href="#candidature">Explorer les opportunités</a></div>
      <img src="${A}candidate-guidance.webp" alt="Accompagnement professionnel personnalisé" loading="lazy" decoding="async">
    </section>
    <section class="section candidate-method"><p class="eyebrow">Notre méthode</p><span class="small-rule"></span><div class="candidate-method-grid">
      <article><div><span><img src="${A}icon-technology.png" alt=""></span><h3>Évaluation</h3></div><p>Une analyse approfondie de votre expertise, de votre parcours professionnel et de vos ambitions afin d’identifier les opportunités les plus adaptées à votre profil.</p></article>
      <article><div><span><img src="${A}icon-industry.png" alt=""></span><h3>Mise en relation ciblée</h3></div><p>Nous présentons votre profil de manière confidentielle auprès d’entreprises et de décideurs à la recherche de compétences correspondant précisément à vos expertises.</p></article>
      <article><div><span><img src="${A}icon-finance.png" alt=""></span><h3>Transition et suivi</h3></div><p>Nous vous accompagnons à chaque étape de votre parcours, de la mise en relation jusqu’à votre prise de fonction, afin de faciliter une transition professionnelle sereine et réussie.</p></article>
    </div></section>
    <section class="candidate-cta"><div><h2>Prêt à faire évoluer votre carrière ?</h2><h3>Votre prochaine opportunité commence ici.</h3><p>Partagez votre profil avec ARI et laissez-nous identifier les opportunités qui correspondent à votre expertise et à vos ambitions professionnelles.</p></div><a class="button" href="#candidature">Déposer mon dossier</a></section>
    <section class="candidate-application" id="candidature">
      <div class="application-intro">
        <p class="eyebrow">Votre candidature</p>
        <h2>Envoyez-nous directement votre CV</h2>
        <span class="title-rule"></span>
        <p>Présentez-nous votre parcours et vos ambitions. Votre candidature sera étudiée de manière confidentielle par nos consultants.</p>
        <p class="file-help">Formats acceptés : PDF, DOC ou DOCX · 5 Mo maximum.</p>
      </div>
      <form action="/contact.php" method="post" enctype="multipart/form-data">
        <input type="hidden" name="request_type" value="candidat">
        <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off">
        <label>Nom et prénom<input name="name" required autocomplete="name"></label>
        <label>Adresse e-mail<input name="email" type="email" required autocomplete="email"></label>
        <label>Téléphone<input name="phone" type="tel" autocomplete="tel"></label>
        <label>Votre domaine d’expertise<input name="company" placeholder="Ex. Ingénierie, finance, technologie…"></label>
        <label>Votre message <span class="optional">(facultatif)</span><textarea name="message" rows="5" placeholder="Précisez le type d’opportunité recherché, votre mobilité ou vos disponibilités."></textarea></label>
        <label class="file-field">Votre CV<input name="cv" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required></label>
        <label class="consent"><input name="consent" type="checkbox" value="yes" required> J’accepte que mes informations et mon CV soient utilisés afin d’étudier ma candidature.</label>
        <button class="button" type="submit">Envoyer mon CV</button>
      </form>
    </section>
  </main>
  `;

const catalogue = () => window.ARITraining.catalogue(isEnglish, localPath);

const services = () => {
  const services = [
    ["01","Recherche de cadres dirigeants","Identification et approche confidentielle de dirigeants et de cadres stratégiques."],
    ["02","Recrutement spécialisé","Sourcing et sélection de profils techniques rares adaptés à votre secteur."],
    ["03","Mobilité internationale","Coordination du recrutement, de la mobilité et de l’intégration internationale."],
    ["04","Conseil RH","Optimisation des processus de recrutement et accompagnement organisationnel."],
    ["05","Formation","Programmes ciblés pour développer durablement les compétences opérationnelles."],
    ["06","Solutions opérationnelles","Renforts et dispositifs sur mesure pour soutenir les projets de croissance."],
    ["07",isEnglish ? "HR Outsourcing" : "Externalisation RH",isEnglish ? "Support with personnel administration, tailored to your organisation and the scope agreed with ARI." : "Appui à la gestion administrative du personnel, adapté à votre organisation et au périmètre défini avec ARI."],
  ];
  return `<main>${detailHero(isEnglish ? "Our Services" : "Nos services", "Des expertises adaptées à chaque secteur", "Découvrez nos solutions de recrutement, de mobilité internationale, de conseil RH et d’accompagnement opérationnel.", "catalogue-hero")}<section class="section rich-page"><p class="eyebrow">Nos services</p><h2>Une réponse adaptée à chaque ambition</h2><span class="title-rule"></span><div class="catalogue-grid">${services.map(([n,t,d])=>`<article><b>${n}</b><h3>${t}</h3><p>${d}</p></article>`).join("")}</div></section></main>${cta({title:"Construisons votre solution", text:"Sélectionnez les expertises qui répondent à vos enjeux et échangez avec un consultant ARI.", button:"Demander une proposition"})}`;
};

const contact = () => {
  return `<main class="contact-page">
    <section class="contact-process">
      <div class="contact-process-copy">
        <h1>Identification à <br>l’échelle internationale</h1>
        <div class="contact-globe-row" aria-hidden="true">
          <span></span>
          <svg class="contact-globe" viewBox="0 0 120 120" role="img">
            <circle cx="60" cy="60" r="48"></circle>
            <ellipse cx="60" cy="60" rx="22" ry="48"></ellipse>
            <path d="M12 60h96M20 38h80M20 82h80"></path>
          </svg>
          <span></span>
        </div>
        <p>Que vous soyez un directeur des ressources humaines confronté à des pénuries de compétences critiques, ou un cadre dirigeant en quête d’une nouvelle opportunité d’envergure, nous mobilisons notre réseau mondial pour vous apporter une réactivité opérationnelle inédite.</p>
      </div>
      <img src="${A}contact-guidance.webp" alt="Consultante accompagnant un professionnel" fetchpriority="high" decoding="async">
    </section>

    <section class="process-line">
      <div class="process-heading"><p class="eyebrow">Notre Processus</p><span></span></div>
      <ol class="process-steps"><li>Comprendre vos besoins</li><li>Identifier les talents</li><li>Évaluer les candidats</li><li>Présenter une sélection</li></ol>
      <div class="process-success"><span aria-hidden="true">↓</span><b>Placement réussi</b></div>
      <p class="process-promise">Réactivité garantie</p>
    </section>

    <section class="contact-launch">
      <div class="contact-launch-copy">
        <p class="contact-direct"><a href="mailto:contact@agileresources-intl.com">contact@agileresources-intl.com</a></p>
        <h2>Lancer Vos<br>Recherches</h2>
        <p>Notre équipe s’engage à analyser votre besoin de recrutement ou votre profil sous 24 heures ouvrées. Remplissez ce formulaire pour être mis en relation directe avec un consultant expert de votre secteur d’activité.</p>
      </div>
      <form id="contact-form" action="/contact.php" method="post">
        <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off">
        <input type="hidden" name="request_type" value="entreprise">
        <label>Nom complet et entreprise*<input name="name" required autocomplete="name"></label>
        <label>Adresse e-mail professionnelle*<input name="email" type="email" required autocomplete="email"></label>
        <label>Numéro de téléphone direct<input name="phone" type="tel" autocomplete="tel"></label>
        <label>Description de votre besoin en capital humain*<textarea name="message" rows="4" required></textarea></label>
        <label class="consent"><input name="consent" type="checkbox" value="yes" required> J’accepte que mes informations soient utilisées afin de répondre à ma demande.</label>
      </form>
      <button class="button contact-submit" type="submit" form="contact-form">Envoyer Ma Demande</button>
    </section>
  </main>`;
};

const expertNetwork = () => `
  <main class="expert-network-page">
    <section class="expert-network-heading">
      <p class="eyebrow">${isEnglish ? 'People and expertise' : 'Des talents au service de vos projets'}</p>
      <h1>${isEnglish ? 'Our Expert Network' : 'Notre réseau d’experts'}</h1>
      <p>${isEnglish ? 'A growing network of experienced professionals bringing together complementary skills to address organisations’ strategic and operational challenges.' : 'Un réseau en développement de professionnels expérimentés qui réunit des compétences complémentaires pour répondre aux enjeux stratégiques et opérationnels des organisations.'}</p>
    </section>
    <section class="expert-network-grid" aria-label="${isEnglish ? 'Experts' : 'Les experts'}">
      <article class="expert-card" aria-labelledby="beydi-name">
        <img class="expert-card-photo" src="${A}beydi-sangare-expert.webp" alt="${isEnglish ? 'Professional portrait of Beydi Sangaré' : 'Portrait professionnel de Beydi Sangaré'}" width="1254" height="1254" fetchpriority="high">
        <div class="expert-card-content">
          <p class="eyebrow">${isEnglish ? 'Artificial Intelligence & Digital Transformation' : 'Intelligence artificielle & transformation digitale'}</p>
          <h2 id="beydi-name">Beydi Sangaré</h2>
          <p class="expert-role">${isEnglish ? 'AI Expert' : 'Expert en intelligence artificielle'}</p>
          <p>${isEnglish ? 'A manager and graduate of Télécom SudParis, a leading French engineering school, Beydi has over ten years of experience supporting digital, Data and AI programmes. He helps organisations frame and lead AI initiatives, from identifying relevant use cases to designing practical solutions.' : 'Manager et diplômé de Télécom SudParis, grande école française d’ingénieurs, Beydi possède plus de dix ans d’expérience dans l’accompagnement de programmes digitaux, Data et IA. Il aide les organisations à cadrer et piloter leurs initiatives d’intelligence artificielle, de l’identification des cas d’usage à la conception de solutions concrètes.'}</p>
          <p>${isEnglish ? 'At Eramet, he contributed to two AI agents: a multilingual HR and IT assistant that helps employees access information, and an agent for analysing internal processes. His experience also includes AI architecture, documentary assistants, Data projects and information systems transformation. His expertise can support use cases in mining, energy and industrial sectors.' : 'Chez Eramet, il a contribué à deux agents IA : un assistant RH et IT multilingue facilitant l’accès des collaborateurs à l’information, et un agent d’analyse des processus internes. Son expérience couvre également l’architecture IA, les assistants documentaires, les projets Data et la transformation des systèmes d’information. Son expertise peut contribuer à des cas d’usage dans les secteurs minier, énergétique et industriel.'}</p>
          <h3>${isEnglish ? 'Areas of expertise' : 'Domaines d’expertise'}</h3>
          <ul class="expertise-tags">
            <li>${isEnglish ? 'AI for HR and employee services' : 'IA appliquée aux RH et aux services aux collaborateurs'}</li>
            <li>${isEnglish ? 'AI agents and documentary assistants' : 'Agents IA et assistants documentaires'}</li>
            <li>${isEnglish ? 'Process analysis and improvement' : 'Analyse et amélioration des processus'}</li>
            <li>${isEnglish ? 'AI architecture and use-case framing' : 'Architecture IA et cadrage de cas d’usage'}</li>
            <li>${isEnglish ? 'AI and Data for mining, energy and industry' : 'IA et Data pour les secteurs minier, énergétique et industriel'}</li>
          </ul>
          <a class="button" href="${localPath('/contact')}">${isEnglish ? 'Discuss your needs' : 'Échanger sur vos besoins'} <span aria-hidden="true">→</span></a>
        </div>
      </article>
      <aside class="expert-network-more">
        <span class="expert-network-more-icon" aria-hidden="true">+</span>
        <h2>${isEnglish ? 'More experts to come' : 'D’autres experts bientôt'}</h2>
        <p>${isEnglish ? 'This network is designed to grow. New profiles and areas of expertise will be added as they join.' : 'Cette page est conçue pour accueillir plusieurs profils. De nouveaux experts et domaines de compétence viendront enrichir le réseau.'}</p>
      </aside>
    </section>
  </main>`;

const pages = {"/sirexe-2026":() => window.ARISirexe.page(isEnglish, localPath),"/":home,"/industries":industries,"/entreprises":enterprises,"/candidats":candidates,"/catalogue":catalogue,"/reseau-experts":expertNetwork,"/services":services,"/a-propos":about,"/mot-du-president":president,"/mot-du-directeur-general":managingDirector,"/contact":contact};
const path = cleanPath();
const trainingSlug = path.startsWith('/catalogue/') ? path.slice('/catalogue/'.length) : null;
const trainingCourse = (window.ARI_TRAINING_COURSES || []).find(course => course.id === trainingSlug);
const render = pages[path] || (trainingCourse ? () => window.ARITraining.detail(trainingSlug, isEnglish, localPath) : () => `<main>${detailHero("Erreur 404", "Cette page n’existe pas", "La page demandée est introuvable.")}<section class="section"><a class="button" href="/">Retour à l’accueil</a></section></main>`);
document.getElementById("app").innerHTML = `${header(path)}${render()}${footer()}`;
document.documentElement.lang = language;

if (isEnglish) {
  const translations = window.ARI_TRANSLATIONS_EN || {};
  const walker = document.createTreeWalker(document.getElementById("app"), NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    const original = node.nodeValue.trim();
    if (!Object.prototype.hasOwnProperty.call(translations, original)) return;
    node.nodeValue = node.nodeValue.replace(original, translations[original]);
  });

  document.querySelectorAll("[alt], [placeholder], [title], [aria-label]").forEach((element) => {
    ["alt", "placeholder", "title", "aria-label"].forEach((attribute) => {
      const original = element.getAttribute(attribute);
      if (original && Object.prototype.hasOwnProperty.call(translations, original)) {
        element.setAttribute(attribute, translations[original]);
      }
    });
  });

  document.querySelectorAll('a[href^="/"]').forEach((link) => {
    const target = link.getAttribute("href");
    if (!target || link.closest(".language-switcher") || target.startsWith("/en") || target.startsWith("/admin")) return;
    link.setAttribute("href", target === "/" ? "/en" : `/en${target}`);
  });

  document.querySelectorAll('form[action="/contact.php"]').forEach((form) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "lang";
    input.value = "en";
    form.appendChild(input);
  });
}

const notFoundTitle = isEnglish ? "Page not found" : "Page introuvable";
document.title = `${path === "/" ? "Agile Resources International" : trainingCourse ? trainingCourse[isEnglish ? 'en' : 'fr'].title : path === "/services" ? (isEnglish ? 'Our Services' : 'Nos services') : path === "/mot-du-president" ? (isEnglish ? "A word from the President" : "Le mot du président") : path === "/mot-du-directeur-general" ? (isEnglish ? "A word from the Managing Director" : "Le mot du directeur général") : navItems.find(([p])=>p===path)?.[1] || notFoundTitle} — ARI`;
document.querySelector('meta[name="description"]')?.setAttribute("content", isEnglish
  ? "Agile Resources International — strategic international talent acquisition."
  : "Agile Resources International — acquisition stratégique de talents internationaux."
);
if (trainingCourse || path === '/catalogue') {
  document.querySelector('meta[name="description"]')?.setAttribute('content', trainingCourse
    ? trainingCourse[isEnglish ? 'en' : 'fr'].description
    : (isEnglish ? 'Explore ARI’s seven corporate training programmes for professionals, managers and leaders. Select programmes and request a tailored proposal.' : 'Découvrez les sept formations ARI pour cadres, managers et dirigeants. Explorez les programmes, composez votre sélection et demandez une proposition adaptée.'));
}

const adminImages = window.ARI_ADMIN_SETTINGS?.images || {};
const pageImageSlots = {
  "/catalogue": {
    ".training-hero-visual > img": "training_hero",
  },
  "/mot-du-directeur-general": {
    ".director-portrait > img": "director_portrait",
  },
  "/mot-du-president": {
    ".president-portrait > img": "president_portrait",
  },
  "/": {
    ".home-hero > img": "home_hero",
    ".home-president-photo": "president_portrait",
    ".home-director-photo": "director_portrait",
    ".solution-grid article:nth-child(1) .card-media > img": "home_enterprises",
    ".solution-grid article:nth-child(2) .card-media > img": "home_candidates",
    ".solution-grid article:nth-child(3) .card-media > img": "home_advice",
    ".full-photo": "home_team",
  },
  "/industries": {
    ".industry-hero > img": "industries_hero",
    ".full-photo": "industries_quarry",
  },
  "/a-propos": {
    ".about-media > img": "about_office",
    ".vision-section > img": "about_vision",
  },
  "/entreprises": {
    ".enterprise-card-grid article:nth-child(1) .enterprise-card-head > img": "enterprise_card_1",
    ".enterprise-card-grid article:nth-child(2) .enterprise-card-head > img": "enterprise_card_2",
    ".enterprise-card-grid article:nth-child(3) .enterprise-card-head > img": "enterprise_card_3",
  },
  "/candidats": {
    ".candidate-collage img:nth-child(1)": "candidate_1",
    ".candidate-collage img:nth-child(2)": "candidate_2",
    ".candidate-collage img:nth-child(3)": "candidate_3",
    ".candidate-network > img": "candidate_guidance",
  },
  "/contact": {
    ".contact-process > img": "contact_guidance",
  },
};

Object.entries(pageImageSlots[path] || {}).forEach(([selector, slot]) => {
  const replacement = adminImages[slot];
  const image = document.querySelector(selector);
  if (replacement && image) image.src = replacement;
});

window.ARITraining?.init(isEnglish);
window.ARISirexe.init(isEnglish, path);

const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".main-nav");
menuButton?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? (isEnglish ? "Close menu" : "Fermer le menu") : (isEnglish ? "Open menu" : "Ouvrir le menu"));
  menuButton.textContent = open ? "×" : "☰";
  document.body.classList.toggle("menu-open", open);
});

const closeMenu = () => {
  document.querySelectorAll('.about-navigation').forEach((menu) => { menu.open = false; });
  nav?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", isEnglish ? "Open menu" : "Ouvrir le menu");
  if (menuButton) menuButton.textContent = "☰";
  document.body.classList.remove("menu-open");
};
nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
nav?.addEventListener("click", (event) => {
  if (event.target === nav) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
document.addEventListener('click', (event) => {
  document.querySelectorAll('.about-navigation[open]').forEach((menu) => {
    if (!menu.contains(event.target)) menu.open = false;
  });
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 1100) closeMenu();
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealGroups = [
  ["main section > .eyebrow, main section > h1, main section > h2, main section > .title-rule, main section > .small-rule", "reveal-up"],
  [".home-hero > div > *, .industry-hero > div > *, .about-hero > div > *, .enterprise-cover-content > *, .candidate-intro > *", "reveal-up"],
  [".home-hero > img, .industry-hero > img, .about-media > img, .contact-process > img, .candidate-network > img", "reveal-image"],
  [".full-photo", "reveal-wide-image"],
  [".enterprise-cover", "reveal-cover"],
  [".solution-grid article, .domain-grid article, .enterprise-card-grid article, .enterprise-method-grid article, .candidate-method-grid article, .pillar-grid article, .feature-grid article, .catalogue-grid article", "reveal-card"],
  [".candidate-collage img", "reveal-image"],
  [".cta-section > *, .candidate-cta > *, .contact-launch > *", "reveal-up"],
];

const revealElements = [];
revealGroups.forEach(([selector, animationClass]) => {
  document.querySelectorAll(selector).forEach((element, index) => {
    if (element.classList.contains("reveal-ready")) return;
    element.classList.add("reveal-ready", animationClass);
    element.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 90}ms`);
    revealElements.push(element);
  });
});

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  revealElements.forEach((element) => revealObserver.observe(element));
}

const animateCounter = (element) => {
  const original = element.textContent.trim();
  const target = Number.parseInt(original, 10);
  if (!Number.isFinite(target)) return;
  const suffix = original.includes("%") ? "%" : "";
  if (reducedMotion) {
    element.textContent = `${target}${suffix}`;
    return;
  }
  const duration = 950;
  let startedAt;
  const tick = (time) => {
    startedAt ??= time;
    const progress = Math.min((time - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${Math.round(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const counters = document.querySelectorAll(".stats strong");
if (counters.length) {
  if (reducedMotion || !("IntersectionObserver" in window)) {
    counters.forEach(animateCounter);
  } else {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.animated === "true") return;
        entry.target.dataset.animated = "true";
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.55 });
    counters.forEach((counter) => counterObserver.observe(counter));
  }
}
