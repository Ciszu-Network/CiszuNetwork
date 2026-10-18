import { PermissionsBitField } from 'discord.js';
import type { SimulatedMessage } from '../types/command';
import { getGuildConfig } from '../services/configService';

/** ¿El autor es staff? (permiso Gestionar Servidor o alguno de los roles
 *  configurados: staff, owner, admin o mod). */
export async function isStaff(message: SimulatedMessage): Promise<boolean> {
  const guild = message.guild;
  if (!guild) return false;
  if (message.member?.permissions.has(PermissionsBitField.Flags.ManageGuild)) return true;
  const cfg = await getGuildConfig(guild.id);
  const roleIds = [cfg.staff_role_id, ...cfg.owner_role_ids, ...cfg.admin_role_ids, ...cfg.mod_role_ids].filter(
    (r): r is string => Boolean(r),
  );
  if (roleIds.length > 0) {
    const member = await guild.members.fetch(message.author.id).catch(() => null);
    if (member && roleIds.some((roleId) => member.roles.cache.has(roleId))) return true;
  }
  return false;
}

export const STAFF_ERROR =
  '❌ Necesitas ser **staff** (permiso Gestionar Servidor o el rol de staff configurado con `cz!staff role`).';
