/**
 * DEBUG BOT UTILS
 * Logic to initialize fake bots for testing the leaderboard and UI.
 */

interface Bot {
    displayName: string;
    username: string;
    email: string;
    password: string;
    highScore: number;
    accuracy: number;
    gamesPlayed: number;
    createdAt: string;
    lastUsernameChange: string;
    isBot: boolean;
}

interface DebugStats {
    botsCreated: number;
    totalBots: number;
    realUsers: number;
    leaderboardEntries: number;
    fakeReviews: number;
    features: {
        fakeBots: boolean;
        fakeScores: boolean;
        fakeLeaderboard: boolean;
        simulatedReviews: boolean;
        testStatistics: boolean;
    };
    timestamp: string;
    version: string;
}

export function initializeDebugBots() {
    if (typeof window === 'undefined') return null;

    const botNames = [
        { display: 'NeonBlaze', username: '@neonblaze', score: 9850, accuracy: 98 },
        { display: 'RhythmKing', username: '@rhythmking', score: 9720, accuracy: 97 },
        { display: 'BeatMaster3000', username: '@beatmaster3000', score: 9580, accuracy: 96 },
        { display: 'CyberDancer', username: '@cyberdancer', score: 9450, accuracy: 95 },
        { display: 'SynthWave', username: '@synthwave', score: 9320, accuracy: 94 },
        { display: 'VaporGroove', username: '@vaporgroove', score: 9180, accuracy: 93 },
        { display: 'ElectroNinja', username: '@electroninja', score: 9050, accuracy: 92 },
        { display: 'PixelPerfect', username: '@pixelperfect', score: 8920, accuracy: 91 },
        { display: 'NightRunner', username: '@nightrunner', score: 8790, accuracy: 90 },
        { display: 'LaserLegend', username: '@laserlegend', score: 8660, accuracy: 89 },
        { display: 'ChromaticKid', username: '@chromatickid', score: 8530, accuracy: 88 },
        { display: 'TurboTapper', username: '@turbotapper', score: 8400, accuracy: 87 },
        { display: 'RetroVibes', username: '@retrovibes', score: 8270, accuracy: 86 },
        { display: 'StarGazer', username: '@stargazer', score: 8140, accuracy: 85 },
        { display: 'FluxCapacitor', username: '@fluxcapacitor', score: 8010, accuracy: 84 },
        { display: 'NovaBlast', username: '@novablast', score: 7880, accuracy: 83 },
        { display: 'OrbitGuru', username: '@orbitguru', score: 7750, accuracy: 82 },
        { display: 'PulseDemon', username: '@pulsedemon', score: 7620, accuracy: 81 },
        { display: 'QuantumBeat', username: '@quantumbeat', score: 7490, accuracy: 80 },
        { display: 'ZeroGravity', username: '@zerogravity', score: 7360, accuracy: 79 },
    ];

    const bots: Bot[] = botNames.map((bot) => ({
        displayName: bot.display,
        username: bot.username,
        email: `${bot.username.substring(1)}@bot.muzicmania.game`,
        password: 'bot_password_123',
        highScore: bot.score,
        accuracy: bot.accuracy,
        gamesPlayed: Math.floor(Math.random() * 200) + 50,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsernameChange: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        isBot: true,
    }));

    const currentUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const realUsers = currentUsers.filter((u: any) => !u.isBot);
    const updatedUsers = [...realUsers, ...bots];

    localStorage.setItem('users', JSON.stringify(updatedUsers));

    const leaderboard = updatedUsers
        .filter((u: any) => u.highScore > 0)
        .sort((a: any, b: any) => b.highScore - a.highScore);

    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    const FAKE_REVIEWS_COUNT = 5;
    const stats: DebugStats = {
        botsCreated: bots.length,
        totalBots: bots.length + FAKE_REVIEWS_COUNT,
        realUsers: realUsers.length,
        leaderboardEntries: leaderboard.length,
        fakeReviews: FAKE_REVIEWS_COUNT,
        features: {
            fakeBots: true,
            fakeScores: true,
            fakeLeaderboard: true,
            simulatedReviews: true,
            testStatistics: true,
        },
        timestamp: new Date().toISOString(),
        version: 'v2.1.0-TS',
    };

    localStorage.setItem('debugStats', JSON.stringify(stats));
    localStorage.setItem('debugBotsInitialized', 'true');

    return stats;
}

export function resetDebugMode() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('debugBotsInitialized');
    localStorage.removeItem('debugStats');
    localStorage.removeItem('dismissed_warning_debug');
    console.log('🔄 Debug mode reset. Recarga la página para reinicializar.');
}
