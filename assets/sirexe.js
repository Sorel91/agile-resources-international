/* Event media: no video or external player is fetched before a visitor clicks. */
window.ARISirexe = (() => {
  const longId = '1QlztQr9mm0UcRZqn08QPdISq9gSlE5Ho';
  const label = (en, fr, english) => english ? en : fr;
  const player = (english, full = false) => `<div class="sirexe-player ${full ? 'sirexe-player-wide' : 'sirexe-player-portrait'}" data-sirexe-player="${full ? 'reportage' : 'short'}">
    <button class="sirexe-play" type="button" aria-label="${label('Play the SIREXE report', 'Lire la vidéo du SIREXE', english)}">
      <img src="/assets/${full ? 'sirexe-reportage-affiche.webp' : 'sirexe-2026-affiche.webp'}" alt="${label('Entrance to SIREXE 2026', 'Entrée du SIREXE 2026', english)}" width="${full ? 960 : 540}" height="${full ? 540 : 960}" loading="lazy" decoding="async">
      <span class="sirexe-play-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M7 4v16l14-8z"></path></svg></span>
      <span class="sirexe-play-label">${full ? label('Watch the full report · 9 min', 'Voir le reportage complet · 9 min', english) : label('Watch the highlights · 23 sec', 'Voir les temps forts · 23 s', english)}</span>
    </button>
  </div>`;
  const home = (english, localPath) => `<section class="section sirexe-home" aria-labelledby="sirexe-home-title">
    <div class="sirexe-home-copy"><p class="eyebrow">${label('In the field', 'Sur le terrain', english)}</p>
      <h2 id="sirexe-home-title">${label('ARI at SIREXE 2026', 'ARI au SIREXE 2026', english)}</h2>
      <span class="title-rule"></span>
      <p>${label('Meetings, conversations and insights from the mining, oil and energy exhibition. Discover ARI’s participation in pictures.', 'Rencontres, échanges et immersion au salon des mines, du pétrole et de l’énergie. Découvrez la participation d’ARI en images.', english)}</p>
      <a class="button" href="${localPath('/sirexe-2026')}">${label('Discover our participation', 'Découvrir notre participation', english)}</a>
    </div>${player(english)}
  </section>`;
  const page = (english, localPath) => `<main class="sirexe-page">
    <header class="sirexe-heading"><a class="sirexe-back" href="${localPath('/')}">${label('Home', 'Accueil', english)}</a><p class="eyebrow">${label('Meetings & events', 'Rencontres & événements', english)}</p><h1>${label('ARI at SIREXE 2026', 'ARI au SIREXE 2026', english)}</h1><span class="title-rule"></span><p>${label('A look back at our presence at the mining, oil and energy exhibition, through conversations and scenes from the event.', 'Retour sur notre présence au salon des mines, du pétrole et de l’énergie, à travers des échanges et des moments de vie du salon.', english)}</p></header>
    <section class="sirexe-feature" aria-labelledby="sirexe-report-title"><div class="sirexe-feature-copy"><p class="eyebrow">${label('The full report', 'Le reportage', english)}</p><h2 id="sirexe-report-title">${label('At the heart of the conversations', 'Au cœur des échanges', english)}</h2><p>${label('Explore the exhibition and a filmed interview in this report of approximately nine minutes.', 'Découvrez le salon et un entretien filmé dans ce reportage d’environ neuf minutes.', english)}</p><p class="sirexe-note">${label('The Google Drive player loads only when you click. The video is in its original language.', 'Le lecteur Google Drive se charge uniquement au clic. Vidéo en langue originale.', english)}</p><a class="sirexe-text-link" href="https://drive.google.com/file/d/${longId}/view" target="_blank" rel="noopener">${label('Watch on Google Drive', 'Ouvrir dans Google Drive', english)}</a></div>${player(english, true)}</section>
    <section class="sirexe-highlights" aria-labelledby="sirexe-highlights-title"><div><p class="eyebrow">${label('In 23 seconds', 'En 23 secondes', english)}</p><h2 id="sirexe-highlights-title">${label('Highlights of the event', 'Les temps forts du salon', english)}</h2><p>${label('A short vertical montage of the atmosphere, meetings and scenes from SIREXE.', 'Un montage vertical pour retrouver l’ambiance, les rencontres et quelques moments du SIREXE.', english)}</p></div>${player(english)}</section>
    <section class="sirexe-gallery" aria-labelledby="sirexe-gallery-title"><h2 id="sirexe-gallery-title">${label('Scenes from the exhibition', 'Quelques images du salon', english)}</h2><div class="sirexe-gallery-grid">${[
      ['entree', label('Arriving at SIREXE', 'L’arrivée au SIREXE', english)],
      ['rencontres', label('Conversations at the exhibition', 'Les échanges au salon', english)],
      ['conference', label('The exhibition’s conference spaces', 'Les espaces de conférence du salon', english)]
    ].map(([id, caption]) => `<figure><img src="/assets/sirexe-${id}.webp" alt="${caption}" width="540" height="960" loading="lazy" decoding="async"><figcaption>${caption}</figcaption></figure>`).join('')}</div></section>
    <section class="sirexe-contact"><h2>${label('Let’s continue the conversation', 'Poursuivons les échanges', english)}</h2><p>${label('Discuss your recruitment, training and HR support needs with our team.', 'Échangez avec notre équipe sur vos besoins en recrutement, en formation et en accompagnement RH.', english)}</p><a class="button" href="${localPath('/contact')}">${label('Contact ARI', 'Contacter ARI', english)}</a></section>
  </main>`;
  const init = (english, path) => {
    if (path === '/sirexe-2026') {
      const title = label('ARI at SIREXE 2026', 'ARI au SIREXE 2026', english);
      const description = label('Discover ARI’s participation at SIREXE 2026: highlights, a full report and pictures from the mining, oil and energy exhibition.', 'Découvrez la participation d’ARI au SIREXE 2026 : temps forts, reportage et images du salon des mines, du pétrole et de l’énergie.', english);
      document.title = `${title} — Agile Resources International`;
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
      for (const [property, content] of [['og:title', title], ['og:description', description], ['og:image', 'https://agileresources-intl.com/assets/sirexe-entree.webp'], ['og:image:alt', label('Entrance to SIREXE 2026', 'Entrée du SIREXE 2026', english)]]) document.querySelector(`meta[property="${property}"]`)?.setAttribute('content', content);
    }
    document.querySelectorAll('[data-sirexe-player]').forEach(container => {
      container.querySelector('button').addEventListener('click', () => {
        const full = container.dataset.sirexePlayer === 'reportage';
        if (full) {
          const frame = document.createElement('iframe');
          frame.src = `https://drive.google.com/file/d/${longId}/preview`;
          frame.title = label('ARI at SIREXE 2026 — full report', 'ARI au SIREXE 2026 — reportage complet', english);
          frame.allow = 'autoplay; fullscreen';
          frame.allowFullscreen = true;
          container.replaceChildren(frame);
          frame.focus();
        } else {
          const video = document.createElement('video');
          video.src = '/assets/sirexe-2026-apercu.mp4';
          video.controls = true;
          video.playsInline = true;
          video.preload = 'none';
          video.setAttribute('aria-label', label('ARI at SIREXE 2026 — highlights', 'ARI au SIREXE 2026 — temps forts', english));
          container.replaceChildren(video);
          video.focus();
          video.play().catch(() => { /* Native controls remain available. */ });
        }
      }, {once: true});
    });
  };
  return {home, page, init};
})();
