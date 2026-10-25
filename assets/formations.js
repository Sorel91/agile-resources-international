/* Catalogue interactif : données partagées, filtres et sélection de programmes. */
(() => {
  const courses = window.ARI_TRAINING_COURSES || [];
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const themes = {
    career: ['Évolution & identité', 'Career & identity'],
    relations: ['Relations & coopération', 'Relationships & cooperation'],
    leadership: ['Leadership & transition', 'Leadership & transition'],
    teams: ['Performance collective', 'Team performance']
  };
  const audience = (key, en) => key === 'cadres' ? (en ? 'Professionals' : 'Cadres') : (en ? 'Managers & Leaders' : 'Managers & Leaders');
  const theme = (key, en) => themes[key][en ? 1 : 0];
  const normalise = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const pdf = en => `/assets/catalogue-formations-ari-${en ? 'en' : 'fr'}.pdf`;
  const artwork = {
    rise: '<path d="M35 138h40V105h40V72h40V40h40"/><path d="m171 40 24 0 0 24"/>',
    dialogue: '<path d="M40 50h110v65H95l-30 25v-25H40z"/><path d="M103 36h100v65h-32"/>',
    identity: '<circle cx="120" cy="87" r="57"/><circle cx="120" cy="87" r="30"/><path d="M120 18v20m0 99v20M51 87H31m178 0h-20"/>',
    choice: '<path d="M120 144V89M48 38v29h144V38M120 67V38"/><circle cx="120" cy="24" r="12"/><circle cx="48" cy="24" r="12"/><circle cx="192" cy="24" r="12"/><circle cx="120" cy="155" r="12"/>',
    connect: '<circle cx="120" cy="85" r="22"/><circle cx="47" cy="47" r="15"/><circle cx="193" cy="47" r="15"/><circle cx="47" cy="130" r="15"/><circle cx="193" cy="130" r="15"/><path d="m61 55 39 20m40 0 39-20m-118 67 39-25m40 0 39 25"/>',
    restore: '<path d="M66 44a65 65 0 1 1-9 77"/><path d="M37 41h34v34"/><path d="m88 91 22 22 42-48"/>',
    team: '<circle cx="120" cy="45" r="18"/><circle cx="62" cy="103" r="18"/><circle cx="178" cy="103" r="18"/><path d="m107 58-32 32m58-32 32 32M82 103h76M50 135h140"/>'
  };
  const motif = key => `<svg class="training-motif" viewBox="0 0 240 180" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${artwork[key] || artwork.rise}</svg>`;
  const card = (course, en, path) => {
    const t = course[en ? 'en' : 'fr'];
    return `<article class="training-card training-card--${course.audience}" data-course="${course.id}">
      <a class="training-card-art" href="${path('/catalogue/' + course.id)}" aria-label="${esc(t.title)}"><span>${course.ref}</span>${motif(course.motif)}<span class="training-card-arrow" aria-hidden="true">↗</span></a>
      <div class="training-card-body"><p class="training-card-category">${theme(course.theme, en)}</p><h3><a href="${path('/catalogue/' + course.id)}">${esc(t.title)}</a></h3><p class="training-card-benefit">${esc(t.benefit)}</p><span class="training-audience">${audience(course.audience, en)}</span>
      <div class="training-card-actions"><a href="${path('/catalogue/' + course.id)}">${en ? 'Explore programme' : 'Découvrir le programme'} <span aria-hidden="true">→</span></a><button type="button" data-select-training="${course.id}" aria-pressed="false" aria-label="${esc((en ? 'Select: ' : 'Sélectionner : ') + t.title)}">${en ? '+ Select' : '+ Sélectionner'}</button></div></div>
    </article>`;
  };
  const selection = en => `<aside class="training-selection" aria-label="${en ? 'Your training selection' : 'Votre sélection de formations'}"><div class="training-selection-head"><div><span class="training-kicker">${en ? 'YOUR PROJECT' : 'VOTRE PROJET'}</span><h2>${en ? 'Your training selection' : 'Votre sélection de formations'}</h2></div><span class="training-selection-count" data-selection-count>0</span></div><p>${en ? 'Select programmes, then tell us about your team. ARI will help you shape a tailored proposal.' : 'Retenez les programmes qui vous intéressent, puis décrivez votre équipe. ARI vous accompagne pour construire une proposition adaptée.'}</p><ul class="training-selected-list" data-selected-list></ul><p class="training-selection-empty" data-selection-empty>${en ? 'Your selection is empty. You can also contact us directly using the form below.' : 'Votre sélection est vide. Vous pouvez aussi nous décrire directement votre besoin ci-dessous.'}</p><button class="training-clear-selection" type="button" data-clear-selection hidden>${en ? 'Clear selection' : 'Vider ma sélection'}</button></aside>`;
  const request = en => `<section class="training-project" id="projet-formation">${selection(en)}<form class="training-request" action="/contact.php" method="post"><p class="training-kicker">${en ? 'LET’S TALK' : 'ÉCHANGEONS'}</p><h2>${en ? 'A programme for your organisation.' : 'Un programme pour votre entreprise.'}</h2><input type="hidden" name="request_type" value="catalogue"><input type="hidden" name="lang" value="${en ? 'en' : 'fr'}"><input type="hidden" name="message" value=""><input class="hp" name="website" type="text" tabindex="-1" autocomplete="off"><div class="training-form-row"><label>${en ? 'Full name' : 'Nom et prénom'} *<input name="name" required autocomplete="name" maxlength="200"></label><label>${en ? 'Company' : 'Entreprise'} *<input name="company" required autocomplete="organization" maxlength="200"></label></div><div class="training-form-row"><label>${en ? 'Work email' : 'E-mail professionnel'} *<input name="email" type="email" required autocomplete="email" maxlength="254"></label><label>${en ? 'Phone' : 'Téléphone'}<input name="phone" type="tel" autocomplete="tel" maxlength="60"></label></div><label>${en ? 'Tell us about your needs' : 'Décrivez votre besoin'} *<textarea name="training_notes" required rows="4" maxlength="5000" placeholder="${en ? 'Team size, challenges, preferred timing…' : 'Nombre de collaborateurs, enjeux, période souhaitée…'}"></textarea></label><p class="training-form-note">${en ? 'Your selected programmes will be included automatically.' : 'Les formations sélectionnées seront jointes automatiquement à votre demande.'}</p><label class="training-consent"><input type="checkbox" name="consent" value="yes" required><span>${en ? 'I agree that my information may be used to respond to this enquiry.' : 'J’accepte que mes informations soient utilisées afin de répondre à ma demande.'}</span></label><button class="training-primary" type="submit">${en ? 'Request a tailored proposal' : 'Demander une proposition'} <span aria-hidden="true">↗</span></button><p class="training-form-note">* ${en ? 'Required fields' : 'Champs obligatoires'}</p></form></section>`;
  const catalogue = (en, path) => `<main class="training-page">
    <section class="training-hero"><div class="training-hero-copy"><p class="training-kicker">ARI · ${en ? 'CORPORATE TRAINING' : 'FORMATION ENTREPRISES'}</p><h1>${en ? 'Grow your people.<br><em>Move your business forward.</em>' : 'Faire grandir les talents.<br><em>Faire avancer l’entreprise.</em>'}</h1><p>${en ? 'Seven programmes to develop professional potential, strengthen leadership and build effective teams. A catalogue designed around your business challenges.' : 'Sept programmes pour développer le potentiel des cadres, renforcer le leadership et construire des équipes performantes. Un catalogue pensé à partir de vos enjeux.'}</p><div class="training-hero-actions"><a class="training-primary" href="#formations">${en ? 'Explore the catalogue' : 'Explorer le catalogue'} <span aria-hidden="true">↓</span></a><a class="training-text-link" href="${pdf(en)}" download>${en ? 'Download the PDF' : 'Télécharger le PDF'} <span aria-hidden="true">↗</span></a></div><div class="training-hero-facts"><span><strong>07</strong>${en ? 'programmes' : 'formations'}</span><span><strong>02</strong>${en ? 'learning pathways' : 'univers de formation'}</span><span><strong>ARI</strong>${en ? 'your HR partner' : 'votre partenaire RH'}</span></div></div><div class="training-hero-visual"><img src="/assets/formation-leadership.webp" alt="${en ? 'Abstract sculpture of ascending steps and a gold ribbon symbolising growth and leadership' : 'Illustration de marches ascendantes et d’un ruban doré, symboles de progression et de leadership'}" width="1200" height="800" fetchpriority="high" decoding="async"><div class="training-visual-caption"><span>01 — 07</span><span>${en ? 'Individual potential. Collective strength.' : 'Potentiel individuel. Force collective.'}</span></div></div></section>
    <section class="training-discovery" aria-labelledby="training-needs-title"><div><p class="training-kicker">${en ? 'START WITH YOUR CHALLENGE' : 'PARTIR DE VOTRE ENJEU'}</p><h2 id="training-needs-title">${en ? 'What would you like to change?' : 'Quel cap souhaitez-vous franchir ?'}</h2></div><div class="training-needs"><button type="button" data-need="career">${en ? 'Develop our professionals' : 'Faire évoluer nos cadres'} <span aria-hidden="true">↗</span></button><button type="button" data-need="relations">${en ? 'Strengthen cooperation' : 'Apaiser les relations'} <span aria-hidden="true">↗</span></button><button type="button" data-need="leadership">${en ? 'Support a leadership transition' : 'Accompagner un leader'} <span aria-hidden="true">↗</span></button><button type="button" data-need="teams">${en ? 'Improve team performance' : 'Renforcer une équipe'} <span aria-hidden="true">↗</span></button></div></section>
    <section class="training-catalogue" id="formations" aria-labelledby="training-catalogue-title"><div class="training-section-heading"><div><p class="training-kicker">${en ? 'THE CATALOGUE' : 'LE CATALOGUE'}</p><h2 id="training-catalogue-title">${en ? 'Find your next step.' : 'À chaque enjeu, son prochain pas.'}</h2></div><a class="training-text-link" href="${pdf(en)}" download>${en ? 'Full catalogue · PDF' : 'Catalogue complet · PDF'} ↓</a></div>
      <div class="training-filters"><div class="training-audience-filters" role="group" aria-label="${en ? 'Filter by audience' : 'Filtrer par public'}"><button type="button" data-audience="all" aria-pressed="true">${en ? 'All programmes' : 'Toutes les formations'}</button><button type="button" data-audience="cadres" aria-pressed="false">${en ? 'Professionals' : 'Cadres'}</button><button type="button" data-audience="leaders" aria-pressed="false">Managers &amp; Leaders</button></div><div class="training-search-row"><label class="training-search"><span>${en ? 'Search' : 'Rechercher'}</span><input type="search" id="training-search" placeholder="${en ? 'A skill, a keyword…' : 'Une compétence, un mot-clé…'}" autocomplete="off"></label><label class="training-theme"><span>${en ? 'Topic' : 'Thématique'}</span><select id="training-theme"><option value="all">${en ? 'All topics' : 'Toutes les thématiques'}</option>${Object.keys(themes).map(key => `<option value="${key}">${theme(key, en)}</option>`).join('')}</select></label><button type="button" class="training-reset" data-reset-filters>${en ? 'Reset' : 'Réinitialiser'}</button></div></div>
      <p class="training-result-count" data-result-count role="status" aria-live="polite"></p><div class="training-grid" id="training-results">${courses.map(c => card(c, en, path)).join('')}</div><div class="training-no-results" data-no-results hidden><h3>${en ? 'Let’s broaden the search.' : 'Élargissons la recherche.'}</h3><p>${en ? 'No programme matches these filters. Reset them or tell ARI about your needs.' : 'Aucune formation ne correspond à ces critères. Réinitialisez les filtres ou décrivez votre besoin à ARI.'}</p><button type="button" data-reset-filters>${en ? 'Show all programmes' : 'Voir toutes les formations'}</button></div>
    </section>
    <section class="training-approach"><p class="training-kicker">${en ? 'FROM PROGRAMME TO ACTION' : 'DU PROGRAMME À L’ACTION'}</p><div><h2>${en ? 'A starting point.<br>A programme shaped with you.' : 'Une base solide.<br>Un parcours construit avec vous.'}</h2><p>${en ? 'Each programme starts a conversation about your goals. Content, duration, format and pricing are agreed with ARI according to the needs of your organisation.' : 'Chaque formation ouvre un échange autour de vos objectifs. Le contenu, la durée, les modalités et le tarif sont définis avec ARI selon les besoins de votre organisation.'}</p></div><ol><li><b>01</b><strong>${en ? 'Clarify' : 'Cadrer'}</strong><span>${en ? 'Your context and priorities' : 'Votre contexte et vos priorités'}</span></li><li><b>02</b><strong>${en ? 'Adapt' : 'Adapter'}</strong><span>${en ? 'The programme and practical cases' : 'Le programme et les cas pratiques'}</span></li><li><b>03</b><strong>${en ? 'Apply' : 'Mettre en pratique'}</strong><span>${en ? 'Tools relevant to your teams' : 'Des outils utiles à vos équipes'}</span></li></ol></section>
    ${request(en)}
    <a class="training-selection-float" href="#projet-formation" data-selection-float hidden>${en ? 'My selection' : 'Ma sélection'} <span data-selection-count>0</span><span aria-hidden="true">→</span></a>
  </main>`;
  const detail = (slug, en, path) => {
    const c = courses.find(c => c.id === slug);
    if (!c) return null;
    const t = c[en ? 'en' : 'fr'];
    return `<main class="training-page training-detail"><nav class="training-breadcrumb" aria-label="${en ? 'Breadcrumb' : 'Fil d’Ariane'}"><a href="${path('/catalogue')}">${en ? 'Training catalogue' : 'Catalogue de formations'}</a><span aria-hidden="true">/</span><span>${c.ref}</span></nav><section class="training-detail-hero"><div><p class="training-kicker">${c.ref} · ${audience(c.audience, en)} · ${theme(c.theme, en)}</p><h1>${esc(t.title)}</h1><p class="training-detail-benefit">${esc(t.benefit)}</p><p>${esc(t.description)}</p><div class="training-hero-actions"><button class="training-primary" type="button" data-select-training="${c.id}" aria-pressed="false">${en ? '+ Add to my selection' : '+ Ajouter à ma sélection'}</button><a class="training-text-link" href="#projet-formation">${en ? 'Discuss this programme' : 'Échanger sur cette formation'} ↗</a></div></div><div class="training-detail-art">${motif(c.motif)}<span>${c.ref} / ARI</span></div></section>
      <section class="training-detail-content"><aside class="training-facts"><p class="training-kicker">${en ? 'AT A GLANCE' : 'EN UN REGARD'}</p><dl><dt>${en ? 'Audience' : 'Public concerné'}</dt><dd>${esc(t.public)}</dd><dt>${en ? 'Duration & delivery' : 'Durée & modalités'}</dt><dd>${en ? 'Defined with ARI according to your needs.' : 'Définies avec ARI selon vos besoins.'}</dd><dt>${en ? 'Prerequisites' : 'Prérequis'}</dt><dd>${en ? 'Clarified during the initial discussion.' : 'Précisés lors du cadrage du groupe.'}</dd><dt>${en ? 'Pricing' : 'Tarif'}</dt><dd>${en ? 'Tailored quote.' : 'Sur devis.'}</dd></dl><a class="training-text-link" href="${pdf(en)}" download>${en ? 'Download the catalogue' : 'Télécharger le catalogue'} ↓</a></aside><div class="training-programme"><p class="training-kicker">${en ? 'LEARNING OBJECTIVE' : 'OBJECTIF PÉDAGOGIQUE'}</p><h2>${en ? 'What this programme develops.' : 'Ce que cette formation développe.'}</h2><p>${esc(t.objective)}</p><h2>${en ? 'Your learning journey.' : 'Le fil de votre formation.'}</h2><p class="training-programme-note">${en ? 'A proposed outline, adapted with ARI to your context.' : 'Une trame pédagogique proposée, à adapter avec ARI à votre contexte.'}</p><ol class="training-modules">${t.modules.map(([title, text], i) => `<li><span>${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(title)}</h3><p>${esc(text)}</p></div></li>`).join('')}</ol><div class="training-practice"><p class="training-kicker">${en ? 'PUT IT INTO PRACTICE' : 'MISE EN PRATIQUE'}</p><p>${esc(t.practice)}</p><h3>${en ? 'Proposed takeaway' : 'Livrable proposé'}</h3><p>${esc(t.takeaway)}</p></div><p class="training-programme-note">${en ? 'Teaching methods and assessment are agreed when the programme is scoped.' : 'Les méthodes pédagogiques et les modalités d’évaluation sont précisées lors du cadrage.'}</p></div></section>${request(en)}<section class="training-related"><p class="training-kicker">${en ? 'CONTINUE EXPLORING' : 'POUR ALLER PLUS LOIN'}</p><h2>${en ? 'Explore another perspective.' : 'Explorer d’autres perspectives.'}</h2><div class="training-grid">${courses.filter(other => other.id !== c.id && other.audience === c.audience).slice(0, 2).map(other => card(other, en, path)).join('')}</div></section><a class="training-selection-float" href="#projet-formation" data-selection-float hidden>${en ? 'My selection' : 'Ma sélection'} <span data-selection-count>0</span><span aria-hidden="true">→</span></a></main>`;
  };
  const init = en => {
    if (!document.querySelector('.training-page')) return;
    const lang = en ? 'en' : 'fr';
    const key = 'ari-training-selection-v1';
    let selected = new Set();
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      if (Array.isArray(saved)) selected = new Set(saved.filter(id => courses.some(c => c.id === id)));
    } catch (_) { /* Le catalogue fonctionne aussi sans stockage navigateur. */ }
    const sync = () => {
      try { localStorage.setItem(key, JSON.stringify([...selected])); } catch (_) {}
      document.querySelectorAll('[data-select-training]').forEach(button => {
        const active = selected.has(button.dataset.selectTraining);
        const c = courses.find(c => c.id === button.dataset.selectTraining);
        button.setAttribute('aria-pressed', String(active));
        button.setAttribute('aria-label', (active ? (en ? 'Remove: ' : 'Retirer : ') : (en ? 'Select: ' : 'Sélectionner : ')) + c[lang].title);
        button.textContent = active ? (en ? '✓ Selected' : '✓ Sélectionnée') : (en ? '+ Select' : '+ Sélectionner');
      });
      document.querySelectorAll('[data-selection-count]').forEach(el => { el.textContent = String(selected.size); });
      const list = document.querySelector('[data-selected-list]');
      list.innerHTML = [...selected].map(id => { const c = courses.find(c => c.id === id); return `<li><span>${esc(c[lang].title)}</span><button type="button" data-remove-training="${id}" aria-label="${esc((en ? 'Remove: ' : 'Retirer : ') + c[lang].title)}">×</button></li>`; }).join('');
      document.querySelector('[data-selection-empty]').hidden = selected.size > 0;
      document.querySelector('[data-clear-selection]').hidden = !selected.size;
      document.querySelector('[data-selection-float]').hidden = !selected.size;
    };
    document.querySelector('.training-page').addEventListener('click', event => {
      const add = event.target.closest('[data-select-training]');
      const remove = event.target.closest('[data-remove-training]');
      if (add) { const id = add.dataset.selectTraining; selected.has(id) ? selected.delete(id) : selected.add(id); sync(); }
      if (remove) { selected.delete(remove.dataset.removeTraining); sync(); }
      if (event.target.closest('[data-clear-selection]')) { selected.clear(); sync(); }
    });
    document.querySelector('.training-request').addEventListener('submit', event => {
      const form = event.currentTarget;
      const names = [...selected].map(id => { const c = courses.find(c => c.id === id); return `${c.ref} — ${c[lang].title}`; });
      form.elements.message.value = `${en ? 'TRAINING ENQUIRY' : 'DEMANDE DE FORMATION'}\n\n${en ? 'Selected programmes' : 'Formations sélectionnées'} :\n${names.length ? names.join('\n') : (en ? 'To be defined with ARI' : 'À définir avec ARI')}\n\n${form.elements.training_notes.value}`;
    });
    sync();
    const search = document.querySelector('#training-search');
    if (!search) return;
    const topic = document.querySelector('#training-theme');
    let group = 'all';
    const apply = () => {
      const terms = normalise(search.value.trim()).split(/\s+/).filter(Boolean);
      let count = 0;
      document.querySelectorAll('#training-results [data-course]').forEach(el => {
        const c = courses.find(c => c.id === el.dataset.course);
        const haystack = normalise([c[lang].title, c[lang].description, c[lang].objective, theme(c.theme, en), c[lang].public].join(' '));
        const visible = (group === 'all' || c.audience === group) && (topic.value === 'all' || topic.value === c.theme) && terms.every(term => haystack.includes(term));
        el.hidden = !visible;
        if (visible) count++;
      });
      document.querySelector('[data-result-count]').textContent = en ? `${count} programme${count === 1 ? '' : 's'} to explore` : `${count} formation${count === 1 ? '' : 's'} à découvrir`;
      document.querySelector('[data-no-results]').hidden = count > 0;
      document.querySelectorAll('[data-audience]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.audience === group)));
    };
    search.addEventListener('input', apply);
    topic.addEventListener('change', apply);
    document.querySelectorAll('[data-audience]').forEach(button => button.addEventListener('click', () => { group = button.dataset.audience; apply(); }));
    document.querySelectorAll('[data-reset-filters]').forEach(button => button.addEventListener('click', () => { search.value = ''; topic.value = 'all'; group = 'all'; apply(); }));
    document.querySelectorAll('[data-need]').forEach(button => button.addEventListener('click', () => {
      group = 'all'; search.value = ''; topic.value = button.dataset.need; apply();
      document.querySelector('#formations').scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
      search.focus({preventScroll:true});
    }));
    apply();
  };
  window.ARITraining = {catalogue, detail, init};
})();
