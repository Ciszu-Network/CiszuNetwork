import { PermissionsBitField } from 'discord.js';
import type { SimulatedMessage } from '../types/command';
import { getGuildConfig } from '../services/configService';

/** ¿El autor es staff? (permiso Gestionar Servidor o rol de staff configurado). */
export async function isStaff(message: SimulatedMessage): Promise<boolean> {
  const guild = message.guild;
  if (!guild) return false;
  if (message.member?.permissions.has(PermissionsBitField.Flags.ManageGuild)) return true;
  const cfg = await getGuildConfig(guild.id);
  if (cfg.staff_role_id) {
    const member = await guild.members.fetch(message.author.id).catch(() => null);
    if (member && member.roles.cache.has(cfg.staff_role_id)) return true;
  }
  return false;
}

export const STAFF_ERROR =
  '❌ Necesitas ser **staff** (permiso Gestionar Servidor o el rol de staff configurado con `cz!staff role`).';
