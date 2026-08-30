/* ============================================================================
   OmniNeuro — main.js
   ----------------------------------------------------------------------------
   Vanilla JS only. Handles:
     1. Mobile navigation (hamburger) toggle
     2. Sticky-header shadow on scroll
     3. Scroll-reveal animations (IntersectionObserver)
     4. Animated stat counters
     5. Contact form validation + fake submit confirmation
     6. Footer year
     7. Hero background video (sound toggle + reduced-motion pause)
   Everything degrades gracefully if JS is disabled.
   ========================================================================== */

(function () {
  "use strict";

  /* Respect users who prefer reduced motion */
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  /* ==========================================================================
     1. MOBILE NAVIGATION TOGGLE
     ========================================================================== */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");

  function closeNav() {
    if (!navToggle || !primaryNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
    primaryNav.classList.remove("is-open");
  }

  function openNav() {
    if (!navToggle || !primaryNav) return;
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close navigation menu");
    primaryNav.classList.add("is-open");
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeNav() : openNav();
    });

    /* Close the menu after tapping a link (mobile) */
    primaryNav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") closeNav();
    });

    /* Close on Escape for keyboard users */
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    /* Reset nav state when resizing up to desktop */
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) closeNav();
    });
  }


  /* ==========================================================================
     2. STICKY-HEADER SHADOW ON SCROLL
     ========================================================================== */
  var header = document.querySelector(".site-header");

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });


  /* ==========================================================================
     3. SCROLL-REVEAL ANIMATIONS
     Adds .is-visible to .reveal elements as they enter the viewport.
     ========================================================================== */
  var revealEls = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    /* No animation: just show everything */
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); /* animate once */
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }


  /* ==========================================================================
     4. ANIMATED STAT COUNTERS
     Any .stat-number with data-count-to counts up when scrolled into view.
     Optional data-prefix / data-suffix wrap the value (e.g. "%", "x", "k+").
     ========================================================================== */
  var counters = document.querySelectorAll(".stat-number[data-count-to]");

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count-to")) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400; /* ms */
    var startTime = null;

    function tick(now) {
      if (startTime === null) startTime = now;
      var progress = Math.min((now - startTime) / duration, 1);
      /* easeOutCubic for a natural slow-down */
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  if (counters.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      counters.forEach(function (el) {
        var prefix = el.getAttribute("data-prefix") || "";
        var suffix = el.getAttribute("data-suffix") || "";
        el.textContent = prefix + el.getAttribute("data-count-to") + suffix;
      });
    } else {
      var counterObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach(function (el) {
        counterObserver.observe(el);
      });
    }
  }


  /* ==========================================================================
     5. CONTACT FORM
     Front-end only. Validates fields, then shows a confirmation message.
     To make it actually send, point `form.action` at a form service
     (Formspree, Getform, Netlify Forms, etc.) and remove the preventDefault.
     ========================================================================== */
  var form = document.getElementById("contactForm");
  var formStatus = document.getElementById("formStatus");

  function setFieldError(field, message) {
    var wrapper = field.closest(".field");
    var errorEl = wrapper
      ? wrapper.querySelector(".field-error")
      : null;
    if (wrapper) wrapper.classList.toggle("has-error", Boolean(message));
    if (errorEl) errorEl.textContent = message || "";
    if (message) {
      field.setAttribute("aria-invalid", "true");
    } else {
      field.removeAttribute("aria-invalid");
    }
  }

  function validateEmail(value) {
    /* Simple, permissive email check — good enough for a UI hint */
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault(); /* no backend — handle it here */

      var name = form.elements["name"];
      var email = form.elements["email"];
      var message = form.elements["message"];
      var isValid = true;

      if (!name.value.trim()) {
        setFieldError(name, "Please enter your name.");
        isValid = false;
      } else {
        setFieldError(name, "");
      }

      if (!email.value.trim()) {
        setFieldError(email, "Please enter your email.");
        isValid = false;
      } else if (!validateEmail(email.value.trim())) {
        setFieldError(email, "Please enter a valid email address.");
        isValid = false;
      } else {
        setFieldError(email, "");
      }

      if (!message.value.trim()) {
        setFieldError(message, "Please enter a message.");
        isValid = false;
      } else {
        setFieldError(message, "");
      }

      if (!isValid) {
        if (formStatus) {
          formStatus.textContent = "Please fix the highlighted fields.";
          formStatus.className = "form-status is-error";
        }
        return;
      }

      /* Success path (simulated) */
      if (formStatus) {
        formStatus.textContent =
          "Thanks, " +
          name.value.trim().split(" ")[0] +
          "! Your message has been noted. We'll be in touch at " +
          email.value.trim() +
          ".";
        formStatus.className = "form-status is-success";
      }
      form.reset();
    });

    /* Clear a field's error as soon as the user starts correcting it */
    form.addEventListener("input", function (event) {
      if (event.target.matches("input, textarea")) {
        setFieldError(event.target, "");
      }
    });
  }


  /* ==========================================================================
     6. FOOTER YEAR
     ========================================================================== */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  /* ==========================================================================
     7. HERO BACKGROUND VIDEO
     - Starts muted so browsers allow autoplay.
     - The toggle button turns sound on/off.
     - If the visitor prefers reduced motion, pause the video and show
       its first frame instead of looping.
     ========================================================================== */
  var heroVideo = document.querySelector(".hero-video");
  var heroVideoToggle = document.getElementById("heroVideoToggle");

  if (heroVideo && prefersReducedMotion) {
    heroVideo.removeAttribute("autoplay");
    heroVideo.pause();
  }

  if (heroVideo && heroVideoToggle) {
    var label = heroVideoToggle.querySelector(".hero-video-toggle-label");

    function syncToggle() {
      var soundOn = !heroVideo.muted;
      heroVideoToggle.setAttribute("aria-pressed", String(soundOn));
      heroVideoToggle.setAttribute(
        "aria-label",
        soundOn ? "Mute background video" : "Unmute background video"
      );
      if (label) label.textContent = soundOn ? "Sound on" : "Sound off";
    }

    heroVideoToggle.addEventListener("click", function () {
      heroVideo.muted = !heroVideo.muted;
      /* Unmuting may require kicking playback off again */
      if (!heroVideo.muted && heroVideo.paused) {
        heroVideo.play().catch(function () {
          /* Autoplay with sound blocked — revert to muted */
          heroVideo.muted = true;
          syncToggle();
        });
      }
      syncToggle();
    });

    syncToggle();
  }
})();
