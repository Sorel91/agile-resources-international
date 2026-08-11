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
    <section class="enterprise-cover">
      <div class="enterprise-cover-content">
        <p class="eyebrow">Acquisition de talents</p>
        <h1>Identifiez les<br>talents qui<br>feront la<br>différence</h1>
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
        <article><div class="enterprise-card-head"><span><img src="${A}icon-enterprises.png" alt=""></span><img src="${A}solution-enterprises.jpg" alt="Exploitation minière"></div><h3>Recherche exécutive</h3><p>Identification et sélection de dirigeants, cadres et experts stratégiques capables d’accompagner vos transformations et de créer une valeur durable.</p></article>
        <article><div class="enterprise-card-head"><span><img src="${A}icon-candidates.png" alt=""></span><img src="${A}solution-candidates.jpg" alt="Professionnelle en entreprise"></div><h3>Réseau d’excellence</h3><p>Mobilisation rapide de profils hautement qualifiés grâce à notre réseau international, afin de répondre efficacement à vos enjeux de recrutement et aux pénuries de compétences.</p></article>
        <article><div class="enterprise-card-head"><span><img src="${A}icon-advice.png" alt=""></span><img src="${A}solution-advice.jpg" alt="Échange avec un consultant"></div><h3>Performance et alignement</h3><p>Nous optimisons votre capital humain en alignant vos talents, votre organisation et vos objectifs stratégiques pour soutenir une croissance durable.</p></article>
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
      <h1>Votre expertise, de nouvelles<br>perspectives</h1>
      <p>ARI vous accompagne dans votre évolution professionnelle en vous connectant à des opportunités adaptées à vos compétences, votre expérience et vos ambitions.</p>
      <a class="button" href="#candidature">Déposer mon dossier</a>
    </section>
    <section class="candidate-collage" aria-label="Professionnels accompagnés par ARI">
      <img src="${A}candidate-work.jpg" alt="Professionnelle au travail">
      <img src="${A}candidate-success.jpg" alt="Professionnel célébrant une réussite">
      <img src="${A}candidate-mobile.jpg" alt="Professionnelle consultant une opportunité">
    </section>
    <section class="candidate-network">
      <div><h2>Un réseau au service de vos ambitions</h2><p>ARI met en relation des talents qualifiés avec des entreprises à la recherche d’expertises spécifiques. Nous prenons le temps de comprendre votre parcours, vos compétences et vos ambitions afin d’identifier les opportunités qui correspondent réellement à votre profil. De la sélection des opportunités à la mise en relation avec les recruteurs, jusqu’à votre prise de fonction, nous vous accompagnons pour vous permettre d’aborder chaque nouvelle étape de votre carrière avec confiance.</p><p>Notre rôle : révéler votre potentiel, créer les bonnes connexions et vous ouvrir les portes d’opportunités qui correspondent à vos ambitions.</p><a class="button" href="#candidature">Explorer les opportunités</a></div>
      <img src="${A}candidate-guidance.jpg" alt="Accompagnement professionnel personnalisé">
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
  return `<main><section class="contact-process"><div><h1>Identification à<br>l’échelle internationale</h1><span class="contact-globe">◎</span><p>Que vous soyez un directeur des ressources humaines confronté à des pénuries de compétences critiques, ou un cadre dirigeant en quête d’une nouvelle opportunité d’envergure, nous mobilisons notre réseau mondial pour vous apporter une réactivité opérationnelle inédite.</p></div><img src="${A}contact-guidance.jpg" alt="Consultante accompagnant un professionnel"></section><section class="process-line"><p class="eyebrow">Notre Processus</p><strong>Comprendre vos besoins → Identifier les talents → Évaluer les candidats → Présenter une sélection de profils</strong><span>↓</span><b>Placement réussi</b></section><section class="contact-launch"><div><h2>Lancer Vos<br>Recherches</h2><p>Notre équipe s’engage à analyser votre besoin de recrutement ou votre profil sous 24 heures ouvrées. Remplissez ce formulaire pour être mis en relation directe avec un consultant expert de votre secteur d’activité.</p></div><form action="/contact.php" method="post"><input class="hp" type="text" name="website" tabindex="-1" autocomplete="off"><input type="hidden" name="request_type" value="${type === "candidat" ? "candidat" : "entreprise"}"><label>Nom complet et entreprise*<input name="name" required autocomplete="name"></label><label>Adresse e-mail professionnelle*<input name="email" type="email" required autocomplete="email"></label><label>Numéro de téléphone direct<input name="phone" type="tel" autocomplete="tel"></label><label>Description de votre besoin en capital humain*<textarea name="message" rows="4" required></textarea></label><label class="consent"><input name="consent" type="checkbox" value="yes" required> J’accepte que mes informations soient utilisées afin de répondre à ma demande.</label><button class="button" type="submit">Envoyer Ma Demande</button></form></section></main>`;
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
