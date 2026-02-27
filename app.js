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
 * Obtiene los repositorios de GitHub y los filtra por el tópico 'portafolio'
 */
async function getRepos() {
    try {
        // Mostramos un mensaje de carga inicial
        container.innerHTML = '<p class="loading">Cargando proyectos desde GitHub...</p>';

        const response = await fetch(`https://api.github.com/users/${USERNAME}/repos?sort=updated`);
        
        if (!response.ok) throw new Error("No se pudo conectar con la API de GitHub");
        
        const repos = await response.json();

        // FILTRO: Solo mostramos repos que tengan el topic 'portafolio'
        // Nota: Asegúrate de ponerle 'portafolio' (con o sin 'o') según lo uses en GitHub
        const reposFiltrados = repos.filter(repo => 
            repo.topics && (repo.topics.includes('portafolio') || repo.topics.includes('portfolio'))
        );

        if (reposFiltrados.length === 0) {
            container.innerHTML = "<p>Aún no hay proyectos marcados con el tag 'portafolio'.</p>";
            return;
        }

        // Limpiamos el contenedor antes de renderizar
        container.innerHTML = '';

        // Usamos for...of para manejar la asincronía de los lenguajes dentro de cada card
        for (const repo of reposFiltrados) {
            const card = await createCard(repo);
            container.appendChild(card);
        }

    //hideSplashScreen();

    } catch (error) {
        console.error("Error:", error);
       // hideSplashScreen(); // También lo ocultamos si hay error
    }
}
/*
function hideSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if(splash) {
        splash.classList.add('fade-out');
        // Opcional: eliminarlo del DOM después de la animación
        setTimeout(() => splash.remove(), 800);
    }
}*/
/**
 * Crea el elemento HTML de la tarjeta del proyecto
 */
async function createCard(repo) {
    const article = document.createElement('article');
    article.className = 'project-card';

    // 1. Obtener TODOS los lenguajes del repositorio
    let tagsHTML = '';
    try {
        const langResponse = await fetch(repo.languages_url);
        const langsData = await langResponse.json();
        const languages = Object.keys(langsData); // Ejemplo: ["JavaScript", "HTML", "CSS"]
        
        tagsHTML = languages.map(lang => `<span class="tag">${lang}</span>`).join('');
    } catch (err) {
        // Si falla, usamos al menos el lenguaje principal
        tagsHTML = repo.language ? `<span class="tag">${repo.language}</span>` : '';
    }

    // 2. Detectamos el enlace de "Sitio Web" (homepage)
    const hasWebsite = repo.homepage && repo.homepage.trim() !== "";
    const websiteLink = hasWebsite 
        ? `<a href="${repo.homepage}" target="_blank" class="btn-visit">Visitar Sitio 🚀</a>` 
        : '';

    // 3. Estructura de la tarjeta
    article.innerHTML = `
        <div class="card-content">
            <div class="card-header">
                <h3>${repo.name.replace(/-/g, ' ')}</h3>
                <div class="tags-container">
                    ${tagsHTML}
                </div>
            </div>
            
            <p class="description">${repo.description || 'Sin descripción disponible actualmente.'}</p>
            
            <div class="card-footer">
                <a href="${repo.html_url}" target="_blank" class="btn-code" rel="noopener">Ver Código</a>
                ${websiteLink}
            </div>
        </div>
    `;
    return article;
}

// 3. Inicializar la carga
getRepos();


/*const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const icon = themeToggle.querySelector('i');

// 1. Revisar si el usuario ya tenía un tema preferido guardado
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    icon.classList.replace('fa-moon', 'fa-sun');
}

// 2. Evento de clic para cambiar el tema
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Cambiamos el icono visualmente
    if (body.classList.contains('dark-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark'); // Guardamos preferencia
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light'); // Guardamos preferencia
    }
});*/

const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const themeIcon = themeToggle.querySelector('i');

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Cambiamos el icono de Luna a Sol
    if (body.classList.contains('dark-mode')) {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        themeIcon.style.color = "#fbbf24"; // Color sol
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        themeIcon.style.color = "white"; // Color luna
    }
});

const textToggle = document.getElementById('text-toggle');
let sizeLevel = 0; // 0: Normal, 1: Grande, 2: Muy Grande

textToggle.addEventListener('click', () => {
    sizeLevel = (sizeLevel + 1) % 3; // Ciclo entre 0, 1 y 2
    
    const root = document.documentElement;
    
    if (sizeLevel === 0) {
        root.style.fontSize = '100%';
        textToggle.style.color = 'var(--text-main)';
    } else if (sizeLevel === 1) {
        root.style.fontSize = '115%';
        textToggle.style.color = 'var(--accent)'; // Cambia color para indicar que está activo
    } else {
        root.style.fontSize = '125%';
    }
});

const audioToggle = document.getElementById('audio-toggle');
const audioIcon = audioToggle.querySelector('i');
let isReading = false;
const synth = window.speechSynthesis;

audioToggle.addEventListener('click', () => {
    // Si ya está leyendo, lo detenemos
    if (synth.speaking && isReading) {
        synth.cancel();
        isReading = false;
        audioIcon.classList.replace('fa-volume-xmark', 'fa-volume-high');
        audioToggle.style.backgroundColor = '#38bdf8'; // Color original
        return;
    }

    // Obtenemos el texto de las secciones principales
    const textToRead = document.querySelector('main').innerText;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    // Configuración de la voz
    utterance.lang = 'es-ES'; // Idioma español
    utterance.rate = 1;      // Velocidad normal

    utterance.onstart = () => {
        isReading = true;
        audioIcon.classList.replace('fa-volume-high', 'fa-volume-xmark');
        audioToggle.style.backgroundColor = '#f43f5e'; // Rojo para indicar "Detener"
    };

    utterance.onend = () => {
        isReading = false;
        audioIcon.classList.replace('fa-volume-xmark', 'fa-volume-high');
        audioToggle.style.backgroundColor = '#38bdf8';
    };

    synth.speak(utterance);
});

const btnScrollTop = document.getElementById('btn-scroll-top');

// 1. Mostrar/Ocultar botón según el scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) { // Aparece tras bajar 300px
        btnScrollTop.classList.add('show');
    } else {
        btnScrollTop.classList.remove('show');
    }
});

// 2. Funcionalidad de subir al inicio
btnScrollTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Subida suave
    });
});

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

// --- Efecto de Revelado de Secciones ---
const observerOptions = {
    threshold: 0.15 // Se activa cuando el 15% de la sección es visible
};

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Una vez revelado, dejamos de observarlo para ahorrar recursos
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Aplicamos el observador a todas las secciones con la clase .reveal
document.querySelectorAll('.reveal').forEach(section => {
    revealObserver.observe(section);
});

function aplicarMovimiento() {
    const observerOptions = {
        threshold: 0.05 // Apenas asome un 5%, ¡pum!, se mueve
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                // Opcional: Quita la clase si quieres que el efecto
                // se repita cada vez que subas y bajes
                // entry.target.classList.remove('active'); 
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(section => {
        revealObserver.observe(section);
    });
}

// Ejecutar después de que carguen los proyectos
// Si tu función de GitHub se llama getRepos, llámalo ahí
window.addEventListener('DOMContentLoaded', aplicarMovimiento);


// --- Efecto de Foto 3D ---
const foto3D = document.getElementById('foto-3d');
const img3D = foto3D.querySelector('img');

// Intensidad del giro (a mayor número, menos gira)
const intensidad = 20; 

foto3D.addEventListener('mousemove', (e) => {
    // 1. Calcular posición del mouse relativa al centro de la foto
    const rect = foto3D.getBoundingClientRect();
    const x = e.clientX - rect.left; // Posición X dentro del div
    const y = e.clientY - rect.top;  // Posición Y dentro del div
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // 2. Calcular los grados de rotación
    // Girar en Y basado en la posición X del mouse (izq/der)
    const rotateY = ((x - centerX) / centerX) * intensidad; 
    // Girar en X basado en la posición Y del mouse (arriba/abajo)
    // Se invierte con '-' para que baje al mover arriba
    const rotateX = -((y - centerY) / centerY) * intensidad; 
    
    // 3. Aplicar la transformación y exagerar la sombra
    img3D.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    img3D.style.boxShadow = `${-rotateY/2}px ${-rotateX/2}px 30px rgba(0,0,0,0.3)`;
});

// Volver a la posición normal al quitar el mouse
foto3D.addEventListener('mouseleave', () => {
    img3D.style.transform = 'rotateX(0deg) rotateY(0deg)';
    img3D.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'; // Sombra normal
});

// --- Control del Splash Screen ---
window.addEventListener('load', () => {
    const splash = document.getElementById('splash-screen');
    
    // Le damos 2.5 segundos (lo que dura la animación de la barra)
    setTimeout(() => {
        splash.classList.add('hidden');
        
        // Lo eliminamos del DOM después de la transición para que no moleste
        setTimeout(() => {
            splash.remove();
        }, 600);
    }, 2500);
});