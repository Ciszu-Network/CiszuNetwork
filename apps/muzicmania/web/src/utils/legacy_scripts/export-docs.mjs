import fs from 'fs';
import path from 'path';
import { mdToPdf } from 'md-to-pdf';
import { markdownDocx, Packer } from '@jinzhongjia/markdown-docx';
import { Header, Footer, Paragraph, TextRun, AlignmentType, PageNumber } from 'docx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(__dirname, '../content/documents');
const ROOT_DIR = path.join(__dirname, '..');

// Helper to get formatted date YYYY_MM_DD
const getFormattedDate = () => {
    const d = new Date();
    return `${d.getFullYear()}_${String(d.getMonth() + 1).padStart(2, '0')}_${String(d.getDate()).padStart(2, '0')}`;
};

// Timeout wrapper for PDF conversion
const convertWithTimeout = async (task, timeoutMs, label) => {
    return Promise.race([
        task(),
        new Promise((_, reject) =>
            setTimeout(
                () => reject(new Error(`TIMEOUT: ${label} superó los ${timeoutMs / 1000}s`)),
                timeoutMs
            )
        ),
    ]);
};

async function exportDocs() {
    console.log('\n============================================================');
    console.log('🚀 MUZICMANIA EXPORT PROTOCOL V4.0 (NUCLEAR)');
    console.log('============================================================\n');

    // 1. Read Metadata
    let DOCS_METADATA = {};
    try {
        const managerPath = path.join(__dirname, 'docs-manager.mjs');
        if (fs.existsSync(managerPath)) {
            const managerContent = fs.readFileSync(managerPath, 'utf-8');
            const metaMatch = managerContent.match(/const DOCS_METADATA = ({[\s\S]+?});/);
            if (metaMatch) {
                DOCS_METADATA = new Function(`return ${metaMatch[1]}`)();
            }
        }
    } catch (e) {}

    if (!fs.existsSync(DOCS_DIR)) {
        fs.mkdirSync(DOCS_DIR, { recursive: true });
    } else {
        // Clean directory to prevent stale artifacts
        console.log('🧹 Limpiando directorio de documentos...');
        const existing = fs.readdirSync(DOCS_DIR);
        for (const f of existing) {
            if (['.pdf', '.docx', '.txt'].includes(path.extname(f))) {
                try {
                    // Only delete if NOT single file mode, or if it matches target
                    const targetDoc = process.argv[2];
                    if (!targetDoc || f.toLowerCase().includes(targetDoc.toLowerCase())) {
                        fs.unlinkSync(path.join(DOCS_DIR, f));
                    }
                } catch (e) {
                    console.warn(`Original file locked, skipping delete: ${f}`);
                }
            }
        }
    }

    // 2. Parse Arguments (Manual parsing to avoid dependencies)
    const args = process.argv.slice(2);
    let targetDoc = null;
    let targetFormats = ['txt', 'docx', 'pdf']; // Default all

    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--file=')) {
            targetDoc = args[i].split('=')[1];
            if (targetDoc === 'ALL') targetDoc = null;
        } else if (args[i].startsWith('--format=')) {
            const fmt = args[i].split('=')[1];
            if (fmt && fmt !== 'all') {
                targetFormats = fmt.split('_'); // e.g. 'txt_pdf' -> ['txt', 'pdf']
            }
        }
    }

    // 3. Identify Files
    let files = fs
        .readdirSync(ROOT_DIR)
        .filter(
            (file) =>
                file.endsWith('.md') &&
                file !== 'README.md' &&
                !file.startsWith('TO_DO') &&
                !file.startsWith('implementation_plan') &&
                !file.startsWith('task') &&
                !file.startsWith('walkthrough')
        );

    if (targetDoc) {
        console.log(`🎯 Modo Single-File: Procesando solo "${targetDoc}"`);
        files = files.filter((f) => f.toLowerCase().includes(targetDoc.toLowerCase()));
    } else {
        // If ALL processing, include README.md which is usually excluded above
        if (fs.existsSync(path.join(ROOT_DIR, 'README.md'))) {
            files.unshift('README.md');
        }
    }

    console.log(`📦 Encontrados ${files.length} documentos para procesar.`);
    console.log(`Formats: ${targetFormats.join(', ')}\n`);

    const timestamp = getFormattedDate();

    for (const [index, file] of files.entries()) {
        const docId = path.parse(file).name;
        const meta = DOCS_METADATA[docId] || { version: '1.0.0', lastUpdate: '2026-02-07' };
        const mdPath = path.join(ROOT_DIR, file);
        let mdContent = fs.readFileSync(mdPath, 'utf-8');

        console.log(`[${index + 1}/${files.length}] 📄 DOCUMENTO: ${docId}`);

        // A. Header Standardization & SANITIZATION
        mdContent = mdContent.replace(
            /^MUZICMANIA - DOCUMENTACIÓN OFICIAL[\s\S]+?------------------------------------------------------------\n\n/,
            ''
        );

        // Remove Script/Style but KEEP classes for CSS hiding (CRITICAL for Security PDF)
        let cleanMdContent = mdContent
            .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '') // Dangerous scripts
            .replace(/<link[\s\S]*?>/gi, '') // External sheets
            .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ''); // Inline styles

        // NUCLEAR OPTION FOR PDF: Strip ALL HTML tags (icons, spans, divs, etc.)
        const pdfSafeMd = cleanMdContent
            .replace(/<i[^>]*?>.*?<\/i>/gi, '') // Remove icon tags completely
            .replace(/<i[^>]*?\/>/gi, '') // Remove self-closing icon tags
            .replace(/<span[^>]*?>.*?<\/span>/gi, '') // Remove spans
            .replace(/<div[^>]*?>.*?<\/div>/gi, '') // Remove divs
            .replace(/<[^>]+>/g, ''); // Nuclear: remove ANY remaining HTML tag

        const professionalHeader = `MUZICMANIA - DOCUMENTACIÓN OFICIAL\nNombre: ${docId}\nVersión: ${meta.version}\nActualización: ${meta.lastUpdate}\nIdentificador: ${docId}_V${meta.version}_${timestamp}_muzicmania\n------------------------------------------------------------\n\n`;
        const professionalMd = professionalHeader + cleanMdContent;
        const professionalPdfMd = professionalHeader + pdfSafeMd; // Separate version for PDF

        try {
            fs.writeFileSync(mdPath, professionalMd);
            process.stdout.write('   ✅ MD ');
        } catch (e) {
            console.error('   ❌ MD Error:', e.message);
        }

        // B. Word Export (DOCX) - PROFESSIONAL ARIAL ENFORCEMENT
        if (targetFormats.includes('docx')) {
            try {
                process.stdout.write('⏳ WORD ');
                const docxPath = path.join(DOCS_DIR, `${docId}.docx`);

                // 1. Generate Base Document
                const doc = await markdownDocx(professionalMd, {
                    styles: {
                        paragraph: { font: 'Arial', size: 22 }, // 11pt
                        heading1: { font: 'Arial', size: 32, bold: true, color: '00d4ff' },
                        heading2: { font: 'Arial', size: 28, bold: true, color: '00d4ff' },
                        heading3: { font: 'Arial', size: 24, bold: true, color: '00d4ff' },
                        list: { font: 'Arial', size: 22 },
                    },
                });

                // 2. HARD FORCE: Modify Document internals
                if (doc.sections && doc.sections.length > 0) {
                    const header = new Header({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: 'MUZICMANIA OFFICIAL DOCS',
                                        font: 'Arial',
                                        size: 18,
                                        color: '888888',
                                    }),
                                    new TextRun({
                                        text: '\tVersion ' + meta.version,
                                        font: 'Arial',
                                        size: 18,
                                        color: '888888',
                                    }),
                                ],
                                tabStops: [{ type: 'right', position: 9000 }],
                            }),
                        ],
                    });

                    const footer = new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: `Page `, font: 'Arial', size: 16 }),
                                    PageNumber.CURRENT,
                                    new TextRun({ text: ` of `, font: 'Arial', size: 16 }),
                                    PageNumber.TOTAL_PAGES,
                                    new TextRun({
                                        text: ` | ID: ${docId}_V${meta.version}`,
                                        font: 'Arial',
                                        size: 14,
                                        color: 'AAAAAA',
                                    }),
                                ],
                            }),
                        ],
                    });

                    doc.sections[0].headers = { default: header };
                    doc.sections[0].footers = { default: footer };
                }

                const docxBuffer = await Packer.toBuffer(doc);
                fs.writeFileSync(docxPath, docxBuffer);
                process.stdout.write('✅ ');
            } catch (error) {
                process.stdout.write(`❌ Word: ${error.message} `);
            }
        }

        // C. PDF Export (NUCLEAR SANITIZATION)
        if (targetFormats.includes('pdf')) {
            try {
                process.stdout.write('⏳ PDF ');
                const pdfPath = path.join(DOCS_DIR, `${docId}.pdf`);

                const pdf = await convertWithTimeout(
                    () =>
                        mdToPdf(
                            { content: professionalPdfMd },
                            {
                                launch_options: {
                                    args: [
                                        '--no-sandbox',
                                        '--disable-setuid-sandbox',
                                        '--disable-dev-shm-usage',
                                    ],
                                },
                                pdf_options: {
                                    format: 'A4',
                                    margin: {
                                        top: '30mm',
                                        bottom: '30mm',
                                        left: '20mm',
                                        right: '20mm',
                                    },
                                    printBackground: true,
                                    displayHeaderFooter: true,
                                    headerTemplate: `
                            <div style="font-size: 9px; width: 100%; text-align: right; padding-right: 20mm; font-family: Arial; color: #666;">
                                Página <span class="pageNumber"></span> de <span class="totalPages"></span>
                            </div>`,
                                    footerTemplate: `
                            <div style="font-size: 9px; width: 100%; text-align: center; font-family: Arial; color: #999;">
                                © 2026 MUZICMANIA OFFICIAL DOCUMENTATION | All Rights Reserved | ID: ${docId}_V${meta.version}_${timestamp}_muzicmania
                            </div>`,
                                },
                                styles: `
                        body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #333; }
                        h1 { color: #00d4ff; border-bottom: 2px solid #00d4ff; padding-bottom: 8px; margin-bottom: 20px; text-transform: uppercase; }
                        h2, h3 { color: #00d4ff; margin-top: 25px; border-left: 4px solid #00d4ff; padding-left: 10px; }
                        p { text-align: justify; margin-bottom: 12px; }

                        /* NUCLEAR BLACKOUT - NO UI ALLOWED */
                        .debug-panel, .qa-btn, .quick-access-dock, #debug-window, .ui-artifact,
                        #debug-toggle, .debug-active, .debug-only, .qa-icon, .debug-controls,
                        .debug-card, #warning-debug, .stat-pill, .debug-top-row, .debug-warning-sub,
                        .ri-filled-flask, .ri-filled-robot, .ri-filled-terminal-box, .ri-filled-code,
                        .ri-filled-shield-star, .ri-filled-lock-2, .ri-filled-key-2, .ri-filled-admin-line,
                        header, footer:not(.doc-nav-footer), .nav-overlay, .menu-backdrop, .zoom-warning,
                        .sidebar-search, .sidebar-header, .docs-sidebar, .docs-info-panel,
                        .format-selector, .view-controls, .support-disclaimer,
                        [class*="debug"], [id*="debug"], [class*="qa-"], [id*="qa-"],
                        [class*="dock"], [id*="dock"], [id*="warning"], [class*="alert"],
                        i, [class*="icon-"], [class*="fa-"], [class*="ri-"], .material-icons {
                            display: none !important; opacity: 0 !important; visibility: hidden !important;
                            height: 0 !important; width: 0 !important; overflow: hidden !important;
                            position: absolute !important; left: -9999px !important;
                        }

                        @font-face { font-family: 'remixicon'; src: url('data:,') !important; }
                        @font-face { font-family: 'FontAwesome'; src: url('data:,') !important; }
                        @font-face { font-family: 'Material Icons'; src: url('data:,') !important; }

                        *::before, *::after {
                            content: none !important;
                            display: none !important;
                        }
                    `,
                            }
                        ),
                    60000,
                    `PDF ${docId}`
                );

                if (pdf) {
                    fs.writeFileSync(pdfPath, pdf.content);
                    process.stdout.write('✅ ');
                }
            } catch (error) {
                process.stdout.write(`❌ PDF: ${error.message} `);
            }
        }

        // D. TXT Export
        if (targetFormats.includes('txt')) {
            try {
                process.stdout.write('⏳ TXT ');
                const txtPath = path.join(DOCS_DIR, `${docId}.txt`);
                const txtContent = professionalMd
                    .replace(/^#+ /gm, '')
                    .replace(/\*\*([^*]+)\*\*/g, '$1')
                    .replace(
                        /---/g,
                        '------------------------------------------------------------'
                    );
                fs.writeFileSync(txtPath, txtContent);
                process.stdout.write('✅\n');
            } catch (error) {
                process.stdout.write(`❌ TXT: ${error.message}\n`);
            }
        }

        if (index < files.length - 1) {
            await new Promise((r) => setTimeout(r, 1000));
        }
    }

    console.log('\n============================================================');
    console.log('✨ PROTOCOLO FINALIZADO CON ÉXITO');
    console.log('============================================================\n');
}

exportDocs().catch((err) => {
    console.error('\n💥 ERROR CRÍTICO:', err.message);
    process.exit(1);
});
