// Capa de datos local con SeaORM (⚠️ condicional — ver TOOLS_EVALUATION_PLAN §7/§11).
// Persistencia SQLite para MuzicMania desktop: scores locales / favoritos offline.
// Se activa con `--features local-db` en src-tauri.

use sea_orm::{
    ConnectionTrait, Database, DatabaseBackend, DatabaseConnection, Statement,
};

#[derive(Clone, Debug)]
pub struct LocalScore {
    pub track_id: String,
    pub score: i32,
    pub accuracy: f32,
    pub played_at: String,
}

pub struct LocalDb {
    pub conn: DatabaseConnection,
}

impl LocalDb {
    /// Abre (o crea) la base SQLite local en la ruta pasada.
    pub async fn open(path: &str) -> Result<Self, String> {
        let conn = Database::connect(format!("sqlite://{path}?mode=rwc"))
            .await
            .map_err(|e| e.to_string())?;
        Self::ensure_schema(&conn).await?;
        Ok(Self { conn })
    }

    async fn ensure_schema(conn: &DatabaseConnection) -> Result<(), String> {
        conn.execute(Statement::from_string(
            DatabaseBackend::Sqlite,
            "CREATE TABLE IF NOT EXISTS local_scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                track_id TEXT NOT NULL,
                score INTEGER NOT NULL,
                accuracy REAL NOT NULL,
                played_at TEXT NOT NULL
            )"
            .to_owned(),
        ))
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
    }

    /// Inserta un score local y devuelve su id.
    pub async fn insert_score(&self, s: LocalScore) -> Result<u64, String> {
        Ok(self
            .conn
            .execute(Statement::from_sql_and_values(
                DatabaseBackend::Sqlite,
                "INSERT INTO local_scores (track_id, score, accuracy, played_at) VALUES (?, ?, ?, ?)",
                vec![
                    s.track_id.into(),
                    s.score.into(),
                    s.accuracy.into(),
                    s.played_at.into(),
                ],
            ))
            .await
            .map_err(|e| e.to_string())?
            .last_insert_id())
    }

    /// Top scores de un track (top N), ordenados desc.
    pub async fn top_scores(&self, track_id: &str, limit: u64) -> Result<Vec<(i32, f32)>, String> {
        let rows = self
            .conn
            .query_all(Statement::from_sql_and_values(
                DatabaseBackend::Sqlite,
                "SELECT score, accuracy FROM local_scores WHERE track_id = ? ORDER BY score DESC LIMIT ?",
                vec![track_id.into(), limit.into()],
            ))
            .await
            .map_err(|e| e.to_string())?;

        Ok(rows
            .iter()
            .filter_map(|r| {
                let score: Option<i32> = r.try_get_by_index(0).ok();
                let acc: Option<f32> = r.try_get_by_index(1).ok();
                Some((score?, acc?))
            })
            .collect())
    }
}

// Re-export pragmático: los consumidores del comando Tauri usan el tipo LocalDb.
pub use LocalDb as Db;