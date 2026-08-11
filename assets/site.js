const A = "/assets/";

const navItems = [
  ["/", "Accueil"],
  ["/industries", "Les Industries"],
  ["/entreprises", "Espace Entreprises"],
  ["/candidats", "Espace Candidats"],
  ["/catalogue", "Notre Catalogue"],
  ["/a-propos", "À propos"],
  ["/contact", "Nous contacter"],
];

const cleanPath = () => {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path || "/";
};

const header = (path) => `
  <header class="site-header">
    <a class="header-logo" href="/" aria-label="Agile Resources International — Accueil">
      <img src="${A}logo-ari.png" alt="Agile Resources International">
    </a>
    <button class="menu-button" type="button" aria-label="Ouvrir le menu" aria-expanded="false">☰</button>
    <nav class="main-nav" aria-label="Navigation principale">
      ${navItems.map(([href, label]) => `<a href="${href}"${path === href ? ' class="active" aria-current="page"' : ""}>${label}</a>`).join("")}
    </nav>
  </header>`;

const footer = () => `
  <footer class="site-footer">
    <div class="footer-intro">
      <span class="footer-rule"></span>
      <a class="footer-brand" href="/">Agile Resources<br>International (ARI)</a>
      <p>Votre partenaire de confiance pour un sourcing<br>efficace, agile et international.</p>
    </div>
    <div>
      <h4>NAVIGATION</h4>
      ${navItems.slice(0, 6).map(([href, label]) => `<a href="${href}">${label.toUpperCase()}</a>`).join("")}
    </div>
    <div>
      <h4>NOUS CONTACTER</h4>
      <a class="footer-contact-link" href="/contact">contact@agileresources-intl.com</a>
      <p>Paris · New York · Abidjan<br>Accompagnement RH 24/7</p>
    </div>
    <div class="footer-bottom">
      <small>© 2026 Agile Resources International (ARI)</small>
      <small>ACQUISITION STRATÉGIQUE DE TALENTS INTERNATIONAUX</small>
    </div>
  </footer>`;

const cta = ({title = "Prêt à sécuriser vos talents ?", text, button = "Contacter un expert"} = {}) => `
  <section class="cta-section">
    <div>
      <h2>${title}</h2>
      <p>${text || "Prenez contact avec nos consultants pour concevoir une stratégie de sourcing adaptée à vos ambitions."}</p>
    </div>
    <a class="button" href="/contact">${button}</a>
  </section>`;

const home = () => `
  <main>
    <section class="home-hero two-columns">
      <div>
        <p class="eyebrow">Agile Resources International</p>
        <h1>Acquisition<br>stratégique de<br>talents<br>internationaux</h1>
        <span class="title-rule"></span>
        <p>Agile Resources International met à votre disposition un réseau mondial de professionnels hautement qualifiés. Nous accompagnons les organisations exigeantes dans l’identification, l’évaluation et le recrutement de profils stratégiques, avec une approche agile, discrète et orientée résultats.</p>
        <a class="button" href="#solutions">Découvrir nos solutions</a>
      </div>
      <img src="${A}mine.jpg" alt="Site minier vu du ciel">
    </section>

    <section class="section solutions" id="solutions">
      <p class="eyebrow">Notre Expertise</p>
      <h2>Solutions sur mesure</h2>
      <span class="title-rule"></span>
      <p>Nous concevons des solutions adaptées à vos enjeux afin d’optimiser la gestion de votre capital humain, de sécuriser la mobilité internationale et de favoriser l’intégration durable de vos collaborateurs.</p>
      <div class="solution-grid">
        <article>
          <div class="card-media"><span><img src="${A}icon-enterprises.png" alt=""></span><img src="${A}solution-enterprises.jpg" alt="Mine et industrie"></div>
          <h3>Entreprises</h3>
          <p>Nous accompagnons les entreprises dans la recherche, la sélection et le recrutement de profils qualifiés, de spécialistes et de dirigeants. Grâce à une approche personnalisée, nous identifions les compétences les plus adaptées à vos objectifs et vous aidons à constituer des équipes performantes, en France comme à l’international.</p>
        </article>
        <article>
          <div class="card-media"><span><img src="${A}icon-candidates.png" alt=""></span><img src="${A}solution-candidates.jpg" alt="Professionnelle préparant sa carrière"></div>
          <h3>Candidats</h3>
          <p>Nous accompagnons les professionnels dans leur évolution en leur donnant accès à des opportunités de carrière correspondant à leurs compétences et à leurs ambitions. De la préparation de leur candidature à leur intégration, nous assurons un suivi personnalisé à chaque étape de leur parcours.</p>
        </article>
        <article>
          <div class="card-media"><span><img src="${A}icon-advice.png" alt=""></span><img src="${A}solution-advice.jpg" alt="Consultants en réunion"></div>
          <h3>Conseil</h3>
          <p>Nous conseillons les entreprises dans leurs projets de recrutement, de mobilité internationale et de développement organisationnel. Notre accompagnement permet de sécuriser vos recrutements, d’optimiser vos processus et de mettre en place des solutions durables favorisant votre croissance.</p>
        </article>
      </div>
    </section>
    <img class="full-photo" src="${A}team.jpg" alt="Équipe en réunion">
  </main>
  ${cta({title:"Prêt à optimiser vos équipes ?", text:"Contactez nos consultants pour concevoir une stratégie d’embauche adaptée à vos ambitions professionnelles.", button:"Nous contacter"})}`;

const industries = () => `
  <main>
    <section class="industry-hero two-columns">
      <img src="${A}worker.jpg" alt="Professionnel de l’industrie">
      <div>
        <h1>Une expertise dédiée aux talents rares</h1>
        <span class="title-rule"></span>
        <p>Pour répondre aux exigences des industries de pointe, nous mobilisons des consultants experts, capables d’identifier les compétences techniques les plus rares et de sécuriser vos recrutements stratégiques à l’échelle internationale.</p>
        <a class="button" href="#domains">Consulter nos secteurs</a>
        <div class="stats">
          <div><strong>15</strong><span>Secteurs d’excellence</span></div>
          <div><strong>100%</strong><span>Talents qualifiés</span></div>
        </div>
        <img class="africa-map" src="${A}africa-map.png" alt="Carte de l’Afrique">
      </div>
    </section>
    <section class="section domains" id="domains">
      <p class="eyebrow">Nos Domaines</p>
      <span class="small-rule"></span>
      <div class="domain-grid">
        <article><span class="domain-icon"><img src="${A}icon-technology.png" alt=""></span><h3>Technologie &amp; Digital</h3><p>Identification d’ingénieurs cloud, d’architectes de données et d’experts en cybersécurité pour renforcer vos infrastructures critiques.</p></article>
        <article><span class="domain-icon"><img src="${A}icon-industry.png" alt=""></span><h3>Ingénierie &amp; Industrie</h3><p>Recrutement de profils spécialisés en automatisation, robotique et gestion de projets industriels à l’échelle internationale.</p></article>
        <article><span class="domain-icon"><img src="${A}icon-finance.png" alt=""></span><h3>Finance &amp; Conseil</h3><p>Identification de cadres dirigeants et de spécialistes en gestion des risques pour sécuriser vos opérations financières à l’échelle mondiale.</p></article>
      </div>
      <a class="button centered-button" href="/catalogue">Parmi de nombreux autres services</a>
    </section>
    <img class="full-photo" src="${A}quarry.jpg" alt="Carrière minière">
  </main>
  ${cta({text:"Prenez contact avec nos bureaux de Paris ou de Genève pour analyser vos enjeux de recrutement et concevoir une stratégie de sourcing sur mesure adaptée à votre industrie."})}`;

const about = () => `
  <main>
    <section class="about-hero two-columns">
      <div>
        <h1>Une nouvelle vision du capital humain</h1>
        <span class="title-rule"></span>
        <p>Née de la volonté d’offrir une véritable alternative aux cabinets de recrutement traditionnels, ARI accompagne les organisations d’envergure dans la gestion de leur capital humain avec agilité et réactivité.</p>
        <p class="eyebrow engagement-label">Nos engagements</p>
        <p>Nous combinons la force d’un réseau international à l’attention personnalisée d’une structure à taille humaine, sans jamais transiger sur l’excellence.</p>
      </div>
      <div class="about-media">
        <img src="${A}office.jpg" alt="Collaborateurs au bureau">
        <a class="button" href="#engagements">Nos engagements</a>
      </div>
    </section>
    <section class="section pillar-section" id="engagements">
      <h2>Les piliers de notre excellence</h2>
      <div class="pillar-grid">
        <article><b>1</b><h3>Exigence opérationnelle</h3><img src="${A}pillar-excellence.png" alt=""><p>Chaque recrutement fait l’objet d’un alignement stratégique rigoureux pour garantir l’adéquation parfaite avec vos ambitions de croissance globale.</p></article>
        <article><b>2</b><h3>Agilité internationale</h3><img src="${A}pillar-agility.png?v=2" alt=""><p>Une approche agile et réactive, capable de mobiliser des compétences rares à travers les frontières géographiques en un temps record.</p></article>
        <article><b>3</b><h3>Éthique &amp; transparence</h3><img src="${A}pillar-ethics.png?v=2" alt=""><p>Une approche humaine et transparente, unissant nos équipes multiculturelles autour du respect absolu de chaque parcours professionnel.</p></article>
      </div>
    </section>
    <section class="section vision-section">
      <p class="eyebrow vision-label">Notre Vision</p>
      <img src="${A}about-vision.png" alt="Croissance des secteurs minier, technologique et des services en Afrique">
      <p class="vision-text">Des solutions stratégiques en ressources humaines, en formation et en opérations pour soutenir une croissance durable dans les secteurs minier, technologique et des services en Afrique.</p>
    </section>
  </main>
  ${cta({text:"Prenez contact avec nos bureaux de Paris ou de Genève pour analyser vos enjeux de recrutement et concevoir une stratégie de sourcing sur mesure adaptée à votre industrie."})}`;

const detailHero = (eyebrow, title, text, modifier = "") => `
  <section class="detail-hero ${modifier}">
    <p class="eyebrow">${eyebrow}</p><h1>${title}</h1><span class="title-rule"></span><p>${text}</p>
  </section>`;

const steps = (items) => `<div class="feature-grid">${items.map(([n,t,d])=>`<article><b>${n}</b><h3>${t}</h3><p>${d}</p></article>`).join("")}</div>`;

const enterprises = () => `
  <main>
    ${detailHero("Espace Entreprises", "Les talents stratégiques dont votre organisation a besoin", "Confiez-nous vos besoins en recrutement, mobilité ou conseil. Notre équipe construit une réponse ciblée, confidentielle et adaptée à vos marchés.", "enterprise-hero")}
    <section class="section rich-page"><p class="eyebrow">Notre méthode</p><h2>Un accompagnement construit autour de vos enjeux</h2><span class="title-rule"></span>${steps([["01","Cadrage du besoin","Un consultant dédié analyse votre organisation, votre secteur, vos délais et les compétences indispensables."],["02","Recherche ciblée","Nos réseaux internationaux et notre approche directe mobilisent rapidement les profils les plus pertinents."],["03","Sélection sécurisée","Nous évaluons les compétences, la motivation, l’adéquation culturelle et accompagnons chaque étape jusqu’à l’intégration."]])}</section>
    <section class="band"><div><p class="eyebrow">Solutions entreprises</p><h2>Recrutement, mobilité et conseil</h2></div><ul><li>Recherche de cadres, spécialistes et dirigeants</li><li>Recrutement international et mobilité</li><li>Évaluation et présélection des candidats</li><li>Conseil en organisation et capital humain</li></ul></section>
  </main>
  ${cta({title:"Parlons de votre prochain recrutement", text:"Décrivez votre besoin à nos consultants. Vous recevrez une première orientation confidentielle et concrète.", button:"Déposer un besoin"})}`;

const candidates = () => `
  <main>
    ${detailHero("Espace Candidats", "Donnez une dimension internationale à votre carrière", "Déposez votre profil et échangez avec nos consultants sur les opportunités qui correspondent réellement à votre expérience et à vos ambitions.", "candidate-hero")}
    <section class="section rich-page"><p class="eyebrow">Votre parcours</p><h2>Un suivi humain à chaque étape</h2><span class="title-rule"></span>${steps([["01","Échange confidentiel","Nous prenons le temps de comprendre votre parcours, vos compétences et vos objectifs professionnels."],["02","Opportunités ciblées","Votre profil est présenté uniquement pour des missions cohérentes avec vos attentes et avec votre accord."],["03","Préparation et intégration","Nous vous accompagnons pendant les entretiens, la mobilité éventuelle et votre prise de poste."]])}</section>
    <section class="band"><div><p class="eyebrow">Profils recherchés</p><h2>Des expertises pour les secteurs d’avenir</h2></div><ul><li>Technologie, données et cybersécurité</li><li>Ingénierie, industrie et opérations minières</li><li>Finance, risques et fonctions dirigeantes</li><li>Gestion de projets et transformation</li></ul></section>
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

const catalogue = () => {
  const services = [
    ["01","Recherche de cadres dirigeants","Identification et approche confidentielle de dirigeants et de cadres stratégiques."],
    ["02","Recrutement spécialisé","Sourcing et sélection de profils techniques rares adaptés à votre secteur."],
    ["03","Mobilité internationale","Coordination du recrutement, de la mobilité et de l’intégration internationale."],
    ["04","Conseil RH","Optimisation des processus de recrutement et accompagnement organisationnel."],
    ["05","Formation","Programmes ciblés pour développer durablement les compétences opérationnelles."],
    ["06","Solutions opérationnelles","Renforts et dispositifs sur mesure pour soutenir les projets de croissance."],
  ];
  return `<main>${detailHero("Notre Catalogue", "Des expertises adaptées à chaque secteur", "Découvrez nos solutions de recrutement, de mobilité internationale, de conseil RH et d’accompagnement opérationnel.", "catalogue-hero")}<section class="section rich-page"><p class="eyebrow">Nos services</p><h2>Une réponse adaptée à chaque ambition</h2><span class="title-rule"></span><div class="catalogue-grid">${services.map(([n,t,d])=>`<article><b>${n}</b><h3>${t}</h3><p>${d}</p></article>`).join("")}</div></section></main>${cta({title:"Construisons votre solution", text:"Sélectionnez les expertises qui répondent à vos enjeux et échangez avec un consultant ARI.", button:"Demander une proposition"})}`;
};

const contact = () => {
  const type = new URLSearchParams(window.location.search).get("type") || "";
  return `<main>${detailHero("Nous contacter", "Parlons de vos prochains enjeux", "Décrivez votre besoin. Un consultant ARI vous répondra avec une première orientation confidentielle et concrète.", "contact-hero")}<section class="contact-section"><form action="/contact.php" method="post"><input class="hp" type="text" name="website" tabindex="-1" autocomplete="off"><label>Nature de la demande<select name="request_type" required><option value="">Sélectionner</option><option value="entreprise"${type==="entreprise"?" selected":""}>Besoin d’une entreprise</option><option value="candidat"${type==="candidat"?" selected":""}>Candidature</option><option value="catalogue">Information sur nos services</option><option value="autre">Autre demande</option></select></label><label>Nom et prénom<input name="name" required autocomplete="name"></label><label>Adresse e-mail<input name="email" type="email" required autocomplete="email"></label><label>Organisation<input name="company" autocomplete="organization"></label><label>Téléphone<input name="phone" type="tel" autocomplete="tel"></label><label>Votre message<textarea name="message" rows="7" required></textarea></label><label class="consent"><input name="consent" type="checkbox" value="yes" required> J’accepte que mes informations soient utilisées afin de répondre à ma demande.</label><button class="button" type="submit">Envoyer la demande</button></form><aside><h3>Agile Resources International</h3><p>Paris · New York · Abidjan</p><p><a href="mailto:contact@agileresources-intl.com">contact@agileresources-intl.com</a></p><p>Accompagnement RH 24/7</p></aside></section></main>`;
};

const pages = {"/":home,"/industries":industries,"/entreprises":enterprises,"/candidats":candidates,"/catalogue":catalogue,"/a-propos":about,"/contact":contact};
const path = cleanPath();
const render = pages[path] || (() => `<main>${detailHero("Erreur 404", "Cette page n’existe pas", "La page demandée est introuvable.")}<section class="section"><a class="button" href="/">Retour à l’accueil</a></section></main>`);
document.getElementById("app").innerHTML = `${header(path)}${render()}${footer()}`;
document.title = `${path === "/" ? "Agile Resources International" : navItems.find(([p])=>p===path)?.[1] || "Page introuvable"} — ARI`;

const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".main-nav");
menuButton?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.textContent = open ? "×" : "☰";
});
