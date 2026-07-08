// ================================
// MUZICMANIA - NAVIGATION SYSTEM
// ================================

export class AdaptiveNav {
    static init() {
        this.checkZoom();
        this.setupMenu();
        window.addEventListener('resize', () => this.checkZoom());

        // Detectar recarga o navegación interna
        this.setupPageTransition();
    }
    static setupPageTransition() {
        // Crear icono flotante si no existe
        let icon = document.getElementById('transition-icon');
        if (!icon) {
            icon = document.createElement('div');
            icon.id = 'transition-icon';
            icon.className = 'transition-icon';
            document.body.appendChild(icon);
        }

        // Detectar navegación interna
        let isNavigation = false;
        document.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', (e) => {
                // Solo enlaces internos
                if (a.hostname === location.hostname && a.pathname !== location.pathname) {
                    isNavigation = true;
                    AdaptiveNav.showTransition('arrow');
                }
            });
        });

        // Detectar recarga (F5, Ctrl+R, etc.)
        window.addEventListener('beforeunload', (e) => {
            if (!isNavigation) {
                AdaptiveNav.showTransition('reload');
            }
            document.body.classList.add('page-transitioning');
        });

        // Al cargar, quitar transición después de breve tiempo
        if (document.readyState === 'loading') {
            window.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    document.body.classList.remove('page-transitioning');
                    AdaptiveNav.hideTransition();
                }, 900);
            });
        } else {
            setTimeout(() => {
                document.body.classList.remove('page-transitioning');
                AdaptiveNav.hideTransition();
            }, 900);
        }
    }

    static showTransition(type) {
        const icon = document.getElementById('transition-icon');
        if (!icon) return;

        // ROBUST: Inlined SVG paths to guarantee rendering
        // Better "Rotate/Refresh" icon (circular arrow)
        const refreshPath =
            '<path d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z" fill="currentColor"/>';
        const arrowPath =
            '<path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" fill="currentColor"/>';

        icon.innerHTML =
            type === 'reload'
                ? `<svg class="icon" viewBox="0 0 512 512" style="width: 1.5em; height: 1.5em; fill: currentColor;">${refreshPath}</svg>`
                : `<svg class="icon" viewBox="0 0 24 24" style="width: 1.5em; height: 1.5em; fill: currentColor;">${arrowPath}</svg>`;
        icon.classList.add('visible');
    }

    static hideTransition() {
        const icon = document.getElementById('transition-icon');
        if (icon) icon.classList.remove('visible');
    }

    static checkZoom() {
        const zoom = window.devicePixelRatio || 1;
        const warning = document.querySelector('.zoom-warning');
        if (warning) {
            // Safety check
            if (zoom > 1.25) warning.classList.add('visible');
            else warning.classList.remove('visible');
        }
    }

    static setupMenu() {
        document.addEventListener('click', (e) => {
            // 1. Botón de Menú (Toggle)
            const menuBtn = e.target.closest('.menu-toggle-btn');
            if (menuBtn) {
                this.toggleMenu();
                return;
            }

            // 2. Fondo o Botón Cerrar (Solo si el menú está activo)
            const backdrop = e.target.closest('.menu-backdrop');
            const closeBtn = e.target.closest('.close-menu-btn');

            if (backdrop || closeBtn) {
                this.toggleMenu(false);
            }
        });
    }

    static toggleMenu(show) {
        const backdrop = document.querySelector('.menu-backdrop');
        const overlay = document.querySelector('.nav-overlay');
        const menuBtn = document.querySelector('.menu-toggle-btn');

        if (!overlay || !backdrop) return;

        // Si no se define 'show', alternamos el estado actual
        const finalShow = typeof show === 'boolean' ? show : !overlay.classList.contains('active');

        // Toggle del botón
        if (menuBtn) {
            menuBtn.classList.toggle('active', finalShow);
        }

        if (finalShow) {
            backdrop.style.display = 'block';
            setTimeout(() => {
                backdrop.classList.add('active');
                overlay.classList.add('active');
            }, 10);
        } else {
            backdrop.classList.remove('active');
            overlay.classList.remove('active');

            // Reset language menu when closing
            setTimeout(() => {
                const sections = document.getElementById('main-menu-sections');
                const langList = document.getElementById('lang-menu-list');
                const btn = document.querySelector('.lang-toggle-btn');
                if (sections && langList) {
                    sections.style.display = 'block';
                    sections.classList.add('active');
                    langList.style.display = 'none';
                    langList.classList.remove('active');
                }
                if (btn) btn.classList.remove('active');

                if (!overlay.classList.contains('active')) {
                    backdrop.style.display = 'none';
                }
            }, 400);
        }
    }

    // === MÉTODOS DE SOPORTE PARA AUTH Y OVERFLOW ===
    static checkOverflow() {
        // Placeholder robusto para evitar crash si Auth lo llama
        console.log('AdaptiveNav: Verificando overflow (placeholder)');
    }

    static toggleAccessMenu() {
        const menu = document.getElementById('auth-quick-options');
        const btn = document.getElementById('btn-access-header');

        // Cerrar otros menús si es necesario
        this.toggleMenu(false); // Cerrar menú hamburguesa

        if (menu) {
            const isActive = menu.classList.toggle('active');
            // INLINED ICONS
            const closeIcon =
                '<svg class="icon" viewBox="0 0 24 24" style="width: 1em; height: 1em; fill: currentColor; vertical-align: middle;"><path d="M12.0007 10.5865L16.9504 5.63672L18.3646 7.05093L13.4149 12.0007L18.3646 16.9504L16.9504 18.3646L12.0007 13.4149L7.05093 18.3646L5.63672 16.9504L10.5865 12.0007L5.63672 7.05093L7.05093 5.63672L12.0007 10.5865Z"></path></svg>';
            const userIcon =
                '<svg class="icon" viewBox="0 0 24 24" style="width: 1em; height: 1em; fill: currentColor; vertical-align: middle;"><path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"></path></svg>';

            if (btn) {
                btn.innerHTML = isActive
                    ? `${closeIcon} <span class="btn-text">Cancelar</span>`
                    : `${userIcon} <span class="btn-text">Acceder</span>`;
                btn.classList.toggle('active', isActive);
            }
        }
    }

    static closeAccessMenu() {
        const menu = document.getElementById('auth-quick-options');
        const btn = document.getElementById('btn-access-header');
        const userIcon =
            '<svg class="icon" viewBox="0 0 24 24" style="width: 1em; height: 1em; fill: currentColor; vertical-align: middle;"><path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"></path></svg>';

        if (menu) menu.classList.remove('active');
        if (btn) {
            btn.innerHTML = `${userIcon} <span class="btn-text">Acceder</span>`;
            btn.classList.remove('active');
        }
    }
}

// Inicializar cuando el DOM esté listo
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            AdaptiveNav.init();
        });
    } else {
        AdaptiveNav.init();
    }
}

// Exportar globalmente para compatibilidad
if (typeof window !== 'undefined') {
    window.AdaptiveNav = AdaptiveNav;
}
