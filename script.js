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

    // Ambient rain sound (generated via Web Audio API — no file needed)
    const soundToggle = document.getElementById('soundToggle');
    const soundIconOff = document.getElementById('soundIconOff');
    const soundIconOn = document.getElementById('soundIconOn');

    let audioCtx = null;
    let rainNodes = null;

    function createRain(ctx) {
        const bufferSize = ctx.sampleRate * 4;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 800;

        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 200;

        const gain = ctx.createGain();
        gain.gain.value = 0.28;

        source.connect(lowpass);
        lowpass.connect(highpass);
        highpass.connect(gain);
        gain.connect(ctx.destination);
        source.start();

        return { source, gain };
    }

    soundToggle.addEventListener('click', () => {
        if (!rainNodes) {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            rainNodes = createRain(audioCtx);
            soundToggle.classList.add('playing');
            soundIconOff.style.display = 'none';
            soundIconOn.style.display = 'block';
        } else {
            rainNodes.source.stop();
            rainNodes = null;
            soundToggle.classList.remove('playing');
            soundIconOff.style.display = 'block';
            soundIconOn.style.display = 'none';
        }
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
