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
        // Stereo pink noise buffer (8s loop) — pink noise sounds far more natural than white
        const bufferSize = ctx.sampleRate * 8;
        const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

        for (let ch = 0; ch < 2; ch++) {
            const data = noiseBuffer.getChannelData(ch);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const w = Math.random() * 2 - 1;
                // Paul Kellett's pink noise approximation
                b0 = 0.99886 * b0 + w * 0.0555179;
                b1 = 0.99332 * b1 + w * 0.0750759;
                b2 = 0.96900 * b2 + w * 0.1538520;
                b3 = 0.86650 * b3 + w * 0.3104856;
                b4 = 0.55000 * b4 + w * 0.5329522;
                b5 = -0.7616 * b5 - w * 0.0168980;
                data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.12;
                b6 = w * 0.115926;
            }
        }

        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        // Shape noise to sound like rain: cut extreme lows and highs
        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 300;
        highpass.Q.value = 0.4;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 3500;
        lowpass.Q.value = 0.4;

        // Gentle presence boost in the "patter" range
        const peak = ctx.createBiquadFilter();
        peak.type = 'peaking';
        peak.frequency.value = 1400;
        peak.gain.value = 4;
        peak.Q.value = 0.7;

        // Fade in gently over 2 seconds
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.38, ctx.currentTime + 2);

        source.connect(highpass);
        highpass.connect(lowpass);
        lowpass.connect(peak);
        peak.connect(gain);
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
            // Fade out over 1.5 seconds before stopping
            rainNodes.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
            const nodeToStop = rainNodes.source;
            setTimeout(() => nodeToStop.stop(), 1600);
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
