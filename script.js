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

    // Nature soundscape (Web Audio API — no file needed)
    const soundToggle = document.getElementById('soundToggle');
    const soundIconOff = document.getElementById('soundIconOff');
    const soundIconOn  = document.getElementById('soundIconOn');

    let audioCtx   = null;
    let natureSc   = null;

    function createNature(ctx) {
        const allSources = [];
        let   birdTimer  = null;
        let   active     = true;

        // Master gain — fades in over 3 s
        const master = ctx.createGain();
        master.gain.setValueAtTime(0, ctx.currentTime);
        master.gain.linearRampToValueAtTime(1, ctx.currentTime + 3);
        master.connect(ctx.destination);

        // ── Pink-noise buffer factory ──
        function pinkBuf(seconds) {
            const len = ctx.sampleRate * seconds;
            const buf = ctx.createBuffer(2, len, ctx.sampleRate);
            for (let ch = 0; ch < 2; ch++) {
                const d = buf.getChannelData(ch);
                let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
                for (let i = 0; i < len; i++) {
                    const w = Math.random() * 2 - 1;
                    b0 = 0.99886*b0 + w*0.0555179;
                    b1 = 0.99332*b1 + w*0.0750759;
                    b2 = 0.96900*b2 + w*0.1538520;
                    b3 = 0.86650*b3 + w*0.3104856;
                    b4 = 0.55000*b4 + w*0.5329522;
                    b5 = -0.7616 *b5 - w*0.0168980;
                    d[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;
                    b6 = w*0.115926;
                }
            }
            return buf;
        }

        function noiseLayer(buf, hpFreq, lpFreq, vol) {
            const src = ctx.createBufferSource();
            src.buffer = buf; src.loop = true;
            const hp = ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=hpFreq;
            const lp = ctx.createBiquadFilter(); lp.type='lowpass';  lp.frequency.value=lpFreq;
            const g  = ctx.createGain(); g.gain.value = vol;
            src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(master);
            src.start();
            allSources.push(src);
            return { src, g };
        }

        // Layer 1 — deep forest rumble / distant rain
        noiseLayer(pinkBuf(8), 80,  500,  0.18);
        // Layer 2 — light rain / leaves
        const layer2 = noiseLayer(pinkBuf(8), 700, 3200, 0.13);
        // Layer 3 — gentle stream sparkle
        noiseLayer(pinkBuf(8), 1800, 6000, 0.07);

        // Slow LFO on layer 2 to simulate wind gusts
        const lfo = ctx.createOscillator();
        lfo.type = 'sine'; lfo.frequency.value = 0.08;
        const lfoG = ctx.createGain(); lfoG.gain.value = 0.04;
        lfo.connect(lfoG); lfoG.connect(layer2.g.gain);
        lfo.start(); allSources.push(lfo);

        // ── Bird call synthesiser ──
        function chirp(notes) {
            notes.forEach(({ f1, f2, dur, vol, delay }) => {
                const t = ctx.currentTime + delay;
                const osc  = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const env  = ctx.createGain();
                const mix2 = ctx.createGain();

                osc.type  = 'sine';
                osc2.type = 'sine';
                osc.frequency.setValueAtTime(f1, t);
                osc.frequency.linearRampToValueAtTime(f2, t + dur * 0.55);
                osc.frequency.linearRampToValueAtTime(f1 * 0.92, t + dur);
                osc2.frequency.setValueAtTime(f1 * 2.02, t); // soft overtone

                env.gain.setValueAtTime(0, t);
                env.gain.linearRampToValueAtTime(vol, t + 0.012);
                env.gain.setValueAtTime(vol, t + dur * 0.65);
                env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

                mix2.gain.value = 0.12;
                osc.connect(env); osc2.connect(mix2); mix2.connect(env);
                env.connect(master);

                osc.start(t);  osc.stop(t + dur + 0.05);
                osc2.start(t); osc2.stop(t + dur + 0.05);
                allSources.push(osc, osc2);
            });
        }

        // A library of bird song patterns
        const songs = [
            // Robin: quick upward chirp repeated
            [{ f1:3500, f2:4200, dur:0.10, vol:0.06, delay:0 },
             { f1:3800, f2:4500, dur:0.09, vol:0.05, delay:0.20 }],
            // Warbler: rapid three-note trill
            [{ f1:4200, f2:4800, dur:0.07, vol:0.05, delay:0 },
             { f1:4400, f2:5000, dur:0.07, vol:0.05, delay:0.13 },
             { f1:4000, f2:4600, dur:0.07, vol:0.04, delay:0.26 }],
            // Thrush: rich two-note call
            [{ f1:2800, f2:3600, dur:0.22, vol:0.06, delay:0 },
             { f1:3200, f2:2600, dur:0.20, vol:0.055, delay:0.40 }],
            // High tweet: single bright note
            [{ f1:5400, f2:5800, dur:0.06, vol:0.05, delay:0 }],
            // Cuckoo-like: descending two notes
            [{ f1:2300, f2:2000, dur:0.28, vol:0.06, delay:0 },
             { f1:1900, f2:1700, dur:0.26, vol:0.055, delay:0.50 }],
            // Sparrow: four fast notes
            [{ f1:3800, f2:4100, dur:0.06, vol:0.045, delay:0   },
             { f1:3900, f2:4200, dur:0.06, vol:0.045, delay:0.11 },
             { f1:3700, f2:4000, dur:0.06, vol:0.045, delay:0.22 },
             { f1:4100, f2:4400, dur:0.06, vol:0.040, delay:0.33 }],
            // Blackbird: long melodic phrase
            [{ f1:2600, f2:3200, dur:0.30, vol:0.055, delay:0   },
             { f1:3000, f2:3800, dur:0.25, vol:0.055, delay:0.45 },
             { f1:3500, f2:2900, dur:0.30, vol:0.05,  delay:0.85 }],
        ];

        function scheduleBird() {
            if (!active) return;
            chirp(songs[Math.floor(Math.random() * songs.length)]);
            birdTimer = setTimeout(scheduleBird, 1800 + Math.random() * 4500);
        }
        birdTimer = setTimeout(scheduleBird, 2500);

        return {
            stop() {
                active = false;
                clearTimeout(birdTimer);
                master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.8);
                setTimeout(() => allSources.forEach(s => { try { s.stop(); } catch(e){} }), 1900);
            }
        };
    }

    soundToggle.addEventListener('click', () => {
        if (!natureSc) {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            natureSc = createNature(audioCtx);
            soundToggle.classList.add('playing');
            soundIconOff.style.display = 'none';
            soundIconOn.style.display  = 'block';
        } else {
            natureSc.stop();
            natureSc = null;
            soundToggle.classList.remove('playing');
            soundIconOff.style.display = 'block';
            soundIconOn.style.display  = 'none';
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
