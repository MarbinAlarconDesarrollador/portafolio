// 1. Registro del Service Worker para la PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log("PWA: Service Worker listo"))
        .catch(err => console.log("PWA: Error al registrar SW", err));
}

// 2. Configuración de GitHub
const USERNAME = 'MarbinAlarconDesarrollador';
const container = document.getElementById('portfolio');

/**
 * Crea la tarjeta visual mejorada para cada repositorio
 */
async function createCard(repo) {
    const card = document.createElement('article');
    card.className = 'project-card';

    // Obtener lenguajes (máx. 4)
    let langs = [];
    try {
        const langRes = await fetch(repo.languages_url);
        const langData = await langRes.json();
        langs = Object.keys(langData).slice(0, 4);
    } catch {
        if (repo.language) langs = [repo.language];
    }

    const desc    = repo.description || 'Sin descripción disponible.';
    const stars   = repo.stargazers_count || 0;
    const forks   = repo.forks_count || 0;
    const updated = new Date(repo.updated_at).toLocaleDateString('es-ES', {
        month: 'short', year: 'numeric'
    });

    card.innerHTML = `
        <div class="card-inner">
            <div class="card-top">
                <div class="card-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                    </svg>
                </div>
                <div class="card-meta-top">
                    <span class="card-updated">${updated}</span>
                    ${repo.homepage ? `
                    <a href="${repo.homepage}" class="card-live" target="_blank" rel="noopener" title="Ver demo">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        Live
                    </a>` : ''}
                </div>
            </div>

            <div class="card-body">
                <h3 class="card-title">${repo.name.replace(/-/g, ' ')}</h3>
                <p class="card-desc">${desc}</p>
            </div>

            <div class="card-footer">
                <div class="card-langs">
                    ${langs.map(l => `<span class="lang-tag">${l}</span>`).join('')}
                </div>
                <div class="card-stats">
                    <span class="stat" title="Stars">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        ${stars}
                    </span>
                    <span class="stat" title="Forks">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="6" y1="3" x2="6" y2="15"/>
                            <circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="6" cy="6" r="3"/>
                            <path d="M18 9a9 9 0 0 1-9 9"/>
                        </svg>
                        ${forks}
                    </span>
                </div>
                <a href="${repo.html_url}" class="card-link" target="_blank" rel="noopener">
                    Ver código
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                </a>
            </div>
        </div>
    `;

    // Animación escalonada: cuenta las cards ya en el DOM antes de insertar esta
    const cardIndex = document.querySelectorAll('.project-card').length;
    card.style.animationDelay = `${cardIndex * 80}ms`;

    return card;
}

/**
 * Obtiene los repositorios de GitHub y los filtra por el tópico 'portafolio'
 */
async function getRepos() {
    try {
        container.innerHTML = '<p class="loading">Cargando proyectos desde GitHub...</p>';

        const response = await fetch(`https://api.github.com/users/${USERNAME}/repos?sort=updated`);
        if (!response.ok) throw new Error("No se pudo conectar con la API de GitHub");

        const repos = await response.json();

        const reposFiltrados = repos.filter(repo =>
            repo.topics && (repo.topics.includes('portafolio') || repo.topics.includes('portfolio'))
        );

        if (reposFiltrados.length === 0) {
            container.innerHTML = "<p>Aún no hay proyectos marcados con el tag 'portafolio'.</p>";
            return;
        }

        container.innerHTML = '';

        for (const repo of reposFiltrados) {
            const card = await createCard(repo);
            container.appendChild(card);
        }

    } catch (error) {
        console.error("Error al cargar proyectos:", error);
        container.innerHTML = "<p>No se pudieron cargar los proyectos. Intenta más tarde.</p>";
    }
}

// 3. Inicializar la carga de proyectos
getRepos();

// --- Menú Hamburguesa ---
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
});

// Cerrar menú al hacer clic en un enlace o en el botón de contacto móvil
document.querySelectorAll('.mobile-nav-link, .nav-btn-mobile').forEach(element => {
    element.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
    });
});

// --- Theme Toggle ---
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const themeIcon = themeToggle.querySelector('i');

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        themeIcon.style.color = "#fbbf24";
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        themeIcon.style.color = "white";
    }
});

// --- Text Size Toggle ---
const textToggle = document.getElementById('text-toggle');
let sizeLevel = 0;

textToggle.addEventListener('click', () => {
    sizeLevel = (sizeLevel + 1) % 3;
    const root = document.documentElement;

    if (sizeLevel === 0) {
        root.style.fontSize = '100%';
        textToggle.style.color = 'var(--text-main)';
    } else if (sizeLevel === 1) {
        root.style.fontSize = '115%';
        textToggle.style.color = 'var(--accent)';
    } else {
        root.style.fontSize = '125%';
    }
});

// --- Audio Toggle (Text-to-Speech) ---
const audioToggle = document.getElementById('audio-toggle');
const audioIcon = audioToggle.querySelector('i');
let isReading = false;
const synth = window.speechSynthesis;

audioToggle.addEventListener('click', () => {
    if (synth.speaking && isReading) {
        synth.cancel();
        isReading = false;
        audioIcon.classList.replace('fa-volume-xmark', 'fa-volume-high');
        audioToggle.style.backgroundColor = '#38bdf8';
        return;
    }

    const textToRead = document.querySelector('main').innerText;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'es-ES';
    utterance.rate = 1;

    utterance.onstart = () => {
        isReading = true;
        audioIcon.classList.replace('fa-volume-high', 'fa-volume-xmark');
        audioToggle.style.backgroundColor = '#f43f5e';
    };

    utterance.onend = () => {
        isReading = false;
        audioIcon.classList.replace('fa-volume-xmark', 'fa-volume-high');
        audioToggle.style.backgroundColor = '#38bdf8';
    };

    synth.speak(utterance);
});

// --- Botón Scroll Top ---
const btnScrollTop = document.getElementById('btn-scroll-top');

window.addEventListener('scroll', () => {
    btnScrollTop.classList.toggle('show', window.scrollY > 300);
});

btnScrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- Navbar compacta al hacer scroll ---
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.height = '60px';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.height = '70px';
        navbar.style.boxShadow = 'none';
    }
});

// --- Efecto de Revelado de Secciones (IntersectionObserver) ---
function aplicarMovimiento() {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.10 });

    document.querySelectorAll('.reveal').forEach(section => {
        revealObserver.observe(section);
    });
}

window.addEventListener('DOMContentLoaded', aplicarMovimiento);

// --- Efecto de Foto 3D ---
const foto3D = document.getElementById('foto-3d');
const img3D = foto3D.querySelector('img');
const intensidad = 20;

foto3D.addEventListener('mousemove', (e) => {
    const rect = foto3D.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY =  ((x - centerX) / centerX) * intensidad;
    const rotateX = -((y - centerY) / centerY) * intensidad;

    img3D.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    img3D.style.boxShadow = `${-rotateY / 2}px ${-rotateX / 2}px 30px rgba(0,0,0,0.3)`;
});

foto3D.addEventListener('mouseleave', () => {
    img3D.style.transform = 'rotateX(0deg) rotateY(0deg)';
    img3D.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
});

// --- Control del Splash Screen ---
window.addEventListener('load', () => {
    const splash = document.getElementById('splash-screen');

    setTimeout(() => {
        splash.classList.add('hidden');
        setTimeout(() => splash.remove(), 600);
    }, 2500);
});
