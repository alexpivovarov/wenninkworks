document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.getElementById('navOverlay');
    const backToTop = document.getElementById('backToTop');

    // Scroll: header + back-to-top
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
        backToTop.classList.toggle('visible', window.scrollY > 600);
    });

    // Mobile menu
    function closeMenu() {
        navLinks.classList.remove('active');
        hamburger.classList.remove('toggle');
        navOverlay.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
        navOverlay.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isOpen);
    });

    navOverlay.addEventListener('click', closeMenu);
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    // Back to top
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('appear');
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

    setTimeout(() => {
        document.querySelectorAll('.fade-in-up').forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('appear');
        });
    }, 100);
});
