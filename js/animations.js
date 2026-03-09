// Initialize AOS
export function initAOS() {
  AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 60 });
}

// GSAP hero animation
export function animateHero() {
  if (typeof gsap === 'undefined') return;
  gsap.from('.hero-badge', { opacity: 0, y: -20, duration: 0.6, delay: 0.2 });
  gsap.from('.hero-title', { opacity: 0, y: 40, duration: 0.8, delay: 0.4 });
  gsap.from('.hero-sub', { opacity: 0, y: 30, duration: 0.8, delay: 0.6 });
  gsap.from('.hero-cta', { opacity: 0, y: 20, duration: 0.6, delay: 0.8 });
  gsap.from('.hero-visual', { opacity: 0, x: 60, duration: 1, delay: 0.5, ease: 'power3.out' });
}

// Navbar scroll effect
export function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// Stagger card animations
export function staggerCards(selector) {
  if (typeof gsap === 'undefined') return;
  gsap.from(selector, { opacity: 0, y: 50, stagger: 0.15, duration: 0.7, ease: 'power2.out' });
}
