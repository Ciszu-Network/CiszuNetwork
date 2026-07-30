// Tipos compartidos de la base de datos central de Ciszu Network
// Esquemas: public (compartido), muzicmania, ciszubot, ciszunetwork

export interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  email: string | null
  email_verified: boolean
  role: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile>
        Update: Partial<Profile>
      }
    }
  }
}