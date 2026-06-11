const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const faqItems = document.querySelectorAll(".faq-item");
const navLinks = document.querySelectorAll(".site-nav a[href^="#"]");
const ticketButtons = document.querySelectorAll(".ticket-open");
const ticketModal = document.querySelector("#ticket-modal");
const ticketForm = document.querySelector("#ticket-form");
const ticketTypeInput = document.querySelector("#ticket-type-input");
const selectedTicketName = document.querySelector("#selected-ticket-name");
const modalClose = document.querySelector(".modal-close");
const modalCancel = document.querySelector(".modal-cancel");
const venueMapElement = document.querySelector("#venue-map");
let targetTicketUrl = "https://imoup.pt/#bilhetes";

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

if (ticketButtons.length && ticketModal && ticketForm && ticketTypeInput && selectedTicketName) {
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
    if (!ticketForm.reportValidity()) return;

    const formData = new FormData(ticketForm);
    sessionStorage.setItem(
      "imoupTicketLead",
      JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        consent: formData.get("consent") === "on",
        ticketType: formData.get("ticketType"),
        submittedAt: new Date().toISOString(),
      })
    );

    window.open(targetTicketUrl, "_blank", "noopener,noreferrer");
    closeTicketModal();
    ticketForm.reset();
  });
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