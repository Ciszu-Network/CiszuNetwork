// ================================
// MUZICMANIA - AUTHENTICATION SYSTEM
// ================================

function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

export class AuthSystem {
    static init() {
        this.checkLoginStatus();
        this.setupEventListeners();
        // Check access for game page
        this.checkAccess();
    }

    static checkAccess() {
        // Verificar si warningShown ya está en sessionStorage
        const warningShown = sessionStorage.getItem('guestWarningShown') === 'true';

        // Si estamos en play.html y no se ha mostrado la advertencia
        if (
            window.location.pathname.includes('play.html') &&
            !warningShown &&
            !this.getCurrentUser()
        ) {
            this.showGuestWarning();
            return false;
        }
        return true;
    }

    static checkLoginStatus() {
        this.updateUI();
    }

    static getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    static getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    // --- Guest Warning ---
    static showGuestWarning() {
        if (document.getElementById('guest-warning-modal')) return;

        const modalHTML = `
            <div id="guest-warning-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                <div style="background: rgba(10, 10, 25, 0.95); padding: 1.5rem; border-radius: 15px; border: 2px solid var(--neon-pink); max-width: 480px; width: 90%; text-align: center; box-shadow: 0 0 30px rgba(255, 0, 128, 0.3); position: relative;">

                    <button onclick="AuthSystem.handleGuestPlay()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; color: #888; font-size: 1.5rem; cursor: pointer; transition: color 0.3s;">&times;</button>

                    <h2 style="color: var(--neon-pink); font-family: var(--font-header); margin-bottom: 1rem; font-size: 1.8rem; text-transform: uppercase;">⚠ MODO INVITADO ⚠</h2>

                    <div style="background: rgba(255, 0, 128, 0.05); padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem; border: 1px solid rgba(255, 0, 128, 0.2);">
                        <p style="color: #fff; margin-bottom: 0.5rem; font-size: 1rem;">Estás jugando sin iniciar sesión.</p>
                        <ul style="list-style: none; padding: 0; color: #ccc; font-size: 0.95rem; text-align: left; display: inline-block;">
                            <li style="margin-bottom: 0.3rem;">❌ Tus puntuaciones NO se guardarán en el Leaderboard.</li>
                            <li style="margin-bottom: 0.3rem;">❌ No mantendrás un historial de partidas.</li>
                            <li>❌ El progreso se perderá al cerrar.</li>
                        </ul>
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button onclick="AuthSystem.openModal('register')" class="btn" style="font-size: 1rem; padding: 0.8rem 1.5rem; background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));">REGISTRARSE / LOGIN</button>
                        <button onclick="AuthSystem.handleGuestPlay()" class="btn" style="font-size: 1rem; padding: 0.8rem 1.5rem; background: transparent; border: 1px solid #666; color: #ccc;">ENTENDIDO, JUGAR</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    static handleGuestPlay() {
        sessionStorage.setItem('guestWarningShown', 'true');
        this.closeGuestWarning();
    }

    static closeGuestWarning() {
        const modal = document.getElementById('guest-warning-modal');
        if (modal) modal.remove();
    }

    // --- Authentication Core ---
    static register(displayName, rawUsername, email, password) {
        // 1. Sanitización de Username (@ + minúsculas)
        const cleanUsername = rawUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
        const finalUsername = '@' + cleanUsername;

        if (cleanUsername.length < 3) {
            if (window.Layout && typeof window.Layout.showNotification === 'function') {
                window.Layout.showNotification(
                    'ERROR DE VALIDACIÓN',
                    'El nombre de usuario debe tener al menos 3 caracteres alfanuméricos.',
                    'fa-filled-triangle-exclamation'
                );
            }
            return false;
        }

        const users = this.getUsers();

        // 2. Verificaciones de unicidad
        if (users.find((u) => u.username === finalUsername)) {
            if (window.Layout && typeof window.Layout.showNotification === 'function') {
                window.Layout.showNotification(
                    'ERROR DE REGISTRO',
                    'Este nombre de usuario ya está ocupado.',
                    'fa-filled-user-xmark'
                );
            }
            return false;
        }
        if (users.find((u) => u.email === email)) {
            if (window.Layout && typeof window.Layout.showNotification === 'function') {
                window.Layout.showNotification(
                    'ERROR DE REGISTRO',
                    'Este correo electrónico ya está registrado.',
                    'fa-filled-envelope-open-text'
                );
            }
            return false;
        }

        // 3. Creación del usuario
        const newUser = {
            displayName: displayName, // Nombre flexible (Mayusc, espacios)
            username: finalUsername, // ID único
            email: email,
            password: password,
            highScore: 0,
            accuracy: 0,
            gamesPlayed: 0,
            maxCombo: 0,
            playTime: 0, // total segundos
            createdAt: new Date().toISOString(),
            lastUsernameChange: new Date().toISOString(), // Cooldown tracker
            isBot: false,
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        this.login(finalUsername, password); // Auto-login
        return true;
    }

    static login(identifier, password) {
        const users = this.getUsers();
        // Permitir login con Email O Username
        const user = users.find(
            (u) =>
                (u.email === identifier ||
                    u.username === identifier ||
                    u.username === '@' + identifier) &&
                u.password === password
        );

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateUI();

            // Cerrar modales si existen
            this.closeModal('login');
            this.closeModal('register');

            // Si estaba en warning de invitado, cerrarlo también
            this.closeGuestWarning();

            if (window.Layout && typeof window.Layout.showNotification === 'function') {
                window.Layout.showNotification(
                    '¡BIENVENIDO!',
                    `Bienvenido de nuevo, ${user.displayName}!`,
                    'fa-filled-user-check'
                );
            }

            // Recargar si estamos en perfil para actualizar datos
            if (window.location.pathname.includes('profile.html')) window.location.reload();
            return true;
        } else {
            if (window.Layout && typeof window.Layout.showNotification === 'function') {
                window.Layout.showNotification(
                    'ACCESO DENEGADO',
                    'Credenciales incorrectas.',
                    'fa-filled-shield-halved'
                );
            }
            return false;
        }
    }

    static logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    static updateUserScore(newScore, accuracy, sessionCombo = 0, sessionDuration = 0) {
        let user = this.getCurrentUser();
        if (!user) return;

        // Actualizar datos en memoria
        user.gamesPlayed++;
        user.playTime = (user.playTime || 0) + sessionDuration;

        // Promedio acumulativo simple para accuracy
        user.accuracy = Math.round(
            (user.accuracy * (user.gamesPlayed - 1) + accuracy) / user.gamesPlayed
        );

        if (newScore > user.highScore) {
            user.highScore = newScore;
        }

        if (sessionCombo > (user.maxCombo || 0)) {
            user.maxCombo = sessionCombo;
        }

        // Guardar en currentUser
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Actualizar en la lista general de usuarios (BD)
        const users = this.getUsers();
        const index = users.findIndex((u) => u.username === user.username);
        if (index !== -1) {
            users[index] = user;
            localStorage.setItem('users', JSON.stringify(users));
        }

        // Actualizar Leaderboard Global
        this.updateLeaderboard(user);
    }

    static updateLeaderboard(user) {
        let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

        // Quitar entrada antigua del usuario si existe
        leaderboard = leaderboard.filter((u) => u.username !== user.username);

        // Añadir usuario actualizado
        leaderboard.push(user);

        // Ordenar por High Score desc
        leaderboard.sort((a, b) => b.highScore - a.highScore);

        // Trim leaderboard to top 100 maybe?
        if (leaderboard.length > 100) leaderboard = leaderboard.slice(0, 100);

        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }

    static getLeaderboard() {
        return JSON.parse(localStorage.getItem('leaderboard')) || [];
    }

    // --- UI Management ---
    static updateUI() {
        // Buscar contenedores de Auth en Headers (puede haber en varias páginas)
        const authSections = document.querySelectorAll('#auth-section');
        const user = this.getCurrentUser();

        authSections.forEach((section) => {
            if (user) {
                // Vista Logueado
                section.innerHTML = `
                    <div class="user-profile-preview" style="display: flex; align-items: center; gap: 10px; cursor: pointer;" onclick="window.location.href='profile.html'">
                        <div class="profile-icon">
                            <span class="user-initials">${escapeHtml(user.displayName.substring(0, 2).toUpperCase())}</span>
                        </div>
                        <div style="display: flex; flex-direction: column; line-height: 1.1;">
                            <span style="color: var(--neon-cyan); font-weight: bold; font-size: 1rem;">${escapeHtml(user.displayName)}</span>
                            <span style="color: #666; font-size: 0.8rem;">${escapeHtml(user.username)}</span>
                        </div>
                        <button onclick="event.stopPropagation(); AuthSystem.logout()" class="logout-btn" style="margin-left: 10px; font-size: 0.8rem;">
                            ${typeof window.ICONS_LIB !== 'undefined' ? window.ICONS_LIB.get(window.ICONS_LIB.logout, window.Layout?.basePath || '') : '<i class="fas fa-sign-out-alt"></i>'}
                        </button>
                    </div>
                `;
            } else {
                // Vista Deslogueado - UNIFICADA PARA TODAS LAS PÁGINAS
                section.innerHTML = `
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <div id="auth-quick-options" class="auth-quick-options">
                            <button class="btn-small" onclick="AuthSystem.openModal('login')">${typeof window.ICONS_LIB !== 'undefined' ? window.ICONS_LIB.get(window.ICONS_LIB.login, window.Layout?.basePath || '') : '<i class="fas fa-sign-in-alt"></i>'} Ingresar</button>
                            <button class="btn-small btn-highlight" onclick="AuthSystem.openModal('register')">${typeof window.ICONS_LIB !== 'undefined' ? window.ICONS_LIB.get(window.ICONS_LIB.user_add, window.Layout?.basePath || '') : '<i class="fas fa-user-plus"></i>'} Registrarse</button>
                        </div>
                        <button id="btn-access-header" class="btn-access" onclick="AdaptiveNav.toggleAccessMenu()">
                            ${typeof window.ICONS_LIB !== 'undefined' ? window.ICONS_LIB.get(window.ICONS_LIB.user, window.Layout?.basePath || '') : '<i class="fas fa-user-circle"></i>'} <span class="btn-text">Acceder</span>
                        </button>
                    </div>
                `;
            }
        });

        // Re-calcular desbordamiento después de actualizar el perfil
        if (window.AdaptiveNav) {
            setTimeout(() => window.AdaptiveNav.checkOverflow(), 0);
        }
    }

    // Manejo de Modales
    static openModal(type) {
        const modalId = type === 'login' ? 'modal-login' : 'modal-register';
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'flex';
    }

    static closeModal(type) {
        if (!type) {
            // Close all if no type specified
            const login = document.getElementById('modal-login');
            const register = document.getElementById('modal-register');
            if (login) login.style.display = 'none';
            if (register) register.style.display = 'none';
            return;
        }
        const modalId = type === 'login' ? 'modal-login' : 'modal-register';
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    }

    static setupEventListeners() {
        // Fake Recaptcha Logic
        window.toggleRecaptcha = function (element) {
            element.classList.toggle('checked');
            const checkbox = element.querySelector('.recaptcha-checkbox');
            if (element.classList.contains('checked')) {
                checkbox.innerHTML = '✔';
            } else {
                checkbox.innerHTML = '';
            }
        };

        // Cerrar modales al hacer click fuera
        window.onclick = function (event) {
            if (event.target.classList.contains('modal-overlay')) {
                event.target.style.display = 'none';
            }
        };
    }
}

// Inicializar al cargar
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        AuthSystem.init();
    });
}

// Exportar globalmente para compatibilidad
if (typeof window !== 'undefined') {
    window.AuthSystem = AuthSystem;
}
