/* ===================================================================
   Franco Martinez — CV Piloto | Main script (i18n, nav, reveal)
   =================================================================== */

(function () {
  const STORAGE_KEY = "fm_cv_lang";

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || "es";
  }

  function applyTranslations(lang) {
    const dict = translations[lang] || translations.es;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      // format: "attr:key" e.g. "placeholder:contacto.email.title"
      const parts = el.getAttribute("data-i18n-attr").split(":");
      const attr = parts[0];
      const key = parts[1];
      if (dict[key] !== undefined) el.setAttribute(attr, dict[key]);
    });

    document.querySelectorAll(".lang-toggle button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    document.querySelectorAll(".cv-download").forEach((el) => {
      const href = lang === "en" ? el.dataset.hrefEn : el.dataset.hrefEs;
      if (href) el.setAttribute("href", href);
    });
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations(lang);
  }

  function initLangToggle() {
    document.querySelectorAll(".lang-toggle button").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });
  }

  function markActiveNav() {
    const page = document.body.dataset.page;
    document.querySelectorAll("nav.nav-links a").forEach((a) => {
      if (a.dataset.page === page) a.classList.add("active");
    });
  }

  function initLogout() {
    document.querySelectorAll(".logout-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        try {
          localStorage.removeItem("fm_cv_unlocked_v1");
        } catch (e) {}
        window.location.href = "index.html";
      });
    });
  }

  function initMobileMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("nav.nav-links");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => nav.classList.remove("open"))
    );
  }

  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------------- PDF / CV preview modal ---------------- */
  function buildModal() {
    if (document.getElementById("pdfModalOverlay")) return;
    const dict = translations[getLang()] || translations.es;
    const overlay = document.createElement("div");
    overlay.id = "pdfModalOverlay";
    overlay.className = "pdf-modal-overlay";
    overlay.innerHTML =
      '<div class="pdf-modal">' +
        '<div class="pdf-modal-header">' +
          '<span class="pdf-modal-title"></span>' +
          '<button type="button" class="pdf-modal-close" aria-label="Close">&times;</button>' +
        "</div>" +
        '<div class="pdf-modal-body">' +
          '<iframe class="pdf-modal-frame" src="" title="preview"></iframe>' +
          '<img class="pdf-modal-image" src="" alt="">' +
        "</div>" +
        '<div class="pdf-modal-footer">' +
          '<a class="btn btn-outline pdf-modal-download" data-i18n="modal.download">' + (dict["modal.download"] || "Download") + "</a>" +
          '<button type="button" class="btn btn-primary pdf-modal-close-btn" data-i18n="modal.close">' + (dict["modal.close"] || "Close") + "</button>" +
        "</div>" +
      "</div>";
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    overlay.querySelector(".pdf-modal-close").addEventListener("click", closeModal);
    overlay.querySelector(".pdf-modal-close-btn").addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  function openModal(url, title, filename, type) {
    if (!url) return;
    buildModal();
    const overlay = document.getElementById("pdfModalOverlay");
    const isImage = type === "image";
    overlay.classList.toggle("mode-image", isImage);
    overlay.classList.toggle("mode-pdf", !isImage);
    overlay.querySelector(".pdf-modal-frame").setAttribute("src", isImage ? "" : url);
    overlay.querySelector(".pdf-modal-image").setAttribute("src", isImage ? url : "");
    overlay.querySelector(".pdf-modal-title").textContent = title || "";
    const dl = overlay.querySelector(".pdf-modal-download");
    dl.setAttribute("href", url);
    dl.setAttribute("download", filename || "");
    overlay.classList.add("open");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    const overlay = document.getElementById("pdfModalOverlay");
    if (!overlay) return;
    overlay.classList.remove("open");
    document.body.classList.remove("modal-open");
    overlay.querySelector(".pdf-modal-frame").setAttribute("src", "");
    overlay.querySelector(".pdf-modal-image").setAttribute("src", "");
  }

  function filenameFromUrl(url) {
    try {
      return decodeURIComponent(url.split("/").pop());
    } catch (e) {
      return url.split("/").pop();
    }
  }

  function initPdfPreviews() {
    document.querySelectorAll("a.license-view").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const href = el.getAttribute("href");
        const card = el.closest(".license-card");
        const titleEl = card ? card.querySelector("h3 span") : null;
        openModal(href, titleEl ? titleEl.textContent : "", filenameFromUrl(href));
      });
    });

    document.querySelectorAll("a.cv-download").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const lang = getLang();
        const dict = translations[lang] || translations.es;
        const href = lang === "en" ? el.dataset.hrefEn : el.dataset.hrefEs;
        openModal(href, dict["modal.cv.title"] || "CV", filenameFromUrl(href));
      });
    });

    document.querySelectorAll(".aircraft-preview").forEach((el) => {
      el.addEventListener("click", () => {
        const img = el.getAttribute("data-img");
        const titleEl = el.querySelector("h4");
        openModal(img, titleEl ? titleEl.textContent : "", filenameFromUrl(img), "image");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLangToggle();
    markActiveNav();
    initLogout();
    initMobileMenu();
    initReveal();
    initPdfPreviews();
    applyTranslations(getLang());
  });
})();
