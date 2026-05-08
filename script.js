document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Background on Scroll
    const header = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.getElementById('navOverlay');
    const links = document.querySelectorAll('.nav-links li a');

    function toggleMenu() {
        const isOpen = navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
        navOverlay.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isOpen);
    }

    function closeMenu() {
        navLinks.classList.remove('active');
        hamburger.classList.remove('toggle');
        navOverlay.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger.addEventListener('click', toggleMenu);
    navOverlay.addEventListener('click', closeMenu);

    links.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                closeMenu();
            }
        });
    });

    // 3. Back to Top Button
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 600) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 4. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right');

    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Trigger animations for elements already in viewport on load
    setTimeout(() => {
        animateElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('appear');
            }
        });
    }, 100);
});
