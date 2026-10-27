/** Propuestas de matrimonio pendientes (se resuelven con botones). */
import { randomUUID } from 'crypto';

export interface Proposal {
  id: string;
  proposer: string;
  proposerTag: string;
  target: string;
  guildId: string;
  channelId: string;
  announcementMessageId: string | null;
  expires: number;
}

const proposals = new Map<string, Proposal>();

export function setProposal(p: Omit<Proposal, 'id'>): Proposal {
  const proposal: Proposal = { ...p, id: randomUUID() };
  proposals.set(proposal.id, proposal);
  return proposal;
}

export function getProposal(id: string): Proposal | null {
  return proposals.get(id) ?? null;
}

export function deleteProposal(id: string): void {
  proposals.delete(id);
}

export function takeProposal(id: string, targetId: string): Proposal | null {
  const proposal = proposals.get(id);
  if (!proposal || proposal.target !== targetId) return null;
  proposals.delete(id);
  if (proposal.expires < Date.now()) return null;
  return proposal;
}
