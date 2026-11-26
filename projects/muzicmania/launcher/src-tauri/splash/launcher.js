const $ = (id) => document.getElementById(id);
const BUILD = window.MUZIC_BUILD || { launcherVersion: '2.3.2', gameVersion: '2.1.1', channel: 'beta', buildDate: 'unknown', changelogUrl: '' };
const API_BASE = 'https://muzicmania.vercel.app';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const state = {
  boot: null,
  settings: null,
  session: null,
  online: false,
  forcedOffline: false,
  update: null,
  policy: null,
  updateFromBoot: false,
  loginPoll: null,
  tutorialIndex: 0,
  pendingLink: '',
  updating: false,
  autoApplying: false,
  pendingLanguage: null,
};

const LANGUAGES = [
  { code: '1033', label: 'English', flag: 'flags/gb.svg' },
  { code: '1034', label: 'Español', flag: 'flags/es.svg' },
  { code: '2052', label: '简体中文', flag: 'flags/cn.svg' },
  { code: '1028', label: '繁體中文', flag: 'flags/tw.svg' },
  { code: '1046', label: 'Português (Brasil)', flag: 'flags/pt.svg' },
  { code: '1051', label: 'Русский', flag: 'flags/ru.svg' },
  { code: '1041', label: '日本語', flag: 'flags/jp.svg' },
  { code: '1050', label: '한국어', flag: 'flags/kr.svg' },
  { code: '1036', label: 'Français', flag: 'flags/fr.svg' },
  { code: '1031', label: 'Deutsch', flag: 'flags/de.svg' },
  { code: '1040', label: 'Italiano', flag: 'flags/it.svg' },
  { code: '1043', label: 'Nederlands', flag: 'flags/nl.svg' },
  { code: '1045', label: 'Polski', flag: 'flags/pl.svg' },
  { code: '1025', label: 'العربية', flag: 'flags/sa.svg' },
  { code: '1055', label: 'Türkçe', flag: 'flags/tr.svg' },
  { code: '1029', label: 'Čeština', flag: 'flags/cz.svg' },
  { code: '1038', label: 'Magyar', flag: 'flags/hu.svg' },
  { code: '1053', label: 'Svenska', flag: 'flags/se.svg' },
];

const I18N = {
  es: {
    settings: 'Configuración',
    playOnline: 'Jugar online',
    playOffline: 'Jugar offline',
    retry: 'Reintentar conexión',
    refresh: 'Actualizar estado',
    onlineUnavailable: 'Online no disponible',
    online: 'Online',
    offline: 'Offline',
    checking: 'Comprobando',
    account: 'Cuenta',
    launcher: 'Launcher',
    community: 'Comunidad',
    helpPages: 'Ayuda y páginas',
    session: 'Estado de la sesión',
    accountLogin: 'Iniciar sesión',
    accountProfile: 'Mi cuenta',
    accountLogout: 'Cerrar sesión',
    launcherSub: 'Idioma, inicio con Windows, actualizaciones y comportamiento al cerrar.',
    openSettings: 'Abrir configuración',
    support: 'Soporte',
    changelog: 'Changelog',
    download: 'Descargar',
    ciszuNetwork: 'Ciszu Network',
    welcomeFirst: 'BIENVENIDO A MUZICMANIA',
    welcomeBack: 'BIENVENIDO DE VUELTA',
    welcomeFirstText: 'Parece que es tu primera vez. Este es tu hub: aquí actualizas, entras con CISZU ID y eliges online u offline.',
    welcomeBackText: 'Hola de nuevo, {name}. Elige cómo quieres entrar al juego.',
    guest: 'Invitado',
    sessionLocalOnline: 'Sesión local · inicia sesión cuando quieras',
    sessionLocalOffline: 'Sesión local offline',
    sessionCiszu: '@{username} · CISZU ID',
    disclaimerOnline: 'Conexión disponible. El modo online sincroniza tu cuenta; el offline usa las pistas locales.',
    disclaimerOffline: 'Sin conexión con el servicio. El modo offline está disponible y no requiere internet.',
    sessionNoteGuest: 'Invitado local. No hay cuenta online vinculada.',
    sessionNote: 'Sesión recordada: @{username}.',
    connectionChecked: 'La conexión se comprueba al iniciar.',
    madeBy: 'Hecho por',
    rights: 'MIT License',
    closeEyebrow: 'CERRAR MUZICMANIA',
    closeTitle: '¿Cerrar el launcher?',
    closeDesc: 'MuzicMania puede seguir en segundo plano desde la bandeja del sistema, lista para abrir el juego. Si eliges cerrar completamente, se detendrán la sesión y las comprobaciones.',
    closeRemember: 'Recordar mi elección',
    closeCancel: 'Cancelar',
    closeBackground: 'Mantener en segundo plano',
    closeExit: 'Cerrar completamente',
    closeNote: 'La bandeja permite abrir MuzicMania, ver información o salir definitivamente.',
    linkEyebrow: 'ENLACE EXTERNO',
    linkTitle: 'Salir de MuzicMania',
    linkDesc: 'Se abrirá un enlace externo en tu navegador.',
    openLink: 'Abrir enlace',
    settingsEyebrow: 'CONFIGURACIÓN',
    settingsTitle: 'Opciones del launcher',
    settingsDesc: 'Las preferencias se guardan localmente. El idioma se aplica al reiniciar; el resto se aplica al instante.',
    languageLabel: 'Idioma',
    startWithWindows: 'Iniciar con Windows',
    closeBehavior: 'Al cerrar',
    closeAsk: 'Preguntar siempre',
    closeBackgroundOpt: 'Mantener en segundo plano',
    closeExitOpt: 'Cerrar completamente',
    autoUpdate: 'Actualizaciones automáticas',
    confirmLinks: 'Confirmar enlaces externos',
    actions: 'Acciones',
    checkUpdate: 'Buscar actualización',
    pinTaskbar: 'Anclar a taskbar',
    restartLauncher: 'Reiniciar launcher',
    help: 'Ayuda',
    save: 'Guardar',
    closeAction: 'Cerrar',
    startEnabled: 'Inicio con Windows activado.',
    startDisabled: 'Inicio con Windows desactivado.',
    languageRestartEyebrow: 'IDIOMA',
    languageRestartTitle: 'Reinicia el launcher',
    languageRestartDesc: 'El idioma se aplica al reiniciar. Puedes reiniciar ahora, cancelar el cambio o continuar con el idioma seleccionado; continuar sin reiniciar no es recomendable.',
    languageRestartNow: 'Reiniciar ahora',
    languageRestartContinue: 'Continuar sin reiniciar',
    languageRestartCancel: 'Cancelar cambio',
    languageRestartToast: 'Idioma aplicado sin reiniciar. Reinicia el launcher para completar la traducción.',
  },
  en: {
    settings: 'Settings',
    playOnline: 'Play online',
    playOffline: 'Play offline',
    retry: 'Retry connection',
    refresh: 'Refresh status',
    onlineUnavailable: 'Online unavailable',
    online: 'Online',
    offline: 'Offline',
    checking: 'Checking',
    account: 'Account',
    launcher: 'Launcher',
    community: 'Community',
    helpPages: 'Help & pages',
    session: 'Session status',
    accountLogin: 'Sign in',
    accountProfile: 'My account',
    accountLogout: 'Sign out',
    launcherSub: 'Language, start with Windows, updates and close behavior.',
    openSettings: 'Open settings',
    support: 'Support',
    changelog: 'Changelog',
    download: 'Download',
    ciszuNetwork: 'Ciszu Network',
    welcomeFirst: 'WELCOME TO MUZICMANIA',
    welcomeBack: 'WELCOME BACK',
    welcomeFirstText: 'Looks like your first time. This is your hub: updates, CISZU ID login and online/offline play.',
    welcomeBackText: 'Welcome back, {name}. Choose how you want to enter the game.',
    guest: 'Guest',
    sessionLocalOnline: 'Local session · sign in whenever you want',
    sessionLocalOffline: 'Offline local session',
    sessionCiszu: '@{username} · CISZU ID',
    disclaimerOnline: 'Connection available. Online mode syncs your account; offline uses local tracks.',
    disclaimerOffline: 'No connection to the service. Offline mode is available and does not require internet.',
    sessionNoteGuest: 'Local guest. No online account linked.',
    sessionNote: 'Remembered session: @{username}.',
    connectionChecked: 'Connection is checked on startup.',
    madeBy: 'Made by',
    rights: 'MIT License',
    closeEyebrow: 'CLOSE MUZICMANIA',
    closeTitle: 'Close the launcher?',
    closeDesc: 'MuzicMania can keep running in the background from the system tray, ready to open the game. If you choose to close completely, the session and checks will stop.',
    closeRemember: 'Remember my choice',
    closeCancel: 'Cancel',
    closeBackground: 'Keep in background',
    closeExit: 'Close completely',
    closeNote: 'The tray lets you open MuzicMania, view information or exit completely.',
    linkEyebrow: 'EXTERNAL LINK',
    linkTitle: 'Leaving MuzicMania',
    linkDesc: 'An external link will open in your browser.',
    openLink: 'Open link',
    settingsEyebrow: 'SETTINGS',
    settingsTitle: 'Launcher options',
    settingsDesc: 'Preferences are saved locally. The language is applied on restart; the rest apply immediately.',
    languageLabel: 'Language',
    startWithWindows: 'Start with Windows',
    closeBehavior: 'When closing',
    closeAsk: 'Always ask',
    closeBackgroundOpt: 'Keep in background',
    closeExitOpt: 'Close completely',
    autoUpdate: 'Automatic updates',
    confirmLinks: 'Confirm external links',
    actions: 'Actions',
    checkUpdate: 'Check for updates',
    pinTaskbar: 'Pin to taskbar',
    restartLauncher: 'Restart launcher',
    help: 'Help',
    save: 'Save',
    closeAction: 'Close',
    startEnabled: 'Start with Windows enabled.',
    startDisabled: 'Start with Windows disabled.',
    languageRestartEyebrow: 'LANGUAGE',
    languageRestartTitle: 'Restart the launcher',
    languageRestartDesc: 'The language is applied on restart. You can restart now, cancel the change, or continue with the selected language; continuing without restarting is not recommended.',
    languageRestartNow: 'Restart now',
    languageRestartContinue: 'Continue without restarting',
    languageRestartCancel: 'Cancel change',
    languageRestartToast: 'Language applied without restarting. Restart the launcher to finish the translation.',
  },
};

function normalizeLanguage(value) {
  if (!value) return '1034';
  if (value === 'en') return '1033';
  if (value === 'es') return '1034';
  return LANGUAGES.some((item) => item.code === String(value)) ? String(value) : '1034';
}

I18N['1033'] = I18N.en;
I18N['1034'] = I18N.es;
const EN_BASE = I18N.en;
I18N['1036'] = Object.assign({}, EN_BASE, { settings: 'Paramètres', playOnline: 'Jouer en ligne', playOffline: 'Jouer hors ligne', refresh: 'Actualiser', online: 'En ligne', offline: 'Hors ligne', account: 'Compte', launcher: 'Launcher', community: 'Communauté', helpPages: 'Aide et pages', session: 'État de la session', openSettings: 'Ouvrir les paramètres', closeTitle: 'Fermer le launcher ?', closeCancel: 'Annuler', closeBackground: 'Garder en arrière-plan', closeExit: 'Fermer complètement', settingsTitle: 'Options du launcher', languageLabel: 'Langue', startWithWindows: 'Démarrer avec Windows', closeBehavior: 'À la fermeture', autoUpdate: 'Mises à jour automatiques', confirmLinks: 'Confirmer les liens externes', actions: 'Actions', checkUpdate: 'Rechercher des mises à jour', save: 'Enregistrer', closeAction: 'Fermer' });
I18N['1031'] = Object.assign({}, EN_BASE, { settings: 'Einstellungen', playOnline: 'Online spielen', playOffline: 'Offline spielen', refresh: 'Aktualisieren', online: 'Online', offline: 'Offline', account: 'Konto', launcher: 'Launcher', community: 'Community', helpPages: 'Hilfe & Seiten', session: 'Sitzungsstatus', openSettings: 'Einstellungen öffnen', closeTitle: 'Launcher schließen?', closeCancel: 'Abbrechen', closeBackground: 'Im Hintergrund behalten', closeExit: 'Vollständig schließen', settingsTitle: 'Launcher-Optionen', languageLabel: 'Sprache', startWithWindows: 'Mit Windows starten', closeBehavior: 'Beim Schließen', autoUpdate: 'Automatische Updates', confirmLinks: 'Externe Links bestätigen', actions: 'Aktionen', checkUpdate: 'Nach Updates suchen', save: 'Speichern', closeAction: 'Schließen' });
I18N['1040'] = Object.assign({}, EN_BASE, { settings: 'Impostazioni', playOnline: 'Gioca online', playOffline: 'Gioca offline', refresh: 'Aggiorna', online: 'Online', offline: 'Offline', account: 'Account', launcher: 'Launcher', community: 'Community', helpPages: 'Aiuto e pagine', session: 'Stato sessione', openSettings: 'Apri impostazioni', closeTitle: 'Chiudere il launcher?', closeCancel: 'Annulla', closeBackground: 'Mantieni in background', closeExit: 'Chiudi completamente', settingsTitle: 'Opzioni launcher', languageLabel: 'Lingua', startWithWindows: 'Avvia con Windows', closeBehavior: 'Alla chiusura', autoUpdate: 'Aggiornamenti automatici', confirmLinks: 'Conferma link esterni', actions: 'Azioni', checkUpdate: 'Controlla aggiornamenti', save: 'Salva', closeAction: 'Chiudi' });
I18N['1043'] = Object.assign({}, EN_BASE, { settings: 'Instellingen', playOnline: 'Online spelen', playOffline: 'Offline spelen', refresh: 'Vernieuwen', online: 'Online', offline: 'Offline', account: 'Account', launcher: 'Launcher', community: 'Community', helpPages: 'Hulp en pagina\'s', session: 'Sessiestatus', openSettings: 'Instellingen openen', closeTitle: 'Launcher sluiten?', closeCancel: 'Annuleren', closeBackground: 'Op achtergrond houden', closeExit: 'Volledig sluiten', settingsTitle: 'Launcher-opties', languageLabel: 'Taal', startWithWindows: 'Starten met Windows', closeBehavior: 'Bij sluiten', autoUpdate: 'Automatische updates', confirmLinks: 'Externe links bevestigen', actions: 'Acties', checkUpdate: 'Controleren op updates', save: 'Opslaan', closeAction: 'Sluiten' });
I18N['1045'] = Object.assign({}, EN_BASE, { settings: 'Ustawienia', playOnline: 'Graj online', playOffline: 'Graj offline', refresh: 'Odśwież', online: 'Online', offline: 'Offline', account: 'Konto', launcher: 'Launcher', community: 'Społeczność', helpPages: 'Pomoc i strony', session: 'Stan sesji', openSettings: 'Otwórz ustawienia', closeTitle: 'Zamknąć launcher?', closeCancel: 'Anuluj', closeBackground: 'Zostaw w tle', closeExit: 'Zamknij całkowicie', settingsTitle: 'Opcje launchera', languageLabel: 'Język', startWithWindows: 'Uruchamiaj z Windows', closeBehavior: 'Przy zamykaniu', autoUpdate: 'Automatyczne aktualizacje', confirmLinks: 'Potwierdzaj linki zewnętrzne', actions: 'Działania', checkUpdate: 'Sprawdź aktualizacje', save: 'Zapisz', closeAction: 'Zamknij' });
I18N['1025'] = Object.assign({}, EN_BASE, { settings: 'الإعدادات', playOnline: 'العب عبر الإنترنت', playOffline: 'العب دون اتصال', refresh: 'تحديث', online: 'متصل', offline: 'غير متصل', account: 'الحساب', launcher: 'المشغّل', community: 'المجتمع', helpPages: 'المساعدة والصفحات', session: 'حالة الجلسة', openSettings: 'فتح الإعدادات', closeTitle: 'إغلاق المشغّل؟', closeCancel: 'إلغاء', closeBackground: 'إبقاء في الخلفية', closeExit: 'إغلاق بالكامل', settingsTitle: 'خيارات المشغّل', languageLabel: 'اللغة', startWithWindows: 'التشغيل مع Windows', closeBehavior: 'عند الإغلاق', autoUpdate: 'التحديثات التلقائية', confirmLinks: 'تأكيد الروابط الخارجية', actions: 'الإجراءات', checkUpdate: 'التحقق من التحديثات', save: 'حفظ', closeAction: 'إغلاق' });
I18N['1055'] = Object.assign({}, EN_BASE, { settings: 'Ayarlar', playOnline: 'Çevrimiçi oyna', playOffline: 'Çevrimdışı oyna', refresh: 'Yenile', online: 'Çevrimiçi', offline: 'Çevrimdışı', account: 'Hesap', launcher: 'Başlatıcı', community: 'Topluluk', helpPages: 'Yardım ve sayfalar', session: 'Oturum durumu', openSettings: 'Ayarları aç', closeTitle: 'Başlatıcı kapatılsın mı?', closeCancel: 'İptal', closeBackground: 'Arka planda tut', closeExit: 'Tamamen kapat', settingsTitle: 'Başlatıcı seçenekleri', languageLabel: 'Dil', startWithWindows: 'Windows ile başlat', closeBehavior: 'Kapanışta', autoUpdate: 'Otomatik güncellemeler', confirmLinks: 'Harici bağlantıları onayla', actions: 'Eylemler', checkUpdate: 'Güncellemeleri denetle', save: 'Kaydet', closeAction: 'Kapat' });
I18N['1029'] = Object.assign({}, EN_BASE, { settings: 'Nastavení', playOnline: 'Hrát online', playOffline: 'Hrát offline', refresh: 'Obnovit', online: 'Online', offline: 'Offline', account: 'Účet', launcher: 'Launcher', community: 'Komunita', helpPages: 'Nápověda a stránky', session: 'Stav relace', openSettings: 'Otevřít nastavení', closeTitle: 'Zavřít launcher?', closeCancel: 'Zrušit', closeBackground: 'Ponechat na pozadí', closeExit: 'Zavřít úplně', settingsTitle: 'Možnosti launcheru', languageLabel: 'Jazyk', startWithWindows: 'Spouštět s Windows', closeBehavior: 'Při zavření', autoUpdate: 'Automatické aktualizace', confirmLinks: 'Potvrzovat externí odkazy', actions: 'Akce', checkUpdate: 'Zkontrolovat aktualizace', save: 'Uložit', closeAction: 'Zavřít' });
I18N['1038'] = Object.assign({}, EN_BASE, { settings: 'Beállítások', playOnline: 'Játék online', playOffline: 'Játék offline', refresh: 'Frissítés', online: 'Online', offline: 'Offline', account: 'Fiók', launcher: 'Launcher', community: 'Közösség', helpPages: 'Súgó és oldalak', session: 'Munkamenet állapota', openSettings: 'Beállítások megnyitása', closeTitle: 'Bezárja a launchcert?', closeCancel: 'Mégse', closeBackground: 'Háttérben tartás', closeExit: 'Teljes bezárás', settingsTitle: 'Launcher beállításai', languageLabel: 'Nyelv', startWithWindows: 'Indítás Windowsszal', closeBehavior: 'Bezáráskor', autoUpdate: 'Automatikus frissítések', confirmLinks: 'Külső hivatkozások megerősítése', actions: 'Műveletek', checkUpdate: 'Frissítések keresése', save: 'Mentés', closeAction: 'Bezárás' });
I18N['1053'] = Object.assign({}, EN_BASE, { settings: 'Inställningar', playOnline: 'Spela online', playOffline: 'Spela offline', refresh: 'Uppdatera', online: 'Online', offline: 'Offline', account: 'Konto', launcher: 'Launcher', community: 'Gemenskap', helpPages: 'Hjälp och sidor', session: 'Sessionsstatus', openSettings: 'Öppna inställningar', closeTitle: 'Stäng launchern?', closeCancel: 'Avbryt', closeBackground: 'Behåll i bakgrunden', closeExit: 'Stäng helt', settingsTitle: 'Launcheralternativ', languageLabel: 'Språk', startWithWindows: 'Starta med Windows', closeBehavior: 'Vid stängning', autoUpdate: 'Automatiska uppdateringar', confirmLinks: 'Bekräfta externa länkar', actions: 'Åtgärder', checkUpdate: 'Sök efter uppdateringar', save: 'Spara', closeAction: 'Stäng' });
I18N['2052'] = Object.assign({}, EN_BASE, { settings: '设置', playOnline: '在线游玩', playOffline: '离线游玩', refresh: '刷新', online: '在线', offline: '离线', account: '账户', launcher: '启动器', community: '社区', helpPages: '帮助与页面', session: '会话状态', openSettings: '打开设置', closeTitle: '关闭启动器？', closeCancel: '取消', closeBackground: '保留在后台', closeExit: '完全关闭', settingsTitle: '启动器选项', languageLabel: '语言', startWithWindows: '随 Windows 启动', closeBehavior: '关闭时', autoUpdate: '自动更新', confirmLinks: '确认外部链接', actions: '操作', checkUpdate: '检查更新', save: '保存', closeAction: '关闭' });
I18N['1028'] = Object.assign({}, EN_BASE, { settings: '設定', playOnline: '線上遊玩', playOffline: '離線遊玩', refresh: '重新整理', online: '線上', offline: '離線', account: '帳戶', launcher: '啟動器', community: '社群', helpPages: '說明與頁面', session: '工作階段狀態', openSettings: '開啟設定', closeTitle: '關閉啟動器？', closeCancel: '取消', closeBackground: '保留在背景', closeExit: '完全關閉', settingsTitle: '啟動器選項', languageLabel: '語言', startWithWindows: '隨 Windows 啟動', closeBehavior: '關閉時', autoUpdate: '自動更新', confirmLinks: '確認外部連結', actions: '動作', checkUpdate: '檢查更新', save: '儲存', closeAction: '關閉' });
I18N['1046'] = Object.assign({}, EN_BASE, { settings: 'Configurações', playOnline: 'Jogar online', playOffline: 'Jogar offline', refresh: 'Atualizar', online: 'Online', offline: 'Offline', account: 'Conta', launcher: 'Launcher', community: 'Comunidade', helpPages: 'Ajuda e páginas', session: 'Status da sessão', openSettings: 'Abrir configurações', closeTitle: 'Fechar o launcher?', closeCancel: 'Cancelar', closeBackground: 'Manter em segundo plano', closeExit: 'Fechar completamente', settingsTitle: 'Opções do launcher', languageLabel: 'Idioma', startWithWindows: 'Iniciar com Windows', closeBehavior: 'Ao fechar', autoUpdate: 'Atualizações automáticas', confirmLinks: 'Confirmar links externos', actions: 'Ações', checkUpdate: 'Verificar atualizações', save: 'Salvar', closeAction: 'Fechar' });
I18N['1051'] = Object.assign({}, EN_BASE, { settings: 'Настройки', playOnline: 'Играть онлайн', playOffline: 'Играть офлайн', refresh: 'Обновить', online: 'Онлайн', offline: 'Офлайн', account: 'Аккаунт', launcher: 'Лаунчер', community: 'Сообщество', helpPages: 'Помощь и страницы', session: 'Состояние сеанса', openSettings: 'Открыть настройки', closeTitle: 'Закрыть лаунчер?', closeCancel: 'Отмена', closeBackground: 'Оставить в фоне', closeExit: 'Закрыть полностью', settingsTitle: 'Параметры лаунчера', languageLabel: 'Язык', startWithWindows: 'Запускать с Windows', closeBehavior: 'При закрытии', autoUpdate: 'Автообновления', confirmLinks: 'Подтверждать внешние ссылки', actions: 'Действия', checkUpdate: 'Проверить обновления', save: 'Сохранить', closeAction: 'Закрыть' });
I18N['1041'] = Object.assign({}, EN_BASE, { settings: '設定', playOnline: 'オンラインでプレイ', playOffline: 'オフラインでプレイ', refresh: '更新', online: 'オンライン', offline: 'オフライン', account: 'アカウント', launcher: 'ランチャー', community: 'コミュニティ', helpPages: 'ヘルプとページ', session: 'セッション状態', openSettings: '設定を開く', closeTitle: 'ランチャーを閉じますか？', closeCancel: 'キャンセル', closeBackground: 'バックグラウンドで保持', closeExit: '完全に閉じる', settingsTitle: 'ランチャー設定', languageLabel: '言語', startWithWindows: 'Windows と同時に起動', closeBehavior: '閉じるとき', autoUpdate: '自動更新', confirmLinks: '外部リンクを確認', actions: '操作', checkUpdate: 'アップデートを確認', save: '保存', closeAction: '閉じる' });
I18N['1050'] = Object.assign({}, EN_BASE, { settings: '설정', playOnline: '온라인 플레이', playOffline: '오프라인 플레이', refresh: '새로 고침', online: '온라인', offline: '오프라인', account: '계정', launcher: '런처', community: '커뮤니티', helpPages: '도움말 및 페이지', session: '세션 상태', openSettings: '설정 열기', closeTitle: '런처를 닫으시겠습니까?', closeCancel: '취소', closeBackground: '백그라운드에 유지', closeExit: '완전히 닫기', settingsTitle: '런처 옵션', languageLabel: '언어', startWithWindows: 'Windows 시작 시 실행', closeBehavior: '닫을 때', autoUpdate: '자동 업데이트', confirmLinks: '외부 링크 확인', actions: '작업', checkUpdate: '업데이트 확인', save: '저장', closeAction: '닫기' });

function htmlLanguage(code) {
  const normalized = normalizeLanguage(code);
  return normalized === '1034' ? 'es' : normalized === '1033' ? 'en' : normalized === '2052' ? 'zh-CN' : normalized === '1028' ? 'zh-TW' : normalized === '1046' ? 'pt-BR' : normalized === '1051' ? 'ru' : normalized === '1041' ? 'ja' : normalized === '1050' ? 'ko' : normalized === '1036' ? 'fr' : normalized === '1031' ? 'de' : normalized === '1040' ? 'it' : normalized === '1043' ? 'nl' : normalized === '1045' ? 'pl' : normalized === '1025' ? 'ar' : normalized === '1055' ? 'tr' : normalized === '1029' ? 'cs' : normalized === '1038' ? 'hu' : normalized === '1053' ? 'sv' : 'en';
}

function tr(key) {
  const lang = normalizeLanguage(state.settings?.language);
  return I18N[lang]?.[key] || I18N['1033']?.[key] || key;
}

function updateLanguagePicker(code) {
  const normalized = normalizeLanguage(code);
  const info = LANGUAGES.find((item) => item.code === normalized) || LANGUAGES[1];
  const flag = $('launcher-language-flag');
  const label = $('launcher-language-label');
  if (flag) flag.src = info.flag;
  if (label) label.textContent = info.label;
  document.querySelectorAll('#launcher-language-menu .language-option').forEach((option) => {
    option.classList.toggle('selected', option.getAttribute('data-lang') === normalized);
  });
}

function renderLanguageMenu() {
  const menu = $('launcher-language-menu');
  if (!menu) return;
  menu.innerHTML = '';
  LANGUAGES.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'language-option';
    button.setAttribute('data-lang', item.code);
    button.setAttribute('role', 'option');
    const image = document.createElement('img');
    image.src = item.flag;
    image.alt = '';
    const label = document.createElement('span');
    label.textContent = item.label;
    button.appendChild(image);
    button.appendChild(label);
    button.addEventListener('click', () => requestLanguageChange(item.code));
    menu.appendChild(button);
  });
  updateLanguagePicker(state.settings?.language || '1034');
}

function applyLanguage(language) {
  const normalized = normalizeLanguage(language);
  state.settings = { ...(state.settings || {}), language: normalized };
  document.documentElement.lang = htmlLanguage(normalized);
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (key) element.textContent = tr(key);
  });
  updateLanguagePicker(normalized);
  const settingsButton = $('settings-open');
  if (settingsButton) {
    settingsButton.title = tr('settings');
    settingsButton.setAttribute('aria-label', tr('settings'));
  }
}

function openLanguagePicker() {
  $('launcher-language-picker')?.classList.add('open');
  $('launcher-language-trigger')?.setAttribute('aria-expanded', 'true');
}

function closeLanguagePicker() {
  $('launcher-language-picker')?.classList.remove('open');
  $('launcher-language-trigger')?.setAttribute('aria-expanded', 'false');
}

function requestLanguageChange(code) {
  closeLanguagePicker();
  const normalized = normalizeLanguage(code);
  const current = normalizeLanguage(state.settings?.language);
  if (normalized === current) return;
  state.pendingLanguage = normalized;
  updateLanguagePicker(normalized);
  $('language-restart-modal')?.classList.remove('hidden');
}

const TUTORIAL = [
  {
    icon: '✦',
    kicker: 'BIENVENIDO A MUZICMANIA',
    title: 'Tu nuevo punto de partida',
    text: 'Este launcher comprueba actualizaciones, valida tu cuenta y te deja elegir cómo entrar a MuzicMania. Todo empieza aquí.',
  },
  {
    icon: '◈',
    kicker: 'HUB PRE-GAME',
    title: 'Todo en un solo lugar',
    text: 'Desde el hub puedes jugar online, iniciar el modo offline, abrir tu cuenta, cambiar ajustes y acceder a soporte, comunidad y páginas oficiales.',
  },
  {
    icon: '◉',
    kicker: 'ONLINE / OFFLINE',
    title: 'Juega incluso sin conexión',
    text: 'Si no hay internet, el hub sigue disponible con una cuenta local de invitado y las pistas offline. Cuando vuelvas a conectarte podrás reiniciar el launcher para usar tu cuenta CISZU ID.',
  },
  {
    icon: '◇',
    kicker: 'CISZU ID',
    title: 'Una cuenta, todo tu progreso',
    text: 'Inicia sesión con CISZU ID para guardar tu progreso y ajustes. Si ya tienes sesión, el launcher la recordará la próxima vez.',
  },
];

function invoke(command, args = {}) {
  const internals = window.__TAURI_INTERNALS__;
  if (!internals || typeof internals.invoke !== 'function') {
    return Promise.reject(new Error('tauri_unavailable'));
  }
  return internals.invoke(command, args);
}

function show(id) {
  document.querySelectorAll('.view').forEach((view) => view.classList.remove('active'));
  const target = $(id);
  if (target) target.classList.add('active');
  document.body.classList.toggle('onboarding', ['view-welcome', 'view-tutorial', 'view-login'].includes(id));
  updateTitlebarState();
}

function updateTitlebarState() {
  const active = document.querySelector('.view.active');
  const id = active ? active.id : '';
  const hub = $('titlebar-hub');
  if (hub) hub.disabled = id === 'view-hub' || ['view-welcome', 'view-tutorial', 'view-login'].includes(id) || Boolean(state.policy?.mandatory);
}

async function showHub() {
  window.CiszuTelemetry?.setActivity('hub');
  if (state.policy?.mandatory) return;
  if (!state.boot?.tutorial_done) return;
  if (state.online && !state.forcedOffline && (!state.session || state.session.guest)) return;
  stopLoginPoll();
  stopOfflineGame();
  await invoke('launcher_show_hub').catch(() => {});
  show('view-hub');
  renderHub();
}

function stopOfflineGame() {
  const frame = $('offline-game-frame');
  if (frame) frame.src = 'about:blank';
}

function openOfflineScreen() {
  window.CiszuTelemetry?.setActivity('offline');
  window.CiszuTelemetry?.track('play_offline', { mode: 'offline' });
  if (state.policy?.mandatory) return;
  invoke('launcher_offline_game').catch(() => {});
  show('view-offline');
}

function startOfflineGame() {
  if (state.policy?.mandatory) return;
  const frame = $('offline-game-frame');
  if (frame) frame.src = 'offline-game.html';
  show('view-offline-game');
}

function setBar(id, value) {
  const bar = $(id);
  if (bar) bar.style.width = `${Math.max(0, Math.min(100, value))}%`;
}

function setText(id, value) {
  const element = $(id);
  if (element) element.textContent = value;
}

function setPct(id, value) {
  setText(id, `${Math.round(Math.max(0, Math.min(100, value)))}%`);
}

function toast(message, type = '') {
  const element = $('toast');
  if (!element) return;
  element.textContent = message;
  element.className = type;
  element.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove('show'), 4200);
}

function versionParts(value) {
  const match = String(value || '').match(/(\\d+)\\.(\\d+)\\.(\\d+)/);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : [0, 0, 0];
}

function compareVersions(left, right) {
  const a = versionParts(left);
  const b = versionParts(right);
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
  }
  return 0;
}

function bytes(value) {
  if (!value) return '0 MB';
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function avatarLetter(session) {
  const source = session?.display_name || session?.username || '?';
  return source.trim().charAt(0).toUpperCase() || '?';
}

function setAvatar(session) {
  const element = $('hub-avatar');
  if (!element) return;
  if (session?.avatar_url) {
    element.innerHTML = '';
    const image = document.createElement('img');
    image.src = session.avatar_url;
    image.alt = '';
    element.appendChild(image);
  } else {
    element.textContent = avatarLetter(session);
  }
}

async function checkOnline() {
  try {
    const code = Number(await invoke('server_status', { url: API_BASE })) || 0;
    return code >= 200 && code < 400;
  } catch {
    return false;
  }
}

async function boot() {
  show('view-splash');
  setBar('splash-bar', 4);
  setPct('splash-pct', 4);
  await sleep(220);
  setText('splash-status', 'LEYENDO CONFIGURACIÓN...');
  setBar('splash-bar', 14);
  setPct('splash-pct', 14);

  try {
    state.boot = await invoke('launcher_boot');
    state.settings = await invoke('get_settings');
    state.session = state.boot?.session || null;
    if (!state.settings?.language) {
      state.settings = { ...(state.settings || {}), language: navigator.language.startsWith('es') ? '1034' : '1033' };
    }
    applyLanguage(state.settings.language);
    window.CiszuTelemetry?.configure({
      app: 'muzicmania',
      source: 'launcher',
      version: state.boot?.version || BUILD.launcherVersion,
      channel: state.boot?.channel || BUILD.channel,
    });
    window.CiszuTelemetry?.start({
      activity: 'booting',
      enabled: () => state.settings?.telemetry_enabled !== false,
      userId: () => (state.session && !state.session.guest ? state.session.user_id : null),
    });
    setText('splash-version', `V${state.boot?.version || '2.1.1'}`);
    setText('hub-version', state.boot?.version || '2.1.1');
    const offlineLaunch = new URLSearchParams(window.location.search).get('offline') === '1' || window.location.hash === '#offline';
    if (offlineLaunch) {
      state.online = false;
      state.forcedOffline = true;
      state.session = await invoke('launcher_session').catch(() => null);
      if (!state.session || !state.session.guest) {
        state.session = await invoke('launcher_guest').catch(() => null);
      }
      await showHub();
      return;
    }
  } catch (error) {
    setText('splash-status', 'ERROR DE INICIALIZACIÓN');
    setText('splash-note', 'No se pudo leer la configuración local. Revisa la instalación.');
    setBar('splash-bar', 100);
    setPct('splash-pct', 100);
    toast(`Launcher: ${error}`, 'error');
    return;
  }

  setText('splash-status', 'VERIFICANDO CONEXIÓN...');
  setBar('splash-bar', 28);
  setPct('splash-pct', 28);
  state.online = await checkOnline();

  setText('splash-status', 'PREPARANDO EL HUB...');
  setBar('splash-bar', 46);
  setPct('splash-pct', 46);

  const shouldContinue = await runUpdateFlow(true);
  if (!shouldContinue) return;

  setBar('splash-bar', 76);
  setPct('splash-pct', 76);
  await afterInitialization();
}

function resetUpdateUi() {
  ['update-policy', 'update-version-list', 'update-block-reason', 'update-stay', 'update-switch-release',
    'update-nearest', 'update-latest', 'update-choose', 'update-install', 'update-retry', 'update-skip']
    .forEach((id) => $(id)?.classList.add('hidden'));
  setText('update-title', 'Buscando actualizaciones');
  setText('update-desc', 'MuzicMania comprueba la política de versiones antes de abrir el hub.');
  setText('update-note', '');
  setText('update-range', '');
  setText('update-policy-source', '');
  setText('update-channel-badge', 'BETA');
  setText('update-block-reason', '');
  setBar('update-bar', 6);
  setPct('update-pct', 6);
  $('update-notes')?.classList.add('hidden');
  $('update-spinner')?.classList.remove('hidden');
}

function policyReasonText(info) {
  if (!info?.mandatory) return '';
  const reason = String(info.reason || 'support');
  if (reason === 'security') return 'Bloqueo de seguridad: esta versión tiene una vulnerabilidad conocida.';
  if (reason === 'integrity') return 'Bloqueo de integridad: esta build no coincide con la versión oficial.';
  return 'Bloqueo de soporte: esta versión ya no recibe mantenimiento.';
}

function renderPolicyPanel(info, options = []) {
  const panel = $('update-policy');
  if (!panel) return;
  panel.classList.remove('hidden');
  setText('update-channel-badge', String(info.channel || 'beta').toUpperCase());
  setText('update-policy-source', `Política ${info.policyVersion || '?'} · ${info.policySource || 'local'}${info.stale ? ' · caché' : ''}`);
  const range = options.length
    ? `${options[0].version} → ${options[options.length - 1].version} · ${options.length} versión${options.length === 1 ? '' : 'es'}`
    : (info.releaseAvailable ? `Release ${info.releaseVersion} disponible` : 'Sin versiones compatibles');
  setText('update-range', range);

  const reason = $('update-block-reason');
  if (reason) {
    const text = info.mandatory
      ? `${policyReasonText(info)} ${info.message || ''}`.trim()
      : (info.error ? `No se pudo verificar la política online: ${info.error}. Se usó ${info.policySource || 'la copia local'}.` : '');
    reason.textContent = text;
    reason.classList.toggle('hidden', !text);
  }

  const nearest = info.nearest;
  const latest = info.latestSafe;
  const stay = $('update-stay');
  const nearestButton = $('update-nearest');
  const latestButton = $('update-latest');
  const chooseButton = $('update-choose');
  const switchButton = $('update-switch-release');

  if (stay) {
    stay.classList.toggle('hidden', Boolean(info.mandatory));
    stay.textContent = info.releaseAvailable ? 'Seguir en beta' : 'Quedarme en esta versión';
  }
  if (switchButton) switchButton.classList.toggle('hidden', !(info.releaseAvailable && !info.autoSwitchRelease));
  if (nearestButton) {
    nearestButton.classList.toggle('hidden', !nearest || Boolean(info.releaseAvailable && !info.autoSwitchRelease));
    if (nearest) nearestButton.textContent = `Actualizar a ${nearest.version}`;
  }
  if (latestButton) {
    latestButton.classList.toggle('hidden', !latest || Boolean(info.releaseAvailable && !info.autoSwitchRelease));
    if (latest) latestButton.textContent = `Actualizar a ${latest.version}`;
  }
  if (chooseButton) chooseButton.classList.toggle('hidden', options.length < 2 || Boolean(info.releaseAvailable && !info.autoSwitchRelease));
  renderVersionList(options, info);
}

function renderVersionList(options, info) {
  const list = $('update-version-list');
  if (!list) return;
  list.innerHTML = '';
  options.forEach((option) => {
    const row = document.createElement('div');
    row.className = 'update-version-item';
    const label = document.createElement('span');
    label.textContent = `${option.version} · ${String(option.channel).toUpperCase()} · ${option.gameVersion || ''}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Elegir';
    button.addEventListener('click', () => startUpdateOption(option, info));
    row.append(label, button);
    list.appendChild(row);
  });
}

function showUpdateError(info) {
  const blocked = Boolean(info?.mandatory);
  setText('update-title', blocked ? 'Actualización obligatoria' : 'No se pudo comprobar la actualización');
  setText('update-desc', blocked
    ? 'Esta instalación no puede abrir el hub ni jugar hasta actualizarse.'
    : 'Puedes reintentar, abrir la página oficial de descargas o continuar sin comprobar.');
  setText('update-note', info?.message || info?.error || 'Error de red');
  setBar('update-bar', 100);
  setPct('update-pct', 100);
  $('update-spinner')?.classList.add('hidden');
  $('update-retry')?.classList.remove('hidden');
  $('update-skip')?.classList.toggle('hidden', blocked);
  if (blocked) renderPolicyPanel(info, info?.options || []);
  else $('update-policy')?.classList.remove('hidden');
}

async function startUpdateOption(option, info) {
  if (!option?.url) {
    showUpdateError(info);
    return;
  }
  state.update = option;
  state.policy = info;
  $('update-policy')?.classList.add('hidden');
  $('update-version-list')?.classList.add('hidden');
  $('update-install')?.classList.add('hidden');
  $('update-retry')?.classList.add('hidden');
  $('update-skip')?.classList.add('hidden');
  setText('update-title', `Actualización ${option.version}`);
  setText('update-desc', `Preparando ${bytes(option.size)} desde ${info.current}.`);
  setText('update-note', info.mandatory
    ? 'La actualización es obligatoria; al terminar, el launcher se reiniciará.'
    : 'La descarga se reanudará automáticamente si falla la red.');
  $('update-spinner')?.classList.remove('hidden');
  $('update-notes')?.classList.remove('hidden');
  setText('update-notes', option.changelogUrl || 'Notas de la versión disponibles en GitHub.');
  setBar('update-bar', 16);
  setPct('update-pct', 16);
  try {
    await invoke('launcher_start_update', {
      url: option.url,
      size: option.size,
      version: option.version,
    });
    await waitForDownload();
  } catch (error) {
    setText('update-title', 'Error al descargar');
    setText('update-desc', 'La descarga no pudo iniciarse. Reintenta o abre la descarga oficial.');
    setText('update-note', String(error));
    $('update-retry')?.classList.remove('hidden');
    $('update-skip')?.classList.toggle('hidden', Boolean(info.mandatory));
    $('update-spinner')?.classList.add('hidden');
  }
}

async function continueAfterUpdateCheck() {
  if (state.updateFromBoot) {
    await afterInitialization();
  } else {
    showHub();
  }
}

async function runUpdateFlow(fromBoot) {
  window.CiszuTelemetry?.setActivity('updating');
  window.CiszuTelemetry?.track('update_check', { from_boot: Boolean(fromBoot) });
  state.updateFromBoot = Boolean(fromBoot);
  await invoke('launcher_show_small');
  show('view-update');
  resetUpdateUi();

  let info = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      info = await invoke('launcher_check_update', { online: state.online });
    } catch (error) {
      info = { error: String(error) };
    }
    if (!info?.error || info?.mandatory) break;
    setText('update-desc', 'No se pudo comprobar la actualización. Reintentando…');
    setText('update-note', `Intento ${attempt + 1} de 3`);
    setBar('update-bar', 12 + attempt * 12);
    setPct('update-pct', 12 + attempt * 12);
    await sleep(1100);
  }

  if (!info || typeof info !== 'object') {
    showUpdateError(null);
    return false;
  }
  state.policy = info;
  updateTitlebarState();

  if (info.platformError) {
    setText('update-title', 'Instalador incompatible');
    setText('update-desc', info.platformError);
    setText('update-note', 'Descarga el setup oficial para tu sistema o contacta a soporte.');
    setBar('update-bar', 100);
    setPct('update-pct', 100);
    $('update-spinner')?.classList.add('hidden');
    $('update-policy')?.classList.remove('hidden');
    $('update-retry')?.classList.remove('hidden');
    $('update-downloads')?.classList.remove('hidden');
    $('update-support')?.classList.remove('hidden');
    $('update-skip')?.classList.add('hidden');
    return false;
  }

  if (info.mandatory) {
    setText('update-title', 'Actualización obligatoria');
    setText('update-desc', 'No puedes abrir el hub ni jugar hasta instalar una versión segura y compatible.');
    setText('update-note', info.message || policyReasonText(info));
    setBar('update-bar', 100);
    setPct('update-pct', 100);
    $('update-spinner')?.classList.add('hidden');
    renderPolicyPanel(info, info.options || []);
    if (!info.options?.length) {
      $('update-nearest')?.classList.add('hidden');
      $('update-latest')?.classList.add('hidden');
      $('update-choose')?.classList.add('hidden');
    }
    return false;
  }

  if (info.releaseAvailable && !info.autoSwitchRelease && state.boot?.release_prompted_version !== info.releaseVersion) {
    setText('update-title', 'Hay una versión release');
    setText('update-desc', `Estás en beta ${info.current}; existe release ${info.releaseVersion}.`);
    setText('update-note', 'Puedes seguir en beta o cambiar a release. La elección se recuerda.');
    setBar('update-bar', 100);
    setPct('update-pct', 100);
    $('update-spinner')?.classList.add('hidden');
    renderPolicyPanel(info, []);
    return false;
  }

  if (info.error && !info.available) {
    showUpdateError(info);
    return false;
  }

  if (!info.available || !info.options?.length) {
    setText('update-title', info.error ? 'Actualizado (política local)' : 'MuzicMania está actualizado');
    setText('update-desc', `Versión instalada: ${info.current}. No hay actualizaciones pendientes.`);
    setText('update-note', info.error || '');
    setBar('update-bar', 100);
    setPct('update-pct', 100);
    $('update-spinner')?.classList.add('hidden');
    await sleep(700);
    await continueAfterUpdateCheck();
    return false;
  }

  setText('update-title', 'Actualización disponible');
  setText('update-desc', `Versión instalada ${info.current}. Hay ${info.rangeTotal} versión${info.rangeTotal === 1 ? '' : 'es'} compatible${info.rangeTotal === 1 ? '' : 's'}.`);
  setText('update-note', 'Elige quedarte o actualizar. Nada se instala hasta que lo confirmes.');
  setBar('update-bar', 100);
  setPct('update-pct', 100);
  $('update-spinner')?.classList.add('hidden');
  renderPolicyPanel(info, info.options || []);
  return false;
}
async function waitForDownload() {
  while (true) {
    const status = await invoke('launcher_update_progress');
    const total = Number(status.total) || 0;
    const downloaded = Number(status.downloaded) || 0;
    const percent = total > 0 ? (downloaded / total) * 100 : 20;
    setBar('update-bar', Math.max(16, Math.min(96, percent)));
    setPct('update-pct', Math.max(16, Math.min(99, percent)));
    setText('update-desc', `Descargando actualización… ${bytes(downloaded)}${total ? ` / ${bytes(total)}` : ''}`);
    if (status.state === 'ready') {
      setBar('update-bar', 100);
      setPct('update-pct', 100);
      setText('update-title', 'Actualización lista');
      setText('update-desc', 'Cierra el launcher y aplica la actualización. Windows puede pedir permisos de administrador.');
      setText('update-note', 'Se descargó de forma segura desde GitHub Releases.');
      $('update-spinner')?.classList.add('hidden');
      $('update-install')?.classList.remove('hidden');
      $('update-retry')?.classList.add('hidden');
      $('update-skip')?.classList.add('hidden');
      return;
    }
    if (status.state === 'error') {
      setText('update-title', 'Error al descargar');
      setText('update-desc', 'La descarga se interrumpió. Puedes reintentar o continuar en modo offline forzado.');
      setText('update-note', status.error || 'Error de red');
      setBar('update-bar', 100);
      setPct('update-pct', 100);
      $('update-spinner')?.classList.add('hidden');
      $('update-skip')?.classList.remove('hidden');
      $('update-retry')?.classList.remove('hidden');
      return;
    }
    await sleep(350);
  }
}

async function skipUpdate() {
  if (state.policy?.mandatory) return;
  if (state.policy?.releaseAvailable) {
    await persistSettings({ release_prompted_version: state.policy.releaseVersion || '' });
  }
  await continueAfterUpdateCheck();
}

async function afterInitialization() {
  setBar('splash-bar', 90);
  setPct('splash-pct', 90);
  if (state.boot?.first_run && !state.boot?.tutorial_done) {
    showWelcome();
    return;
  }
  await afterTutorial();
}

async function afterTutorial() {
  state.session = await invoke('launcher_session').catch(() => state.session);
  if (!state.online || state.forcedOffline) {
    if (!state.session) {
      state.session = await invoke('launcher_guest').catch(() => null);
    }
    showHub();
    return;
  }
  if (!state.session || state.session.guest) {
    showLogin();
    return;
  }
  showHub();
}

function showWelcome() {
  invoke('launcher_show_small').catch(() => {});
  show('view-welcome');
}

async function finishWelcome(skipTutorial = false) {
  if (skipTutorial) {
    await invoke('launcher_mark_tutorial_done').catch(() => {});
    if (state.boot) state.boot.tutorial_done = true;
    await afterTutorial();
    return;
  }
  showTutorial();
}

function showTutorial() {
  invoke('launcher_show_small').catch(() => {});
  state.tutorialIndex = 0;
  renderTutorial();
  show('view-tutorial');
}

function renderTutorial() {
  const step = TUTORIAL[state.tutorialIndex];
  if (!step) return;
  setText('tutorial-icon', step.icon);
  setText('tutorial-kicker', step.kicker);
  setText('tutorial-title', step.title);
  setText('tutorial-text', step.text);
  const dots = $('tutorial-dots');
  if (dots) {
    dots.innerHTML = '';
    TUTORIAL.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = index === state.tutorialIndex ? 'active' : '';
      dot.setAttribute('aria-label', `Paso ${index + 1}`);
      dot.addEventListener('click', () => {
        state.tutorialIndex = index;
        renderTutorial();
      });
      dots.appendChild(dot);
    });
  }
  $('tutorial-back')?.classList.toggle('hidden', state.tutorialIndex === 0);
  $('tutorial-next').textContent = state.tutorialIndex === TUTORIAL.length - 1 ? 'Entrar al hub' : 'Continuar';
}

async function finishTutorial() {
  await invoke('launcher_mark_tutorial_done').catch(() => {});
  if (state.boot) state.boot.tutorial_done = true;
  await afterTutorial();
}

function showLogin() {
  invoke('launcher_show_small').catch(() => {});
  stopLoginPoll();
  show('view-login');
  const chip = $('login-online-chip');
  if (chip) {
    chip.textContent = state.online ? 'Servicio disponible' : 'Sin conexión';
    chip.className = `login-chip ${state.online ? 'online' : 'offline'}`;
  }
  setText('login-status', state.online
    ? 'Se abrirá el login oficial de CISZU ID. No necesitas registrarte de nuevo.'
    : 'No hay conexión. Puedes continuar como invitado local o reintentar desde el hub.');
  $('login-open')?.toggleAttribute('disabled', !state.online);
}

function startLoginPoll() {
  stopLoginPoll();
  state.loginPoll = setInterval(async () => {
    try {
      const session = await invoke('launcher_session');
      if (session && !session.guest) {
        state.session = session;
        stopLoginPoll();
        showHub();
      }
    } catch {}
  }, 1000);
}

function stopLoginPoll() {
  if (state.loginPoll) {
    clearInterval(state.loginPoll);
    state.loginPoll = null;
  }
}

function renderHub() {
  const online = state.online && !state.forcedOffline;
  const session = state.session;
  const status = $('hub-status');
  if (status) {
    status.textContent = online ? tr('online') : tr('offline');
    status.className = `status-pill ${online ? 'online' : 'offline'}`;
  }
  const firstTime = Boolean(state.boot?.first_run);
  setText('hub-kicker', firstTime ? tr('welcomeFirst') : tr('welcomeBack'));
  $('hub-kicker')?.classList.toggle('first-time', firstTime);
  document.querySelector('.hero')?.classList.toggle('first-time', firstTime);
  const isGuest = !session || session.guest;
  const name = session?.display_name || session?.username || tr('guest');
  setText('hub-welcome', state.boot?.first_run
    ? tr('welcomeFirstText')
    : tr('welcomeBackText').replace('{name}', name));
  setText('hub-account-name', isGuest ? tr('guest') : name);
  setText('account-who', isGuest ? tr('guest') : name);
  setText('account-sub', isGuest
    ? (online ? tr('sessionLocalOnline') : tr('sessionLocalOffline'))
    : tr('sessionCiszu').replace('{username}', session?.username || (state.settings?.language === 'en' ? 'user' : 'usuario')));
  setAvatar(session);

  $('account-login')?.classList.toggle('hidden', !isGuest || !online);
  $('account-profile')?.classList.toggle('hidden', isGuest);
  $('account-logout')?.classList.toggle('hidden', isGuest);

  const playOnline = $('hub-play-online');
  if (playOnline) {
    playOnline.disabled = !online;
    setText('hub-play-online-label', online ? tr('playOnline') : tr('onlineUnavailable'));
  }
  $('hub-restart-online')?.classList.toggle('hidden', online);
  setText('hub-disclaimer', online ? tr('disclaimerOnline') : tr('disclaimerOffline'));
  setText('hub-session-note', isGuest
    ? tr('sessionNoteGuest')
    : tr('sessionNote').replace('{username}', session?.username || name));
  setText('hub-version', state.boot?.version || BUILD.launcherVersion);
  setText('hub-game-version', state.boot?.game_version || BUILD.gameVersion);
  setText('hub-channel', String(state.boot?.channel || BUILD.channel || 'beta').toUpperCase());

  syncSettingsForm();
}

function syncSettingsForm() {
  if (!state.settings) return;
  const auto = $('modal-auto-update');
  if (auto) auto.checked = state.settings.auto_update !== false;
  const link = $('modal-link-confirm');
  if (link) link.checked = state.settings.link_confirm !== false;
  const telemetry = $('modal-telemetry');
  if (telemetry) telemetry.checked = state.settings.telemetry_enabled !== false;
  const startup = $('modal-startup');
  if (startup) startup.checked = Boolean(state.settings.launch_on_startup);
  const updateChannel = $('modal-update-channel');
  if (updateChannel) updateChannel.value = state.settings.update_channel || state.boot?.update_channel || BUILD.channel || 'beta';
  const autoRelease = $('modal-auto-release');
  if (autoRelease) autoRelease.checked = Boolean(state.settings.auto_switch_release);
  const action = $('modal-close-action');
  if (action) action.value = state.settings.close_action || 'ask';
  updateLanguagePicker(state.settings.language);
}

async function openSettings() {
  syncSettingsForm();
  $('settings-modal')?.classList.remove('hidden');
}


async function persistSettings(patch = {}) {
  state.settings = { ...(state.settings || {}), ...patch };
  try {
    await invoke('update_settings', { settings: state.settings });
  } catch (error) {
    toast(`No se pudieron guardar los ajustes: ${error}`, 'error');
  }
}

async function logout() {
  await invoke('launcher_logout').catch(() => {});
  state.session = null;
  if (!state.online || state.forcedOffline) {
    state.session = await invoke('launcher_guest').catch(() => null);
    showHub();
    return;
  }
  showLogin();
}

function openExternal(url) {
  if (state.settings?.link_confirm === false) {
    invoke('open_url', { url }).catch(() => {});
    return;
  }
  state.pendingLink = url;
  setText('link-dialog-url', url);
  $('link-dialog')?.classList.remove('hidden');
}

async function restartLauncher() {
  await invoke('launcher_restart').catch(() => {});
}

window.showCloseDialog = function () {
  const action = state.settings?.close_action || 'ask';
  if (action === 'background') {
    invoke('launcher_hide').catch(() => {});
    return;
  }
  if (action === 'exit') {
    invoke('launcher_close').catch(() => {});
    return;
  }
  const remember = $('close-remember');
  if (remember) remember.checked = false;
  $('close-dialog')?.classList.remove('hidden');
};

function bind() {
  renderLanguageMenu();
  $('update-retry')?.addEventListener('click', () => {
    runUpdateFlow(state.updateFromBoot);
  });
  $('update-skip')?.addEventListener('click', skipUpdate);
  $('update-stay')?.addEventListener('click', skipUpdate);
  $('update-switch-release')?.addEventListener('click', async () => {
    await persistSettings({ update_channel: 'release' });
    runUpdateFlow(state.updateFromBoot);
  });
  $('update-nearest')?.addEventListener('click', () => {
    if (state.policy?.nearest) startUpdateOption(state.policy.nearest, state.policy);
  });
  $('update-latest')?.addEventListener('click', () => {
    if (state.policy?.latestSafe) startUpdateOption(state.policy.latestSafe, state.policy);
  });
  $('update-choose')?.addEventListener('click', () => {
    $('update-version-list')?.classList.toggle('hidden');
  });
  $('update-downloads')?.addEventListener('click', () => {
    openExternal(state.policy?.support?.downloadsUrl || `${API_BASE}/download`);
  });
  $('update-support')?.addEventListener('click', () => {
    openExternal(state.policy?.support?.supportUrl || `${API_BASE}/support`);
  });
  $('update-close')?.addEventListener('click', () => {
    invoke('launcher_close').catch(() => {});
  });
  $('update-install')?.addEventListener('click', () => {
    if (state.autoApplying) return;
    state.autoApplying = true;
    invoke('launcher_apply_update').catch((error) => {
      state.autoApplying = false;
      toast(String(error), 'error');
    });
  });

  $('welcome-start')?.addEventListener('click', () => finishWelcome(false));
  $('welcome-skip')?.addEventListener('click', () => finishWelcome(true));
  $('tutorial-back')?.addEventListener('click', () => {
    if (state.tutorialIndex > 0) {
      state.tutorialIndex -= 1;
      renderTutorial();
    }
  });
  $('tutorial-next')?.addEventListener('click', async () => {
    if (state.tutorialIndex < TUTORIAL.length - 1) {
      state.tutorialIndex += 1;
      renderTutorial();
      return;
    }
    await finishTutorial();
  });
  $('tutorial-skip')?.addEventListener('click', finishTutorial);

  $('login-open')?.addEventListener('click', async () => {
    if (!state.online) {
      toast('Sin conexión: inicia el launcher en modo online para usar CISZU ID.', 'error');
      return;
    }
    setText('login-status', 'Esperando el login oficial de CISZU ID…');
    $('login-open').disabled = true;
    try {
      await invoke('launcher_open_login');
      startLoginPoll();
    } catch (error) {
      setText('login-status', `No se pudo abrir CISZU ID: ${error}`);
      $('login-open').disabled = false;
    }
  });
  $('login-guest')?.addEventListener('click', async () => {
    state.session = await invoke('launcher_guest').catch(() => null);
    showHub();
  });

  $('settings-open')?.addEventListener('click', openSettings);
  $('settings-open-card')?.addEventListener('click', openSettings);

  $('hub-account-chip')?.addEventListener('click', () => {
    if (!state.session || state.session.guest) {
      openSettings();
      return;
    }
    const username = state.session?.username;
    openExternal(username
      ? `${API_BASE}/profile/@${encodeURIComponent(username)}`
      : `${API_BASE}/login`);
  });

  $('hub-play-online')?.addEventListener('click', () => {
    window.CiszuTelemetry?.setActivity('online');
    window.CiszuTelemetry?.track('play_online', { mode: 'online' });
    if (state.policy?.mandatory) return;
    if (!state.online || state.forcedOffline) {
      toast('El servicio online no está disponible. Usa el modo offline.', 'error');
      return;
    }
    invoke('launcher_ready').catch((error) => toast(String(error), 'error'));
  });
  $('hub-play-offline')?.addEventListener('click', openOfflineScreen);
  $('offline-back')?.addEventListener('click', showHub);
  $('offline-play')?.addEventListener('click', startOfflineGame);
  $('titlebar-hub')?.addEventListener('click', showHub);
  $('titlebar-settings')?.addEventListener('click', openSettings);
  $('titlebar-minimize')?.addEventListener('click', () => invoke('launcher_minimize').catch(() => {}));
  $('titlebar-maximize')?.addEventListener('click', () => invoke('launcher_toggle_maximize').catch(() => {}));
  $('titlebar-close')?.addEventListener('click', () => window.showCloseDialog());
  $('window-titlebar')?.addEventListener('dblclick', (event) => {
    if (event.target.closest('button')) return;
    invoke('launcher_toggle_maximize').catch(() => {});
  });
  $('hub-restart-online')?.addEventListener('click', restartLauncher);
  $('settings-restart')?.addEventListener('click', restartLauncher);
  $('settings-pin')?.addEventListener('click', () => {
    invoke('launcher_pin_taskbar').catch((error) => toast(String(error), 'error'));
  });
  $('hub-refresh')?.addEventListener('click', async () => {
    const button = $('hub-refresh');
    if (!button || button.disabled) return;
    button.disabled = true;
    setText('hub-refresh-label', tr('checking'));
    try {
      state.forcedOffline = false;
      state.online = await checkOnline();
      if (!state.online) {
        state.forcedOffline = true;
        renderHub();
        toast(state.settings?.language === 'en'
          ? 'No connection available. Offline mode remains active.'
          : 'No hay conexión disponible. El modo offline sigue activo.', 'error');
        return;
      }
      const session = await invoke('launcher_session').catch(() => null);
      if (session && !session.guest) {
        state.session = session;
        renderHub();
        toast(state.settings?.language === 'en'
          ? 'Connection restored. Session is active.'
          : 'Conexión restaurada. La sesión está activa.');
        setTimeout(() => invoke('launcher_ready').catch((error) => toast(String(error), 'error')), 350);
      } else {
        state.session = null;
        showLogin();
      }
    } catch (error) {
      state.online = false;
      state.forcedOffline = true;
      renderHub();
      toast(String(error), 'error');
    } finally {
      button.disabled = false;
      setText('hub-refresh-label', tr('refresh'));
    }
  });

  $('account-login')?.addEventListener('click', showLogin);
  $('account-profile')?.addEventListener('click', () => {
    const username = state.session?.username;
    openExternal(username
      ? `${API_BASE}/profile/@${encodeURIComponent(username)}`
      : `${API_BASE}/login`);
  });
  $('account-logout')?.addEventListener('click', logout);

  $('launcher-language-trigger')?.addEventListener('click', (event) => {
    event.stopPropagation();
    if ($('launcher-language-picker')?.classList.contains('open')) closeLanguagePicker();
    else openLanguagePicker();
  });
  document.addEventListener('click', () => closeLanguagePicker());
  $('language-restart-now')?.addEventListener('click', async () => {
    const language = state.pendingLanguage || normalizeLanguage(state.settings?.language);
    await persistSettings({ language });
    await invoke('launcher_restart').catch(() => {});
  });
  $('language-restart-cancel')?.addEventListener('click', () => {
    state.pendingLanguage = null;
    updateLanguagePicker(state.settings?.language);
    $('language-restart-modal')?.classList.add('hidden');
  });
  $('language-restart-continue')?.addEventListener('click', async () => {
    const language = state.pendingLanguage || normalizeLanguage(state.settings?.language);
    state.pendingLanguage = null;
    applyLanguage(language);
    await persistSettings({ language });
    $('language-restart-modal')?.classList.add('hidden');
    toast(tr('languageRestartToast'));
  });
  $('modal-startup')?.addEventListener('change', async (event) => {
    const enabled = Boolean(event.target.checked);
    try {
      await invoke('set_launch_on_startup', { enabled });
      await persistSettings({ launch_on_startup: enabled });
      toast(enabled
        ? (state.settings?.language === 'en' ? 'Start with Windows enabled.' : 'Inicio con Windows activado.')
        : (state.settings?.language === 'en' ? 'Start with Windows disabled.' : 'Inicio con Windows desactivado.'));
    } catch (error) {
      event.target.checked = !enabled;
      toast(String(error), 'error');
    }
  });
  $('settings-check-update')?.addEventListener('click', async () => {
    $('settings-modal')?.classList.add('hidden');
    const result = await runUpdateFlow(false);
    if (result) showHub();
  });

  document.querySelectorAll('[data-url]').forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      openExternal(element.getAttribute('href') || '');
    });
  });

  $('link-cancel')?.addEventListener('click', () => {
    state.pendingLink = '';
    $('link-dialog')?.classList.add('hidden');
  });
  $('link-confirm')?.addEventListener('click', () => {
    const url = state.pendingLink;
    state.pendingLink = '';
    $('link-dialog')?.classList.add('hidden');
    if (url) invoke('open_url', { url }).catch(() => {});
  });

  $('close-cancel')?.addEventListener('click', () => {
    $('close-dialog')?.classList.add('hidden');
    invoke('launcher_cancel_close').catch(() => {});
  });
  $('close-background')?.addEventListener('click', async () => {
    if ($('close-remember')?.checked) {
      await persistSettings({ close_action: 'background', close_confirm: false });
    }
    $('close-dialog')?.classList.add('hidden');
    invoke('launcher_hide').catch(() => {});
  });
  $('close-confirm')?.addEventListener('click', async () => {
    if ($('close-remember')?.checked) {
      await persistSettings({ close_action: 'exit', close_confirm: true });
    }
    $('close-dialog')?.classList.add('hidden');
    invoke('launcher_close').catch(() => {});
  });

  $('settings-close')?.addEventListener('click', () => $('settings-modal')?.classList.add('hidden'));
  $('settings-save')?.addEventListener('click', async () => {
    const closeAction = $('modal-close-action')?.value || 'ask';
    await persistSettings({
      auto_update: $('modal-auto-update')?.checked !== false,
      update_channel: $('modal-update-channel')?.value || 'beta',
      auto_switch_release: Boolean($('modal-auto-release')?.checked),
      close_confirm: closeAction !== 'background',
      close_action: closeAction,
      link_confirm: $('modal-link-confirm')?.checked !== false,
      telemetry_enabled: $('modal-telemetry')?.checked !== false,
    });
    $('settings-modal')?.classList.add('hidden');
    renderHub();
  });
}

bind();
boot();

























