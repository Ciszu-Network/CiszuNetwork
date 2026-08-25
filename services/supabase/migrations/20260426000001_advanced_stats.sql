-- TABLA DE MÉTRICAS GLOBALES (Snapshots diarios)
CREATE TABLE IF NOT EXISTS global_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date DATE DEFAULT CURRENT_DATE,
    active_players INTEGER DEFAULT 0,
    new_accounts INTEGER DEFAULT 0,
    tracks_created INTEGER DEFAULT 0,
    total_playtime_minutes BIGINT DEFAULT 0,
    avg_performance_ms INTEGER DEFAULT 0,
    max_multiplier REAL DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE ESTADO DEL SERVIDOR (Tiempo real)
CREATE TABLE IF NOT EXISTS server_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region TEXT NOT NULL,
    status TEXT DEFAULT 'online', -- online, maintenance, degraded
    load_percent INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXTENSIÓN DE ESTADÍSTICAS DE USUARIO (Si no existe en profiles)
-- Suponiendo que ya existe una tabla 'profiles'
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_playtime_minutes BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS tracks_created INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_multiplier REAL DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS highest_score BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS global_rank INTEGER,
ADD COLUMN IF NOT EXISTS status_message TEXT;

-- TABLA DE RELACIONES SOCIALES (Amigos, Bloqueos, Denuncias)
CREATE TABLE IF NOT EXISTS user_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    target_user_id UUID REFERENCES auth.users(id),
    relation_type TEXT NOT NULL, -- friend, blocked, reported
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_user_id, relation_type)
);

-- DATOS DE PRUEBA INICIALES
INSERT INTO server_health (region, status, load_percent, latency_ms) VALUES 
('North America', 'online', 45, 12),
('Europe', 'online', 32, 28),
('Latin America', 'online', 15, 35);
