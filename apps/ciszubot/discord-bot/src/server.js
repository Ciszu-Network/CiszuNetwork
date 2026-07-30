const express = require('express');
const path = require('path');
const app = express();
const port = 5000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let botStats = {
    online: false,
    guilds: 0,
    users: 0,
    commands: 0,
    uptime: 0,
    lastActivity: null,
    commandsExecuted: 0
};

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CiszuBot - Panel de Control</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            body {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: white;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            header {
                text-align: center;
                margin-bottom: 40px;
                padding: 20px 0;
            }
            
            h1 {
                font-size: 3em;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .subtitle {
                font-size: 1.2em;
                opacity: 0.9;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 40px;
            }
            
            .stat-card {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 25px;
                text-align: center;
                transition: transform 0.3s ease;
            }
            
            .stat-card:hover {
                transform: translateY(-5px);
            }
            
            .stat-icon {
                font-size: 2.5em;
                margin-bottom: 15px;
            }
            
            .stat-value {
                font-size: 2em;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .stat-label {
                font-size: 0.9em;
                opacity: 0.8;
            }
            
            .status-online {
                color: #4CAF50;
            }
            
            .status-offline {
                color: #f44336;
            }
            
            .commands-section {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 30px;
                margin-bottom: 40px;
            }
            
            .commands-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }
            
            .command-item {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 15px;
                text-align: center;
            }
            
            .command-name {
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .command-desc {
                font-size: 0.9em;
                opacity: 0.8;
            }
            
            .footer {
                text-align: center;
                margin-top: 40px;
                padding: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .refresh-btn {
                background: #ff6b35;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1em;
                transition: background 0.3s ease;
            }
            
            .refresh-btn:hover {
                background: #e55a2b;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>🤖 CiszuBot</h1>
                <p class="subtitle">Panel de Control Privado</p>
            </header>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">🟢</div>
                    <div class="stat-value status-online" id="bot-status">EN LÍNEA</div>
                    <div class="stat-label">Estado del Bot</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">🏠</div>
                    <div class="stat-value" id="guild-count">1</div>
                    <div class="stat-label">Servidores</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">⚡</div>
                    <div class="stat-value" id="command-count">13</div>
                    <div class="stat-label">Comandos Disponibles</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value" id="uptime">0</div>
                    <div class="stat-label">Tiempo Activo (min)</div>
                </div>
            </div>
            
            <div class="commands-section">
                <h2>📋 Comandos Disponibles</h2>
                <p>Todos los comandos pueden usarse con el prefijo <code>cz!</code> o mencionando al bot</p>
                
                <div class="commands-grid">
                    <div class="command-item">
                        <div class="command-name">cz!help</div>
                        <div class="command-desc">Ayuda y comandos</div>
                    </div>
                    <div class="command-item">
                        <div class="command-name">cz!ping</div>
                        <div class="command-desc">Latencia del bot</div>
                    </div>
                    <div class="command-item">
                        <div class="command-name">cz!say</div>
                        <div class="command-desc">Repetir mensaje</div>
                    </div>
                    <div class="command-item">
                        <div class="command-name">cz!profile</div>
                        <div class="command-desc">Info del usuario</div>
                    </div>
                    <div class="command-item">
                        <div class="command-name">cz!serverinfo</div>
                        <div class="command-desc">Info del servidor</div>
                    </div>
                    <div class="command-item">
                        <div class="command-name">cz!8ball</div>
                        <div class="command-desc">Bola 8 mágica</div>
                    </div>
                    <div class="command-item">
                        <div class="command-name">cz!confess</div>
                        <div class="command-desc">Mensaje anónimo</div>
                    </div>
                    <div class="command-item">
                        <div class="command-name">cz!random</div>
                        <div class="command-desc">Número aleatorio</div>
                    </div>
                    <div class="command-item">
                        <div class="command-name">cz!hi</div>
                        <div class="command-desc">Saludo amigable</div>
                    </div>
                    <div class="command-item">
                        <div class="command-name">cz!bye</div>
                        <div class="command-desc">Despedida</div>
                    </div>
                    <div class="command-item">
                        <div class="command-name">cz!test</div>
                        <div class="command-desc">Prueba del bot</div>
                    </div>
                    <div class="command-item">
                        <div class="command-name">cz!directsay</div>
                        <div class="command-desc">Mensaje directo</div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <button class="refresh-btn" onclick="window.location.reload()">🔄 Actualizar</button>
                <p>CiszuBot - Bot de Discord en Español</p>
                <p>Desarrollado con Node.js y Discord.js</p>
            </div>
        </div>
        
        <script>
            // Actualizar estadísticas cada 30 segundos
            setInterval(async () => {
                try {
                    const response = await fetch('/api/stats');
                    const stats = await response.json();
                    
                    document.getElementById('bot-status').textContent = stats.online ? 'EN LÍNEA' : 'DESCONECTADO';
                    document.getElementById('bot-status').className = stats.online ? 'stat-value status-online' : 'stat-value status-offline';
                    document.getElementById('guild-count').textContent = stats.guilds;
                    document.getElementById('uptime').textContent = Math.floor(stats.uptime / 60000);
                } catch (error) {
                    console.error('Error updating stats:', error);
                }
            }, 30000);
        </script>
    </body>
    </html>
    `);
});

// API para obtener estadísticas del bot
app.get('/api/stats', (req, res) => {
    res.json(botStats);
});

// API para actualizar estadísticas (llamada desde el bot)
app.post('/api/update-stats', (req, res) => {
    botStats = { ...botStats, ...req.body };
    res.json({ success: true });
});

// Función para actualizar estadísticas del bot
function updateBotStats(client) {
    if (client && client.user) {
        botStats = {
            online: client.readyAt !== null,
            guilds: client.guilds.cache.size,
            users: client.users.cache.size,
            commands: client.commands.size,
            uptime: client.uptime || 0,
            lastActivity: new Date().toISOString(),
            commandsExecuted: botStats.commandsExecuted
        };
    }
}

// Iniciar servidor
app.listen(port, () => {
console.log(`🌐 Servidor web iniciado en http://localhost:${port}`);});

// Exportar función para usar en el bot
module.exports = { updateBotStats };