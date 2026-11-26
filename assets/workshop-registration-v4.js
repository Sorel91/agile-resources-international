(() => {
  const triggers = document.querySelectorAll("[data-registration-open]");
  if (!triggers.length) return;
  const en = document.documentElement.lang === "en";
  const t = (fr, english) => en ? english : fr;
  const dialog = document.createElement("dialog");
  dialog.className = "registration-dialog";
  dialog.setAttribute("aria-labelledby", "registration-title");
  dialog.innerHTML = `
    <div class="registration-heading">
      <div><p class="registration-eyebrow">Agile Resources International</p>
      <h2 id="registration-title">${t("Inscription à la formation gratuite", "Register for the free workshop")}</h2></div>
      <button type="button" class="registration-close" aria-label="${t("Fermer le formulaire", "Close registration")}">×</button>
    </div>
    <p class="registration-date">${t("Samedi 28 novembre 2026", "Saturday 28 November 2026")}</p>
    <div class="registration-programme"><strong>${t("Au programme", "Programme")}</strong>
      <ul>
        <li>${t("Développer son réseau professionnel.", "Build your professional network.")}</li>
        <li>${t("Valoriser son CV, son profil LinkedIn et son pitch.", "Strengthen your CV, LinkedIn profile and pitch.")}</li>
        <li>${t("Préparer et réussir son entretien d’embauche.", "Prepare for and succeed in job interviews.")}</li>
      </ul>
    </div>
    <p class="registration-practical">${t("De 10 h à 14 h (heure d’Abidjan).", "10:00 a.m. to 2:00 p.m. (Abidjan time).")}<br>
      ${t("Lieu : ", "Venue: ")}IPCE — ${t("Cocody Cité des Arts, Lot 10A – Villa 174 – Rue C30, Impasse des Tapissiers, Abidjan, 01 BP 1203, Abidjan, CI.", "Cocody Cité des Arts, Lot 10A – Villa 174 – Rue C30, Impasse des Tapissiers, Abidjan, 01 BP 1203, Abidjan, Côte d’Ivoire.")}<br><a class="workshop-map-link" href="https://www.google.com/maps/search/?api=1&amp;query=IPCE%2C%20Cocody%20Cit%C3%A9%20des%20Arts%2C%20Lot%2010A%2C%20Villa%20174%2C%20Rue%20C30%2C%20Impasse%20des%20Tapissiers%2C%20Abidjan%2C%20C%C3%B4te%20d%E2%80%99Ivoire" target="_blank" rel="noopener noreferrer"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg><span>${t("Voir le lieu sur Google Maps", "View location on Google Maps")}</span><span aria-hidden="true">↗</span></a></p>
    <p class="registration-loading" role="status">${t("Préparation du formulaire…", "Preparing the form…")}</p>
    <div class="registration-feedback" role="alert" hidden></div>
    <button class="registration-retry" type="button" hidden>${t("Réessayer", "Try again")}</button>
    <form method="post" action="/training-registration.php" enctype="multipart/form-data">
      <input type="hidden" name="csrf"><input type="hidden" name="lang">
      <div class="registration-trap" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
      <p class="registration-required">${t("Les champs marqués * sont obligatoires.", "Fields marked * are required.")}</p>
      <div class="registration-grid">
        <label>${t("Nom *", "Last name *")}<input name="last_name" autocomplete="family-name" maxlength="80" required></label>
        <label>${t("Prénom *", "First name *")}<input name="first_name" autocomplete="given-name" maxlength="80" required></label>
        <label class="registration-wide">${t("E-mail *", "Email *")}<input type="email" name="email" autocomplete="email" maxlength="254" required></label>
        <label>${t("Ville *", "City *")}<input name="city" autocomplete="address-level2" maxlength="120" required></label>
        <label>${t("Pays de résidence *", "Country of residence *")}<input name="residence_country" autocomplete="country-name" maxlength="100" required></label>
        <label class="registration-wide">${t("Domaine d’éducation / de formation *", "Field of education / study *")}
          <input name="education_domain" maxlength="180" placeholder="${t("Ex. : finance, ingénierie, ressources humaines…", "E.g. finance, engineering, human resources…")}" required></label>
        <label class="registration-wide">${t("Déposer mon CV *", "Upload my CV *")}
          <input type="file" name="cv" accept=".pdf,application/pdf" aria-describedby="registration-cv-help" required>
          <small id="registration-cv-help">${t("PDF uniquement · 5 Mo maximum.", "PDF only · maximum 5 MB.")}</small></label>
      </div>
      <label class="registration-consent"><input type="checkbox" name="consent" value="1" required>
        <span>${t("J’accepte que mes informations et mon CV soient utilisés par Agile Resources pour gérer mon inscription et l’organisation de cette formation.", "I agree that Agile Resources may use my details and CV to manage my registration and organise this workshop.")}</span></label>
      <p class="registration-privacy">${t("Vos informations ne sont pas publiées sur le site. Pour toute question : ", "Your details are not published on the website. Questions: ")}<a href="mailto:contact@agileresources-intl.com">contact@agileresources-intl.com</a>.</p>
      <button class="button registration-submit" type="submit" disabled>${t("Valider mon inscription gratuite", "Submit my free registration")}</button>
    </form>
    <section class="registration-success" role="status" hidden><h3>${t("Votre inscription a bien été reçue.", "Your registration has been received.")}</h3>
      <p>${t("Merci ! L’équipe vous communiquera les informations pratiques par e-mail.", "Thank you! The team will share practical details with you by email.")}</p>
      <button class="button" type="button" data-registration-done>${t("Continuer à découvrir ARI", "Continue exploring ARI")}</button></section>`;
  document.body.append(dialog);
  const form = dialog.querySelector("form");
  form.elements.lang.value = en ? "en" : "fr";
  const submit = dialog.querySelector(".registration-submit");
  const loading = dialog.querySelector(".registration-loading");
  const feedback = dialog.querySelector(".registration-feedback");
  const retry = dialog.querySelector(".registration-retry");
  let opener = null;
  let submitted = false;
  let busy = false;
  let loaded = false;
  const showError = message => { feedback.textContent = message; feedback.hidden = false; };
  const close = () => { if (!busy) dialog.close(); };
  async function prepare() {
    submit.disabled = true; feedback.hidden = true; retry.hidden = true; loading.hidden = false;
    try {
      const response = await fetch("/training-registration.php?lang=" + (en ? "en" : "fr"), {
        credentials: "same-origin", headers: { Accept: "application/json" }, cache: "no-store"
      });
      const data = await response.json();
      if (!response.ok || !data.csrf) throw new Error(data.message || t("Le formulaire est temporairement indisponible.", "Registration is temporarily unavailable."));
      form.elements.csrf.value = data.csrf;
      const event = data.event || {};
      if (/^\d{4}-\d{2}-\d{2}$/.test(event.event_date || "")) {
        const date = new Date(event.event_date + "T12:00:00Z");
        dialog.querySelector(".registration-date").textContent = new Intl.DateTimeFormat(en ? "en-GB" : "fr-FR", { dateStyle: "full", timeZone: "Africa/Abidjan" }).format(date);
      }
      loaded = true; submit.disabled = false;
    } catch (error) {
      showError(error.message || t("Impossible de charger le formulaire. Réessayez.", "Unable to load registration. Please try again."));
      retry.hidden = false;
    } finally { loading.hidden = true; }
  }
  triggers.forEach(button => button.addEventListener("click", () => {
    opener = button;
    dialog.showModal(); document.body.classList.add("registration-open");
    if (!submitted) prepare();
  }));
  dialog.querySelector(".registration-close").addEventListener("click", close);
  dialog.querySelector("[data-registration-done]").addEventListener("click", close);
  dialog.addEventListener("cancel", event => { if (busy) event.preventDefault(); });
  dialog.addEventListener("close", () => { document.body.classList.remove("registration-open"); opener?.focus(); });
  dialog.addEventListener("click", event => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
    }
  });
  retry.addEventListener("click", prepare);
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy || submitted || !loaded || !form.reportValidity()) return;
    const file = form.elements.cv.files?.[0];
    if (!file) {
      showError(t("Veuillez joindre votre CV au format PDF.", "Please attach your CV as a PDF.")); return;
    }
    if (file && (file.size > 5 * 1024 * 1024 || !/\.pdf$/i.test(file.name))) {
      showError(t("Le CV doit être un PDF de 5 Mo maximum.", "Your CV must be a PDF no larger than 5 MB.")); return;
    }
    busy = true; submit.disabled = true; feedback.hidden = true;
    submit.textContent = t("Envoi en cours…", "Submitting…");
    dialog.setAttribute("aria-busy", "true");
    try {
      const response = await fetch(form.action, { method: "POST", body: new FormData(form), credentials: "same-origin", headers: { Accept: "application/json" } });
      const data = await response.json();
      if (!response.ok || data.ok !== true) throw new Error(data.message || t("L’inscription n’a pas pu être enregistrée.", "Your registration could not be saved."));
      if (data.status === "waitlist") {
        dialog.querySelector(".registration-success h3").textContent = t("Vous êtes sur liste d’attente.", "You are on the waiting list.");
        dialog.querySelector(".registration-success p").textContent = data.message;
      }
      submitted = true; form.hidden = true;
      dialog.querySelector(".registration-success").hidden = false;
      dialog.querySelector(".registration-success h3").setAttribute("tabindex", "-1");
      dialog.querySelector(".registration-success h3").focus();
    } catch (error) {
      showError(error.message || t("Une erreur est survenue. Vos champs sont conservés : réessayez.", "An error occurred. Your details have been kept; please try again."));
    } finally {
      busy = false; dialog.removeAttribute("aria-busy");
      if (!submitted) { submit.disabled = false; submit.textContent = t("Valider mon inscription gratuite", "Submit my free registration"); }
    }
  });
})();
