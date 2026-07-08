/**
 * MUZICMANIA - Global Search System v1.0
 * Features site-wide indexing and smart redirection.
 */

export const SearchSystem = {
    // Database of searchable pages and keywords
    index: [
        {
            title: 'Inicio',
            url: 'index.html',
            keywords: ['home', 'empezar', 'novedades', 'estadisticas', 'bienvenido'],
            desc: 'Página principal con noticias y estadísticas.',
        },
        {
            title: 'Jugar Ahora',
            url: 'play.html',
            keywords: ['play', 'game', 'canciones', 'ritmo', 'mania', 'gameplay'],
            desc: 'Sección del juego con selección de canciones.',
        },
        {
            title: 'Leaderboard',
            url: 'leaderboard.html',
            keywords: ['ranking', 'mejores', 'puntuaciones', 'top', 'global'],
            desc: 'Tabla de clasificación mundial de MuzicMania.',
        },
        {
            title: 'Contacto y Soporte',
            url: 'contact.html',
            keywords: ['ayuda', 'soporte', 'staff', 'equipo', 'valoraciones'],
            desc: 'Formulario de contacto y soporte técnico.',
        },
        {
            title: 'Tu Perfil',
            url: 'profile.html',
            keywords: ['cuenta', 'user', 'records', 'ajustes', 'mis datos'],
            desc: 'Gestiona tu cuenta y revisa tus récords personales.',
        },
        {
            title: 'Términos y Condiciones',
            url: 'terms.html',
            keywords: ['reglas', 'privacidad', 'legal', 'normas'],
            desc: 'Información legal y normas de la comunidad.',
        },
        {
            title: 'Changelog',
            url: 'changelog.html',
            keywords: ['updates', 'parches', 'novedades', 'roadmap', 'versiones'],
            desc: 'Historial de actualizaciones y parches de MuzicMania.',
        },
        {
            title: 'Centro de Documentación',
            url: 'documentation.html',
            keywords: ['documentacion', 'guias', 'portal', 'manuales'],
            desc: 'Manuales y guías técnicas oficiales.',
        },
    ],

    init() {
        // Usar DELEGACIÓN DE EVENTOS para elementos dinámicos (inyectados por Layout.js)

        // 1. Click en botón de búsqueda
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.search-btn');
            if (btn) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleSearch();
                return;
            }

            // 2. Click fuera para cerrar (si no es wrapper ni input)
            if (
                !e.target.closest('.search-wrapper') &&
                !e.target.closest('.search-input-container')
            ) {
                this.closeSearch();
            }
        });

        // 3. Input de búsqueda (tiempo real)
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('search-input')) {
                this.performSearch(e.target.value.trim());
            }
        });

        // 4. Enter en input
        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('search-input') && e.key === 'Enter') {
                const resultsDropdown = document.querySelector('.search-results-dropdown');
                if (resultsDropdown) {
                    const firstResult = resultsDropdown.querySelector('.search-result-item');
                    if (firstResult) firstResult.click();
                }
            }
        });

        console.log('SearchSystem: Event delegation initialized');
    },

    toggleSearch() {
        const nav = document.getElementById('main-nav');
        const wrapper = document.querySelector('.search-wrapper');
        const searchBtn = document.querySelector('.search-btn');
        const input = document.querySelector('.search-input');

        if (!wrapper) return;

        // Toggle Local State
        const isActive = wrapper.classList.toggle('active');

        // Toggle Global State for Layout Adjustments
        if (nav) nav.classList.toggle('searching', isActive);

        // Update Button State
        if (searchBtn) searchBtn.classList.toggle('active', isActive);

        if (isActive) {
            setTimeout(() => {
                if (input) {
                    input.focus();
                    input.value = '';
                }
            }, 100);

            // Close other menus
            if (window.AdaptiveNav && window.AdaptiveNav.toggleMenu) {
                window.AdaptiveNav.toggleMenu(false);
            }
        } else {
            this.closeResults();
        }
    },

    closeSearch() {
        const nav = document.getElementById('main-nav');
        const wrapper = document.querySelector('.search-wrapper');
        const searchBtn = document.querySelector('.search-btn');

        if (wrapper) wrapper.classList.remove('active');
        if (nav) nav.classList.remove('searching');
        if (searchBtn) searchBtn.classList.remove('active');
        this.closeResults();
    },

    performSearch(query) {
        if (!query || query.length < 2) {
            this.closeResults();
            return;
        }

        const results = this.index.filter((item) => {
            const lowQuery = query.toLowerCase();
            return (
                item.title.toLowerCase().includes(lowQuery) ||
                item.keywords.some((k) => k.includes(lowQuery)) ||
                item.desc.toLowerCase().includes(lowQuery)
            );
        });

        this.renderResults(results, query);
    },

    renderResults(results, query) {
        const dropdown = document.querySelector('.search-results-dropdown');
        dropdown.innerHTML = '';

        const bp = window.Layout && window.Layout.basePath ? window.Layout.basePath : '';

        if (results.length === 0) {
            dropdown.innerHTML = `<div class="search-result-item" style="cursor: default;">
                <span class="search-result-title">No hay resultados para "${query}"</span>
            </div>`;
        } else {
            results.forEach((item) => {
                const div = document.createElement('div');
                div.className = 'search-result-item';
                div.innerHTML = `
                    <div class="search-result-title">${item.title}</div>
                    <div class="search-result-desc">${item.desc}</div>
                    <div class="search-result-count">${this.countMatches(item, query)} coincidencias</div>
                `;
                div.onclick = () => (window.location.href = bp + item.url);
                dropdown.appendChild(div);
            });
        }

        dropdown.classList.add('active');
    },

    countMatches(item, query) {
        const text = (item.title + ' ' + item.keywords.join(' ') + ' ' + item.desc).toLowerCase();
        const matches = text.split(query.toLowerCase()).length - 1;
        return matches > 0 ? matches : 1;
    },

    closeResults() {
        const dropdown = document.querySelector('.search-results-dropdown');
        if (dropdown) dropdown.classList.remove('active');
    },
};

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SearchSystem.init());
    } else {
        SearchSystem.init();
    }
}

// Exportar globalmente para compatibilidad
if (typeof window !== 'undefined') {
    window.SearchSystem = SearchSystem;
}
