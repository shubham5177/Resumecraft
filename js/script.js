// Shared navbar + footer injector, toast system, utils

const navbarHTML = `
<nav class="navbar navbar-expand-lg">
  <div class="container">
    <a class="navbar-brand" href="index.html">Resume<span>Craft</span></a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navMenu">
      <ul class="navbar-nav ms-auto align-items-center gap-1">
        <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="templates.html">Templates</a></li>
        <li class="nav-item nav-auth-show" style="display:none">
          <a class="nav-link" href="dashboard.html">Dashboard</a>
        </li>
        <li class="nav-item nav-guest" >
          <a class="nav-link" href="login.html">Login</a>
        </li>
        <li class="nav-item nav-guest">
          <a href="signup.html" class="btn-primary-custom ms-2" style="text-decoration:none;font-size:0.88rem;padding:0.55rem 1.4rem">Get Started</a>
        </li>
        <li class="nav-item nav-auth-show" style="display:none">
          <a href="builder.html" class="btn-primary-custom ms-2" style="text-decoration:none;font-size:0.88rem;padding:0.55rem 1.4rem"><i class="bi bi-plus-lg"></i> New Resume</a>
        </li>
      </ul>
    </div>
  </div>
</nav>`;

const footerHTML = `
<footer style="background:linear-gradient(135deg, #ff006e 0%, #a100f2 100%);border-top:2px solid #000;color:#fff;border-radius:0">
  <style>
    footer { box-shadow: inset 0 2px 0 rgba(0,0,0,0.1) !important; }
    footer .footer-brand, footer .footer-brand span { color: #fff !important; }
    footer .footer-heading { color: rgba(255,255,255,0.95) !important; }
    footer .footer-links a { color: rgba(255,255,255,0.9) !important; }
    footer .footer-links a:hover { color: #fff !important; text-decoration: underline; }
    footer .footer-desc { color: rgba(255,255,255,0.85) !important; }
    footer .footer-copy { color: rgba(255,255,255,0.85) !important; }
    footer .social-btn { background: rgba(255,255,255,0.2) !important; border: 2px solid rgba(255,255,255,0.4) !important; color: #fff !important; }
    footer .social-btn:hover { background: rgba(255,255,255,0.4) !important; border-color: #fff !important; }
    footer .footer-bottom { border-top: 1px solid rgba(255,255,255,0.3) !important; }
  </style>
  <div class="container">
    <div class="row gy-4">
      <div class="col-lg-4">
        <div class="footer-brand">Resume<span>Craft</span></div>
        <p class="footer-desc">Build stunning resumes in minutes with AI-powered templates and real-time preview.</p>
      </div>
      <div class="col-6 col-lg-2 offset-lg-2">
        <div class="footer-heading">Product</div>
        <ul class="footer-links">
          <li><a href="templates.html">Templates</a></li>
          <li><a href="builder.html">Builder</a></li>
          <li><a href="dashboard.html">Dashboard</a></li>
        </ul>
      </div>
      <div class="col-6 col-lg-2">
        <div class="footer-heading">Account</div>
        <ul class="footer-links">
          <li><a href="signup.html">Sign Up</a></li>
          <li><a href="login.html">Login</a></li>
        </ul>
      </div>
      <div class="col-lg-2">
        <div class="footer-heading">Legal</div>
        <ul class="footer-links">
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="footer-copy">© 2025 ResumeCraft. Built with ❤️</span>
      <div class="footer-socials">
        <a href="#" class="social-btn"><i class="bi bi-github"></i></a>
        <a href="#" class="social-btn"><i class="bi bi-twitter-x"></i></a>
        <a href="#" class="social-btn"><i class="bi bi-linkedin"></i></a>
      </div>
    </div>
  </div>
</footer>`;

// Inject navbar and footer
document.addEventListener('DOMContentLoaded', () => {
    const navSlot = document.getElementById('navbar-slot');
    const footerSlot = document.getElementById('footer-slot');
    if (navSlot) navSlot.innerHTML = navbarHTML;
    if (footerSlot) footerSlot.innerHTML = footerHTML;

    // Navbar scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50));
    }

    // Auth state UI (minimal - main auth handled per-page)
    checkNavAuth();

    // AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 750, easing: 'ease-out-cubic', once: true, offset: 50 });
    }
});

async function checkNavAuth() {
    // Try Firebase if available
    try {
        const { onAuthChange } = await
        import ('./auth.js');
        onAuthChange(user => {
            document.querySelectorAll('.nav-auth-show').forEach(el => el.style.display = user ? '' : 'none');
            document.querySelectorAll('.nav-guest').forEach(el => el.style.display = user ? 'none' : '');
        });
    } catch (e) {}
}

// ===== TOAST SYSTEM =====
export function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ===== UTILS =====
export function formatDate(ts) {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function debounce(fn, delay = 300) {
    let t;
    return (...args) => { clearTimeout(t);
        t = setTimeout(() => fn(...args), delay); };
}

export function requireAuth() {
    import ('./auth.js').then(({ onAuthChange }) => {
        onAuthChange(user => {
            if (!user) window.location.href = 'login.html';
        });
    });
}