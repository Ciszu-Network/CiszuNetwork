/**
 * MuzicMania Documentation Portal Manager
 * Handles dynamic loading, rendering, and metadata display for documentation files.
 */

export const DOCS_METADATA = {
    ACCOUNTS_IA: {
        title: 'Cuentas IA',
        description: 'Gestión y configuración de cuentas de Inteligencia Artificial.',
        icon: 'fa-filled-user-astronaut',
        category: 'ia',
        lastUpdate: '2026-02-08',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    CHAT_GPT_INTEGRATION: {
        title: 'Integración ChatGPT',
        description: 'Guía de implementación para la API de OpenAI.',
        icon: 'ri-filled-openai',
        category: 'ia',
        lastUpdate: '2026-02-08',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    CLAUDE_INTEGRATION: {
        title: 'Integración Claude',
        description: 'Conexión y uso de los modelos de Anthropic.',
        icon: 'fa-filled-robot',
        category: 'ia',
        lastUpdate: '2026-02-08',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    GEMINI_INTEGRATION: {
        title: 'Integración Gemini',
        description: 'Implementación del modelo multimodal de Google.',
        icon: 'fa-filled-brain',
        category: 'ia',
        lastUpdate: '2026-02-08',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    INITIAL_PROMPT: {
        title: 'Prompt Inicial',
        description: 'Configuración base y contexto para los agentes.',
        icon: 'fa-filled-terminal',
        category: 'ia',
        lastUpdate: '2026-02-08',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    ABOUT: {
        title: 'Sobre el Proyecto',
        description: 'La visión, valores y filosofía detrás de MuzicMania.',
        icon: 'ri-filled-information',
        category: 'info',
        lastUpdate: '2026-02-07',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    CHANGELOG: {
        title: 'Historial de Cambios',
        description: 'Registro detallado de actualizaciones y nuevas características.',
        icon: 'ri-filled-history',
        category: 'development',
        lastUpdate: '2026-02-07',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    CONTACT: {
        title: 'Contacto y Redes',
        description: 'Canales oficiales de soporte y redes sociales.',
        icon: 'ri-filled-customer-service',
        category: 'development',
        lastUpdate: '2026-02-07',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    CREDITS: {
        title: 'Créditos',
        description: 'El equipo y las mentes detrás de la plataforma.',
        icon: 'ri-filled-star',
        category: 'info',
        lastUpdate: '2026-02-07',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    FAQ: {
        title: 'Preguntas Frecuentes',
        description: 'Respuestas rápidas a las dudas más comunes.',
        icon: 'ri-filled-question',
        category: 'support',
        lastUpdate: '2026-02-07',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    GUIDELINES: {
        title: 'Directrices de Uso',
        description: 'Guía técnica para optimizar tu experiencia de juego.',
        icon: 'ri-filled-compass',
        category: 'support',
        lastUpdate: '2026-01-31',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    HELP: {
        title: 'Centro de Ayuda',
        description: 'Manuales y tutoriales para resolver problemas técnicos.',
        icon: 'ri-filled-question-answer',
        category: 'support',
        lastUpdate: '2026-02-07',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    LICENSE: {
        title: 'Licencia',
        description: 'Términos legales de uso del software y código abierto.',
        icon: 'ri-filled-file-paper-2',
        category: 'legal',
        lastUpdate: '2026-02-07',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    POLICY: {
        title: 'Privacidad',
        description: 'Cómo tratamos tus datos y protegemos tu seguridad.',
        icon: 'ri-filled-shield-user',
        category: 'legal',
        lastUpdate: '2026-01-31',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    RULES: {
        title: 'Reglas de Comunidad',
        description: 'Normas de conducta y fair play en la plataforma.',
        icon: 'fa-filled-list-check',
        category: 'legal',
        lastUpdate: '2026-01-31',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    SECURITY: {
        title: 'Seguridad',
        description: 'Protocolos de protección y reporte de vulnerabilidades.',
        icon: 'ri-filled-lock-2',
        category: 'legal',
        lastUpdate: '2026-02-07',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    TERMS_AND_CONDITIONS: {
        title: 'Términos y Condiciones',
        description: 'El contrato legal entre tú y MuzicMania.',
        icon: 'ri-filled-article',
        category: 'legal',
        lastUpdate: '2026-01-30',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    TEAM: {
        title: 'Nuestro Equipo',
        description: 'Conoce a los creadores y colaboradores.',
        icon: 'fa-filled-users',
        category: 'info',
        lastUpdate: '2026-02-07',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    SUPPORT: {
        title: 'Soporte Técnico',
        description: 'Canales directos para resolver incidencias.',
        icon: 'fa-filled-life-ring',
        category: 'support',
        lastUpdate: '2026-02-07',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    DOCUMENTATION: {
        title: 'Sobre la Documentación',
        description: 'Metadatos y estructura de este portal.',
        icon: 'fa-filled-book-open',
        category: 'info',
        lastUpdate: '2026-02-07',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    TO_DOO: {
        title: 'To Do List',
        description: 'Lista de tareas y mejoras pendientes.',
        icon: 'fa-filled-clipboard-list',
        category: 'ia',
        lastUpdate: '2026-02-08',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    USER_PERSONAS: {
        title: 'Personas de Usuario',
        description: 'Perfiles de usuario objetivo para el diseño.',
        icon: 'fa-filled-users',
        category: 'ia',
        lastUpdate: '2026-02-08',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    WORKFLOWS: {
        title: 'Flujos de Trabajo',
        description: ' Diagramas y procesos del sistema.',
        icon: 'fa-filled-diagram-project',
        category: 'ia',
        lastUpdate: '2026-02-08',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    PROJECT_STRUCTURE: {
        title: 'Estructura del Proyecto',
        description: 'Organización de carpetas y archivos.',
        icon: 'fa-filled-folder-tree',
        category: 'ia', // Assuming IA folder or core
        lastUpdate: '2026-02-08',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
    TECH_STACK: {
        title: 'Stack Tecnológico',
        description: 'Tecnologías y librerías utilizadas.',
        icon: 'fa-filled-code',
        category: 'ia',
        lastUpdate: '2026-02-08',
        author: 'Ciszuko Antony',
        version: '1.0.0',
    },
};

export class DocsManager {
    constructor() {
        this.currentDoc = null;
        this.currentFormat = 'md'; // md or txt
        this.init();
    }

    async init() {
        this.renderSidebar();

        // Listen for back/forward navigation
        window.onpopstate = (event) => {
            if (event.state && event.state.docId) {
                this.loadDocument(event.state.docId, false);
            } else {
                // Fix for "Back" button returning to initial state (null)
                // Re-read URL to sync UI
                const urlParams = new URLSearchParams(window.location.search);
                const docId = urlParams.get('doc') || 'ABOUT';
                this.loadDocument(docId, false);
            }
        };

        // Load initial document from URL or default to ABOUT
        const urlParams = new URLSearchParams(window.location.search);
        const docId = urlParams.get('doc') || 'ABOUT';
        this.loadDocument(docId);
    }

    getIcon(iconName) {
        // Fallback or default mapping if needed
        // Assuming iconName matches the ID in the sprite (e.g., "ri-filled-information")
        return `
            <svg class="icon" aria-hidden="true">
                <use href="content/icons/sprites/sprite-filled.svg#${iconName}"></use>
            </svg>
        `;
    }

    renderSidebar() {
        const sidebar = document.getElementById('docs-sidebar-nav');
        if (!sidebar) return;

        // User Request: "Lista en vez de secciones" (Flat List)
        let html = '<ul class="category-links flat-sidebar-list">';

        // Sort alphabetically
        const sortedKeys = Object.keys(DOCS_METADATA).sort();

        for (const docId of sortedKeys) {
            const meta = DOCS_METADATA[docId];

            // FILTER: Hide 'ia' category (User Request: "SOLO DOCUMENTOS PUBLICOS")
            if (meta.category === 'ia') continue;

            html += `<li>
                        <a href="#" class="doc-link" data-id="${docId}">
                            ${this.getIcon(meta.icon)}
                            <span>${meta.title}</span>
                        </a>
                     </li>`;
        }
        html += '</ul>';
        sidebar.innerHTML = html;

        // Add events
        sidebar.querySelectorAll('.doc-link').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default anchor jump
                // Handle click on icon, svg, or span (event bubbling)
                const target = e.currentTarget;
                this.loadDocument(target.dataset.id);
            });
        });
    }

    async loadDocument(docId, pushState = true) {
        if (!DOCS_METADATA[docId]) return;

        // Cache initialization
        if (!this.docCache) this.docCache = {};

        this.currentDoc = docId;
        const meta = DOCS_METADATA[docId];

        // Update UI
        document.querySelectorAll('.doc-link').forEach((l) => {
            l.classList.remove('active');
            l.style.background = 'transparent';
            l.style.color = 'var(--text-secondary)';
        });
        const activeLink = document.querySelector(`.doc-link[data-id="${docId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.style.background = 'rgba(0, 212, 255, 0.1)';
            activeLink.style.color = 'var(--neon-cyan)';
        }

        // Update Title and Info Panel
        document.getElementById('doc-display-title').innerHTML = `
            <svg class="icon" aria-hidden="true" style="margin-right: 15px; width: 2.2rem; height: 2.2rem;"><use href="content/icons/sprites/sprite-filled.svg#fa-filled-book"></use></svg>
            ${meta.title}
        `;
        document.getElementById('doc-desc').innerText = meta.description;
        document.getElementById('doc-last-update').innerText = meta.lastUpdate;
        document.getElementById('doc-author').innerText = meta.author;

        // Update Download Card Title (User Request)
        const downloadTitle = document.getElementById('download-card-title');
        if (downloadTitle) {
            downloadTitle.innerHTML = `
                <svg class="icon small" aria-hidden="true" style="margin-right: 8px;"><use href="content/icons/sprites/sprite-filled.svg#fa-filled-download"></use></svg>
                Descargar Documento (${docId})
            `;
        }

        // Update download links
        const docBaseDir = `content/documents/`;
        const rootDocBase = ``; // MD files are in root
        const now = new Date();
        const dateStr = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}`;
        const downloadName = (ext) => `${docId}_V${meta.version}_${dateStr}_muzicmania.${ext}`;

        const formatsList = document.getElementById('docs-formats-list');
        if (formatsList) {
            // User Request: "Agrega un icono de descarga en 'descargar' markdown..."
            // Icon IDs verified in sprite-filled.svg (fa-filled-* / ri-filled-*)
            formatsList.innerHTML = `
                <a href="${rootDocBase}${docId}.md" class="format-badge md" download="${downloadName('md')}">
                    <svg class="icon" aria-hidden="true" style="margin-right: 4px;"><use href="content/icons/sprites/sprite-filled.svg#fa-filled-arrow-down"></use></svg>
                    <svg class="icon" aria-hidden="true" style="margin-right: 8px;"><use href="content/icons/sprites/sprite-filled.svg#ri-filled-markdown"></use></svg> MARKDOWN
                </a>
                <a href="${docBaseDir}${docId}.txt" class="format-badge txt" download="${downloadName('txt')}">
                    <svg class="icon" aria-hidden="true" style="margin-right: 4px;"><use href="content/icons/sprites/sprite-filled.svg#fa-filled-arrow-down"></use></svg>
                    <svg class="icon" aria-hidden="true" style="margin-right: 8px;"><use href="content/icons/sprites/sprite-filled.svg#fa-filled-file-lines"></use></svg> TEXTO
                </a>
                <a href="${docBaseDir}${docId}.pdf" class="format-badge pdf" download="${downloadName('pdf')}">
                    <svg class="icon" aria-hidden="true" style="margin-right: 4px;"><use href="content/icons/sprites/sprite-filled.svg#fa-filled-arrow-down"></use></svg>
                    <svg class="icon" aria-hidden="true" style="margin-right: 8px;"><use href="content/icons/sprites/sprite-filled.svg#fa-filled-file-pdf"></use></svg> PDF
                </a>
                <a href="${docBaseDir}${docId}.docx" class="format-badge word" download="${downloadName('docx')}">
                    <svg class="icon" aria-hidden="true" style="margin-right: 4px;"><use href="content/icons/sprites/sprite-filled.svg#fa-filled-arrow-down"></use></svg>
                    <svg class="icon" aria-hidden="true" style="margin-right: 8px;"><use href="content/icons/sprites/sprite-filled.svg#fa-filled-file-word"></use></svg> WORD
                </a>
            `;

            // Re-bind click to force protocol naming on some browsers if needed
            formatsList.querySelectorAll('a').forEach((a) => {
                a.onclick = (e) => {
                    if (
                        window.Layout &&
                        typeof window.Layout.showDevelopmentWarning === 'function'
                    ) {
                        window.Layout.showDevelopmentWarning(
                            `Descargando: ${a.getAttribute('download')}`
                        );
                    }
                };
            });
        }

        try {
            const filePath =
                this.currentFormat === 'md' ? `${docId}.md` : `content/documents/${docId}.txt`;

            // Check Cache
            if (this.docCache[filePath]) {
                this.renderContent(this.docCache[filePath]);
            } else {
                const response = await fetch(filePath);
                if (!response.ok) throw new Error('File not found');
                const content = await response.text();

                // Save to Cache
                this.docCache[filePath] = content;
                this.renderContent(content);
            }

            if (pushState) {
                const newUrl = window.location.pathname + '?doc=' + docId;
                window.history.pushState({ docId }, '', newUrl);
            }

            // Fix FOV/Position Jump: Reset Scroll to Top - REMOVED per user request
            // window.scrollTo({ top: 0, behavior: 'auto' });
        } catch (error) {
            console.error('Error loading document:', error);
            document.getElementById('doc-content-body').innerHTML =
                `<div class="error-msg">Error cargando el documento. Por favor intenta de nuevo.</div>`;
        }
    }

    renderContent(content) {
        const body = document.getElementById('doc-content-body');
        if (!body) return;

        if (this.currentFormat === 'md') {
            // Very simple MD renderer (bold, titles, lists)
            let html = content
                .replace(/^# (.*$)/gim, '') // Remove H1 from body (already in portal header)
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^\- (.*$)/gim, '<li>$1</li>')
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/\n\n/g, '<br>')
                .replace(/^---+$|^___+$/gm, '<hr>'); // Correct HR regex (full line of dashes)

            body.innerHTML = `<div class="md-view">${html}</div>`;
        } else {
            body.innerHTML = `<pre class="txt-view">${content}</pre>`;
        }
    }

    setFormat(format) {
        if (this.currentFormat === format) return;
        this.currentFormat = format;

        // Update buttons UI
        const buttons = document.querySelectorAll('.format-selector button');
        buttons.forEach((btn) => {
            btn.classList.toggle('active', btn.innerText.toLowerCase() === format);
        });

        if (this.currentDoc) {
            this.loadDocument(this.currentDoc, false);
        }
    }

    searchDocs(query) {
        const q = query.toLowerCase().trim();
        const links = document.querySelectorAll('.doc-link');

        links.forEach((link) => {
            const id = link.dataset.id.toLowerCase();
            const text = link.innerText.toLowerCase();
            const parentLi = link.closest('li');

            if (id.includes(q) || text.includes(q)) {
                if (parentLi) {
                    parentLi.style.display = 'block'; // FIX 4: Revertido a block para compatibilidad flex
                    // parentLi.style.listStyleType = 'none'; // No necesario en block
                }
                link.style.display = 'flex';
            } else {
                if (parentLi) parentLi.style.display = 'none';
                link.style.display = 'none';
            }
        });
    }

    navigate(direction) {
        // Filter keys to only include public docs (exclude 'ia')
        const keys = Object.keys(DOCS_METADATA)
            .filter((key) => DOCS_METADATA[key].category !== 'ia')
            .sort();

        const currentIndex = keys.indexOf(this.currentDoc);
        if (currentIndex === -1) return; // Current doc might be private or invalid

        let nextIndex;

        if (direction === 'next') {
            nextIndex = (currentIndex + 1) % keys.length;
        } else {
            nextIndex = (currentIndex - 1 + keys.length) % keys.length;
        }

        this.loadDocument(keys[nextIndex]);
    }

    static exportToPDF(docId) {
        if (window.Layout && typeof window.Layout.showDevelopmentWarning === 'function') {
            window.Layout.showDevelopmentWarning('Exportación PDF (Bilingüe)');
        }
        window.print();
    }

    static exportToWord(docId) {
        if (window.Layout && typeof window.Layout.showDevelopmentWarning === 'function') {
            window.Layout.showDevelopmentWarning('MS Word (Bilingüe)');
        }
    }

    // FIX 6: Funciones para exportación por formato específico
    exportToZIP() {
        this.exportAll(); // Reutilizar lógica existente (ya exporta como ZIP)
    }

    exportToRAR() {
        if (window.Layout && typeof window.Layout.showDevelopmentWarning === 'function') {
            window.Layout.showDevelopmentWarning(
                'Generando ZIP compatible (RAR no soportado en navegador)...'
            );
        }
        this.exportAll(); // Entregar ZIP como fallback funcional
    }

    exportTo7ZIP() {
        if (window.Layout && typeof window.Layout.showDevelopmentWarning === 'function') {
            window.Layout.showDevelopmentWarning(
                'Generando ZIP compatible (7z no soportado en navegador)...'
            );
        }
        this.exportAll(); // Entregar ZIP como fallback funcional
    }

    async exportAll() {
        if (!window.JSZip) {
            console.error('JSZip not loaded');
            return;
        }

        const zip = new JSZip();
        const docsFolder = zip.folder('MuzicMania_Docs');

        if (window.Layout && typeof window.Layout.showDevelopmentWarning === 'function') {
            window.Layout.showDevelopmentWarning('Generando paquete ZIP completo...');
        }

        const formats = ['md', 'txt', 'pdf', 'docx'];
        const now = new Date();
        const dateStr = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}`;

        // Dynamic Package Name logic
        const docId = this.currentDoc || 'FULL';
        const meta = DOCS_METADATA[docId] || { version: '1.0.0' };
        const fmtsStr = formats.join('-').toUpperCase();
        const zipName = `MUZICMANIA_DOCS_${docId}_V${meta.version}_${fmtsStr}_${dateStr}`;
        const finalDownloadName = `${zipName}.zip`;

        let manifestContent = `MUZICMANIA - MANIFIESTO DE DOCUMENTACIÓN\n`;
        manifestContent += `Paquete: ${zipName}\n`;
        manifestContent += `Fecha: ${now.toISOString()}\n\n`;
        manifestContent += `CONTENIDO:\n`;

        for (const id of Object.keys(DOCS_METADATA)) {
            // FILTER: Skip private/IA docs in export
            if (DOCS_METADATA[id].category === 'ia') continue;

            let addedDoc = false;
            for (const fmt of formats) {
                try {
                    const path = fmt === 'md' ? `${id}.md` : `content/documents/${id}.${fmt}`;
                    const res = await fetch(path);
                    if (res.ok) {
                        const blob = await res.blob();
                        docsFolder.file(`${id}.${fmt}`, blob);
                        addedDoc = true;
                    }
                } catch (e) {
                    console.warn(`Could not add ${id}.${fmt} to zip:`, e);
                }
            }
            if (addedDoc) {
                const m = DOCS_METADATA[id];
                manifestContent += `- ${id} (V${m.version}) - ${m.title}\n`;
            }
        }

        // Add Manifest
        zip.file(`${zipName}.txt`, manifestContent);

        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = finalDownloadName;
        link.click();
    }
}

// Global initialization and event binding
document.addEventListener('DOMContentLoaded', () => {
    window.DocPortal = new DocsManager();

    // Bind Search
    const searchInput = document.getElementById('docs-local-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => DocPortal.searchDocs(e.target.value));
    }

    // Bind Navigation Buttons (Using specific classes)
    const prevBtn = document.querySelector('.nav-prev');
    const nextBtn = document.querySelector('.nav-next');

    if (prevBtn) prevBtn.addEventListener('click', () => DocPortal.navigate('prev'));
    if (nextBtn) nextBtn.addEventListener('click', () => DocPortal.navigate('next'));
});
