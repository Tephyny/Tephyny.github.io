document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const loaderScreen = document.getElementById('loader-screen');
    const loaderBar = document.getElementById('loader-bar');
    const loaderText = document.getElementById('loader-text');
    const progressPercent = document.getElementById('progress-percent');
    const landingPage = document.getElementById('y2k-landing-page');
    
    const heroContainer = document.querySelector('.hero-split-container');
    const navBar = document.querySelector('.y2k-navbar-desktop');
    const navLinks = document.querySelectorAll('.nav-link'); 
    
    const loadingSound = document.getElementById('loading-sound');
    const clickSound = document.getElementById('click-sound');
    const humSound = document.getElementById('tv-hum');
    const bgMusic = document.getElementById('bg-music'); 
    const musicBtn = document.getElementById('music-control'); 

    const navTrigger = document.getElementById('nav-trigger');
    const sideNav = document.getElementById('side-nav');

    // --- Dynamic Background Glow ---
    const glow = document.createElement('div');
    glow.className = 'bg-glow';
    document.body.prepend(glow);

    window.addEventListener('mousemove', (e) => {
        glow.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
    });

    // --- State Variables ---
    let currentSkillSlide = 0;
    let progress = 0;
    const messages = ["WARMING UP..", "BREWING MAGIC...", "LOADING VIBES...", "PIXEL POLISHING...", "ALMOST READY...", "ENJOY..."];
    let messageIndex = 0;
    let userHasInteracted = false; 

    // --- TAB SWITCH LOGIC ---
    document.addEventListener("visibilitychange", () => {
        if (bgMusic) {
            if (document.hidden) {
                bgMusic.pause();
            } else {
                if (!musicBtn.classList.contains('muted') && userHasInteracted) {
                    bgMusic.play().catch(e => console.log("Waiting for interaction to resume"));
                }
            }
        }
    });

    // --- Helper Functions ---
    function playSound(audioElement) {
        if (audioElement) {
            audioElement.currentTime = 0; 
            audioElement.play().catch(e => {});
        }
    }

    // --- SCROLL SPY ---
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                if (id) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
                    });
                }
            }
        });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    document.querySelectorAll('section, [id]').forEach(section => scrollObserver.observe(section));

    // --- Music Toggle ---
    window.toggleMusic = function() {
        if (!bgMusic) return;
        userHasInteracted = true; 
        if (bgMusic.paused) {
            bgMusic.play();
            musicBtn.classList.remove('muted'); 
        } else {
            bgMusic.pause();
            musicBtn.classList.add('muted'); 
        }
        playSound(clickSound);
    };

    // --- TV Toggle Logic (Handles Auto-On AND Manual Off) ---
    window.toggleTV = function(forceOn = false) {
        const screen = document.getElementById('tv-screen');
        const btn = document.getElementById('tv-switch');
        
        // If forceOn is false (user clicked), we toggle. If true (auto-boot), we strictly turn on.
        if (forceOn) {
            if (screen) screen.classList.add('screen-on');
            if (btn) btn.classList.add('on');
        } else {
            playSound(clickSound); // Only click if user manually interacts
            if (screen) screen.classList.toggle('screen-on');
            if (btn) btn.classList.toggle('on');
        }

        // Handle the Hum sound based on final state
        if (screen && screen.classList.contains('screen-on')) {
            if (humSound) humSound.play().catch(() => console.log("Hum waiting for interaction"));
        } else {
            if (humSound) humSound.pause();
        }
    };

    // --- Loader Logic ---
    function updateLoader() {
        if (progress === 0 && loadingSound) playSound(loadingSound);
        if (progress < 100) {
            let step = Math.floor(Math.random() * 6) + 1; 
            progress = Math.min(100, progress + step);
            if (loaderBar) loaderBar.style.width = progress + '%';
            if (progressPercent) progressPercent.textContent = progress + '%';
            if (progress % 20 < step) {
                if (progress >= 99) messageIndex = messages.length - 1;
                else if (messageIndex < messages.length - 1) messageIndex++;
                if (loaderText) loaderText.textContent = messages[messageIndex];
            }
            setTimeout(updateLoader, 80 + Math.random() * 100); 
        } else {
            finishLoading();
        }
    }

    function finishLoading() {
        if (loaderText) loaderText.textContent = "INTERFACE READY.";
        if (loadingSound) loadingSound.pause();

        if (bgMusic) {
            bgMusic.volume = 0.3; 
            bgMusic.loop = true;

            const startMusic = () => {
                if (!userHasInteracted) {
                    bgMusic.play().then(() => {
                        userHasInteracted = true;
                        musicBtn.classList.remove('muted');
                        // Start hum if TV is on
                        const screen = document.getElementById('tv-screen');
                        if (humSound && screen && screen.classList.contains('screen-on')) {
                            humSound.play();
                        }
                    }).catch(() => {});
                }
            };

            ['mousedown', 'touchstart', 'keydown', 'wheel'].forEach(evt => 
                window.addEventListener(evt, startMusic, { once: true })
            );
        }

        setTimeout(() => {
            loaderScreen.classList.add('fade-out');
            if (landingPage) landingPage.classList.remove('hidden');

            // --- AUTO TURN ON TV ---
            setTimeout(() => {
                window.toggleTV(true); 
            }, 600); 

            setTimeout(() => {
                if (heroContainer) heroContainer.classList.add('landing-visible');
                if (navBar) navBar.classList.add('landing-visible');
                setTimeout(() => { loaderScreen.style.display = 'none'; }, 800);
            }, 150); 
        }, 500);
    }

    // --- Navigation ---
    if (navTrigger) {
        navTrigger.addEventListener('click', () => {
            navTrigger.classList.toggle('open');
            sideNav.classList.toggle('open');
            playSound(clickSound);
        });
    }

    // --- TV Carousel ---
    let currentTVSlide = 0;
    setInterval(() => {
        const screen = document.getElementById('tv-screen');
        if (screen && screen.classList.contains('screen-on')) {
            const slides = document.querySelectorAll('.slide');
            if (slides.length > 0) {
                slides[currentTVSlide].classList.remove('active');
                currentTVSlide = (currentTVSlide + 1) % slides.length;
                slides[currentTVSlide].classList.add('active');
            }
        }
    }, 3000);

    // --- Skills Carousel ---
    window.moveSlide = function(direction) {
        const track = document.querySelector('.carousel-track');
        const slides = document.querySelectorAll('.skill-card');
        const dots = document.querySelectorAll('.dot');
        if (!track || slides.length === 0) return;
        currentSkillSlide = (currentSkillSlide + direction + slides.length) % slides.length;
        track.style.transform = `translateX(calc(-${currentSkillSlide * 100}% - ${currentSkillSlide * 30}px))`;
        if (dots.length > 0) {
            dots.forEach(dot => dot.classList.remove('active'));
            dots[currentSkillSlide].classList.add('active');
        }
        playSound(clickSound);
    };

    updateLoader();
});