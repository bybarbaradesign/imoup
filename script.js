const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const faqItems = document.querySelectorAll(".faq-item");
const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
const ticketButtons = document.querySelectorAll(".ticket-open");
const ticketModal = document.querySelector("#ticket-modal");
const ticketForm = document.querySelector("#ticket-form");
const ticketTypeInput = document.querySelector("#ticket-type-input");
const selectedTicketName = document.querySelector("#selected-ticket-name");
const modalClose = document.querySelector(".modal-close");
const modalCancel = document.querySelector(".modal-cancel");
const venueMapElement = document.querySelector("#venue-map");
const phoneInput = document.querySelector("#phone-input");
const phoneStatus = document.querySelector("#phone-status");
const phoneError = document.querySelector("#phone-error");
const emailInput = ticketForm?.querySelector('input[name="email"]');
const emailStatus = document.querySelector("#email-status");
const emailError = document.querySelector("#email-error");
let targetTicketUrl = "https://imoup.pt/#bilhetes";
let phoneIntlInstance;

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

faqItems.forEach((item) => {
  const button = item.querySelector(".faq-question");
  if (!button) return;

  button.addEventListener("click", () => {
    const isActive = item.classList.contains("active");

    faqItems.forEach((currentItem) => {
      currentItem.classList.remove("active");
      const currentButton = currentItem.querySelector(".faq-question");
      if (currentButton) currentButton.setAttribute("aria-expanded", "false");
    });

    if (!isActive) {
      item.classList.add("active");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

const updateActiveSection = () => {
  if (!navLinks.length) return;

  const scrollPosition = window.scrollY + 160;
  let currentSectionId = "";

  navLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (!section) return;

    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      currentSectionId = link.getAttribute("href");
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === currentSectionId);
  });
};

updateActiveSection();
window.addEventListener("scroll", updateActiveSection, { passive: true });

const closeTicketModal = () => {
  if (!ticketModal) return;
  ticketModal.classList.remove("open");
  ticketModal.setAttribute("aria-hidden", "true");
};

const setStatusState = (element, state) => {
  if (!element) return;
  element.classList.remove("is-valid", "is-invalid");
  if (state) element.classList.add(state);
};

const validatePhone = () => {
  if (!phoneInput) return true;

  const rawValue = phoneInput.value.trim();
  const digitsOnly = rawValue.replace(/\D/g, "");
  const hasValue = rawValue.length > 0;

  let isValid = false;

  if (phoneIntlInstance) {
    if (rawValue.startsWith("+")) {
      isValid = phoneIntlInstance.isValidNumber();
    } else {
      const selectedData = phoneIntlInstance.getSelectedCountryData();
      const dialCode = selectedData?.dialCode ? `+${selectedData.dialCode}` : "";
      const fullNumber = `${dialCode}${digitsOnly}`;
      isValid =
        digitsOnly.length >= 9 &&
        digitsOnly.length <= 12 &&
        typeof window.intlTelInputUtils !== "undefined" &&
        window.intlTelInputUtils.isValidNumber(fullNumber, selectedData.iso2);
    }
  } else {
    isValid = digitsOnly.length >= 9 && digitsOnly.length <= 12;
  }

  const message = !hasValue || !isValid ? "Erro: introduz um número de contacto válido." : "";

  phoneInput.setCustomValidity(message);
  if (phoneError) phoneError.textContent = message;
  setStatusState(phoneStatus, !hasValue ? "" : isValid ? "is-valid" : "is-invalid");

  return isValid;
};

const validateEmailField = () => {
  if (!emailInput) return true;

  const value = emailInput.value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  const message = value.length === 0 || !isValid ? "Erro: introduz um endereço de email válido." : "";

  emailInput.setCustomValidity(message);
  if (emailError) emailError.textContent = message;
  setStatusState(emailStatus, value.length === 0 ? "" : isValid ? "is-valid" : "is-invalid");

  return isValid;
};

if (ticketButtons.length && ticketModal && ticketForm && ticketTypeInput && selectedTicketName) {
  if (phoneInput && typeof window.intlTelInput === "function") {
    const browserLocale = navigator.language?.toLowerCase() || "pt-pt";
    const localeCountry = browserLocale.split("-")[1] || "pt";

    phoneIntlInstance = window.intlTelInput(phoneInput, {
      initialCountry: localeCountry,
      preferredCountries: ["pt", "es", "fr", "gb", "br", "us"],
      i18n: {
        searchPlaceholder: "Pesquisar país",
        noCountrySelected: "Nenhum país selecionado",
        zeroSearchResults: "Sem resultados",
        oneSearchResult: "1 resultado",
        multipleSearchResults: "Vários resultados",
      },
      countrySearch: false,
      separateDialCode: true,
      strictMode: true,
      formatOnDisplay: true,
      nationalMode: false,
      loadUtils: () => import("https://cdn.jsdelivr.net/npm/intl-tel-input@24.6.1/build/js/utils.js"),
    });
  }

  ticketButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const ticketType = button.dataset.ticket || "Bilhete";
      targetTicketUrl = button.dataset.targetUrl || "https://imoup.pt/#bilhetes";
      ticketTypeInput.value = ticketType;
      selectedTicketName.textContent = ticketType;
      ticketModal.classList.add("open");
      ticketModal.setAttribute("aria-hidden", "false");
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeTicketModal);
  if (modalCancel) modalCancel.addEventListener("click", closeTicketModal);

  ticketModal.addEventListener("click", (event) => {
    if (event.target === ticketModal) closeTicketModal();
  });

  ticketForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const isPhoneValid = validatePhone();
    const isEmailValid = validateEmailField();

    if (!ticketForm.reportValidity() || !isPhoneValid || !isEmailValid) return;

    const formData = new FormData(ticketForm);
    sessionStorage.setItem(
      "imoupTicketLead",
      JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        phoneCountry: phoneIntlInstance ? `+${phoneIntlInstance.getSelectedCountryData().dialCode}` : "",
        phone: phoneInput?.value || "",
        consent: formData.get("consent") === "on",
        ticketType: formData.get("ticketType"),
        submittedAt: new Date().toISOString(),
      })
    );

    window.open(targetTicketUrl, "_blank", "noopener,noreferrer");
    closeTicketModal();
    ticketForm.reset();
    setStatusState(phoneStatus, "");
    setStatusState(emailStatus, "");
    if (phoneError) phoneError.textContent = "";
    if (emailError) emailError.textContent = "";
    if (phoneIntlInstance) phoneIntlInstance.setCountry("pt");
  });

  if (phoneInput) {
    phoneInput.addEventListener("input", validatePhone);
    phoneInput.addEventListener("blur", validatePhone);
    phoneInput.addEventListener("countrychange", validatePhone);
  }

  if (emailInput) {
    emailInput.addEventListener("input", validateEmailField);
    emailInput.addEventListener("blur", validateEmailField);
  }
}

if (venueMapElement && typeof L !== "undefined") {
  const venueMap = L.map(venueMapElement, {
    scrollWheelZoom: true,
  });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(venueMap);

  const locations = [
    {
      name: "Centro de Congressos de Aveiro",
      coordinates: [40.638056, -8.643611],
      url: "https://www.google.com/maps/search/?api=1&query=40.638056,-8.643611",
      markerClass: "map-marker map-marker--event",
    },
    {
      name: "Meliá Ria",
      coordinates: [40.6386, -8.6452],
      url: "https://www.google.com/maps/search/?api=1&query=40.6386,-8.6452",
      markerClass: "map-marker map-marker--melia",
    },
    {
      name: "Hotel Afonso V",
      coordinates: [40.6371592, -8.6470497],
      url: "https://www.google.com/maps/search/?api=1&query=40.6371592,-8.6470497",
      markerClass: "map-marker map-marker--afonso",
    },
  ];

  const bounds = [];

  locations.forEach((location) => {
    const isEventMarker = location.markerClass.includes("map-marker--event");
    const marker = L.marker(location.coordinates, {
      icon: L.divIcon({
        className: "",
        html: `<div class="${location.markerClass}"></div>`,
        iconSize: isEventMarker ? [34, 34] : [26, 26],
        iconAnchor: isEventMarker ? [17, 34] : [13, 26],
        popupAnchor: [0, -24],
      }),
    }).addTo(venueMap);

    marker.bindPopup(
      `<strong>${location.name}</strong><a href="${location.url}" target="_blank" rel="noreferrer">Abrir no Google Maps</a>`
    );

    marker.on("click", () => {
      window.open(location.url, "_blank", "noopener,noreferrer");
    });

    bounds.push(location.coordinates);
  });

  venueMap.fitBounds(bounds, {
    padding: [40, 40],
  });
}