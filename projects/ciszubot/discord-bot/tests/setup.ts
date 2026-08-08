// Silencia el logger del bot (escribe a logs/ en warn+): en tests solo nos
// interesan errores reales, y no queremos crear archivos de log.
process.env.LOG_LEVEL = 'error';
