// Navbar toggle and search functionality
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const navList = document.querySelector('.nav-list');
    const searchInput = document.getElementById('searchInput');
    const searchable = document.querySelectorAll('[data-search]');

    menuToggle.addEventListener('click', () => {
        navList.classList.toggle('open');
        if (navList.classList.contains('open')) {
            navList.style.display = 'flex';
            navList.style.flexDirection = 'column';
            navList.style.gap = '12px';
        } else {
            navList.style.display = 'none';
            navList.style.flexDirection = 'row';
        }
    });

    // clear any previous highlights/marks
    function clearMarks(section) {
        const marks = section.querySelectorAll('mark.search-mark');
        marks.forEach(m => {
            const parent = m.parentNode;
            parent.replaceChild(document.createTextNode(m.textContent), m);
            parent.normalize();
        });
    }

    function clearAllMarks() {
        searchable.forEach(s => clearMarks(s));
    }

    function searchPage(query) {
        query = query.trim().toLowerCase();
        if (!query) {
            searchable.forEach(s => { s.classList.remove('hidden'); s.classList.remove('match'); clearMarks(s); });
            return;
        }
        let firstMatch = null;
        searchable.forEach(s => {
            const text = s.innerText.toLowerCase();
            if (text.includes(query)) {
                s.classList.remove('hidden');
                s.classList.add('match');
                // highlight simple by replacing text nodes with mark (best-effort)
                clearMarks(s);
                // naive markup: replace occurrences in innerHTML of small sections only
                try {
                    const re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
                    s.innerHTML = s.innerHTML.replace(re, '<mark class="search-mark">$1</mark>');
                } catch (e) {/*ignore*/ }
                if (!firstMatch) firstMatch = s;
            } else {
                s.classList.add('hidden');
                s.classList.remove('match');
                clearMarks(s);
            }
        });
        if (firstMatch) {
            // scroll to first match smoothly
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    let timeout = null;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        const q = e.target.value;
        timeout = setTimeout(() => searchPage(q), 180);
    });

    // allow Enter to focus first match
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const first = document.querySelector('.match');
            if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    // reveal animations when scrolling
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(en => {
            if (en.isIntersecting) en.target.classList.remove('hidden');
        });
    }, { threshold: 0.09 });
    document.querySelectorAll('.section, .hero, .project-card, .skill-card').forEach(el => {
        el.classList.add('hidden');
        obs.observe(el);
    });

    // Tech pills: start hidden and reveal with a stagger when hero is visible
    const techPills = document.querySelectorAll('.tech-pill');
    techPills.forEach(p => p.classList.remove('revealed'));
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        const pillsObserver = new IntersectionObserver((entries) => {
            entries.forEach(en => {
                if (en.isIntersecting) {
                    techPills.forEach((p, i) => {
                        setTimeout(() => p.classList.add('revealed'), i * 100 + 120);
                    });
                    pillsObserver.unobserve(heroSection);
                }
            });
        }, { threshold: 0.18 });
        pillsObserver.observe(heroSection);
    }

    // small enhancement: clicking nav anchors closes mobile menu
    document.querySelectorAll('.nav-list a').forEach(a => {
        a.addEventListener('click', () => {
            if (window.innerWidth <= 900) { navList.classList.remove('open'); navList.style.display = 'none'; }
        });
    });

    // Typing animation for hero
    const typedEl = document.getElementById('typed');
    if (typedEl) {
        const phrases = ['Python Fullstack Developer', 'Django • FastAPI • REST', 'React • TypeScript • UX', 'APIs, Scaling & DevOps'];
        let pi = 0, ci = 0, deleting = false;
        const cursor = document.createElement('span'); cursor.className = 'typed-cursor';
        typedEl.parentNode.insertBefore(cursor, typedEl.nextSibling);
        function tick() {
            const phrase = phrases[pi];
            if (!deleting) {
                typedEl.textContent = phrase.slice(0, ci + 1);
                ci++;
                if (ci === phrase.length) { deleting = true; setTimeout(tick, 1200); return; }
            } else {
                typedEl.textContent = phrase.slice(0, ci - 1);
                ci--;
                if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
            }
            setTimeout(tick, deleting ? 60 : 100);
        }
        tick();
    }

    // gentle avatar tilt based on pointer (desktop only)
    const avatar = document.getElementById('avatar');
    if (avatar && window.matchMedia('(pointer:fine)').matches) {
        avatar.addEventListener('mousemove', (e) => {
            const r = avatar.getBoundingClientRect();
            const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
            const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
            avatar.style.transform = `perspective(900px) rotateX(${-dy * 6}deg) rotateY(${dx * 10}deg)`;
            avatar.style.boxShadow = `0 20px 50px rgba(102,126,234,0.18)`;
        });
        avatar.addEventListener('mouseleave', () => { avatar.style.transform = 'none'; avatar.style.boxShadow = '0 14px 40px rgba(102,126,234,0.14)'; });
    }
});
