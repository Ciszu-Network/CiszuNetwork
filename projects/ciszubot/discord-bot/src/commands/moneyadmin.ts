import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { BotCommand, SimulatedMessage } from '../types/command';
import { addMoney, addBank, getWallet } from '../services/economy';
import { getGuildConfig, formatCoins } from '../services/configService';
import { isStaff, STAFF_ERROR } from '../utils/permissions';
import { langOf, tr } from '../services/i18n';

type Where = 'balance' | 'bank';

function parseWhere(raw: string | undefined): Where {
  return (raw ?? '').toLowerCase() === 'bank' || (raw ?? '').toLowerCase() === 'banco' ? 'bank' : 'balance';
}

async function resolveTarget(message: SimulatedMessage, args: string[]) {
  const mentioned = message.mentions?.users?.first();
  if (mentioned) return { id: mentioned.id, tag: mentioned.tag ?? mentioned.username ?? mentioned.id };
  const id = (args[0] ?? '').trim();
  if (/^\d{17,20}$/.test(id)) {
    const user = await message.client.users.fetch(id).catch(() => null);
    if (user) return { id: user.id, tag: user.tag };
  }
  return null;
}

const create = (mode: 'add' | 'remove'): BotCommand => ({
  name: mode === 'add' ? 'addmoney' : 'removemoney',
  description: mode === 'add' ? 'Añade dinero a un usuario (staff)' : 'Quita dinero a un usuario (staff)',
  aliases: mode === 'add' ? ['dardinero', 'moneyadd'] : ['quitardinero', 'moneytake'],
  usage: `cz!${mode === 'add' ? 'addmoney' : 'removemoney'} @usuario <cantidad> [balance|bank]`,
  category: 'Economía',
  slashCommand: new SlashCommandBuilder()
    .setName(mode === 'add' ? 'addmoney' : 'removemoney')
    .setDescription(mode === 'add' ? 'Añade dinero a un usuario (staff)' : 'Quita dinero a un usuario (staff)')
    .setDefaultMemberPermissions(0)
    .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(true))
    .addIntegerOption((o) => o.setName('cantidad').setDescription('Cantidad').setRequired(true).setMinValue(1))
    .addStringOption((o) =>
      o
        .setName('destino')
        .setDescription('balance o bank')
        .setRequired(false)
        .addChoices({ name: 'Balance', value: 'balance' }, { name: 'Banco', value: 'bank' }),
    ),

  async execute(message, args) {
    const L = await langOf(message);
    if (!message.guild) return;
    if (!(await isStaff(message))) {
      await message.reply(STAFF_ERROR);
      return;
    }
    const target = await resolveTarget(message, args);
    if (!target) {
      await message.reply(`❌ Uso: \`cz!${mode === 'add' ? 'addmoney' : 'removemoney'} @usuario <cantidad> [balance|bank]\``);
      return;
    }
    const mentioned = Boolean(message.mentions?.users?.first());
    const amount = parseInt(args[mentioned ? 0 : 1] ?? '', 10);
    if (isNaN(amount) || amount < 1 || amount > 1_000_000_000) {
      await message.reply(tr(L, '❌ La cantidad debe ser un número entre 1 y 1.000.000.000.', '❌ The amount must be a number between 1 and 1,000,000,000.'));
      return;
    }
    const where = parseWhere(args[mentioned ? 1 : 2]);
    const signed = mode === 'add' ? amount : -amount;
    const cfg = await getGuildConfig(message.guild.id);

    if (where === 'bank') await addBank(target.id, message.guild.id, signed, mode === 'add' ? 'admin_add_bank' : 'admin_remove_bank', tr(L, `Por ${message.author.tag}`, `By ${message.author.tag}`));
    else await addMoney(target.id, message.guild.id, signed, mode === 'add' ? 'admin_add' : 'admin_remove', tr(L, `Por ${message.author.tag}`, `By ${message.author.tag}`));

    const wallet = await getWallet(target.id, message.guild.id);
    const embed = new EmbedBuilder()
      .setColor(mode === 'add' ? '#22c55e' : '#ff9900')
      .setTitle(mode === 'add' ? tr(L, '💰 Dinero añadido', '💰 Money added') : tr(L, '💸 Dinero quitado', '💸 Money removed'))
      .setDescription(
        tr(
          L,
          `${mode === 'add' ? 'Se añadieron' : 'Se quitaron'} **${formatCoins(cfg, amount)}** a **${target.tag}** (${where === 'bank' ? 'banco' : 'balance'}).\nSaldo actual: **${formatCoins(cfg, wallet.balance)}** · Banco: **${formatCoins(cfg, wallet.bank)}**`,
          `${mode === 'add' ? 'Added' : 'Removed'} **${formatCoins(cfg, amount)}** ${mode === 'add' ? 'to' : 'from'} **${target.tag}** (${where === 'bank' ? 'bank' : 'balance'}).\nCurrent balance: **${formatCoins(cfg, wallet.balance)}** · Bank: **${formatCoins(cfg, wallet.bank)}**`,
        ),
      )
      .setFooter({ text: `CiszuBot • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  },
});

export default [() => create('add'), () => create('remove')];
