/** Propuestas de matrimonio pendientes (se resuelven con botones). */

export interface Proposal {
  proposer: string;
  proposerTag: string;
  target: string;
  guildId: string;
  expires: number;
}

const proposals = new Map<string, Proposal>();

export function setProposal(p: Proposal): void {
  proposals.set(`${p.target}:${p.guildId}`, p);
}

export function takeProposal(targetId: string, guildId: string): Proposal | null {
  const key = `${targetId}:${guildId}`;
  const p = proposals.get(key);
  if (!p) return null;
  proposals.delete(key);
  if (p.expires < Date.now()) return null;
  return p;
}
