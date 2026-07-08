'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { SOCIALS } from '@/config/navigation';

const supportChannels = [
  {
    name: 'Discord', desc: 'Join our Discord server for real-time support.',
    href: 'https://discord.com/invite/W3kMtMMj6E', color: 'from-indigo-500 to-purple-700',
  },
  {
    name: 'Telegram', desc: 'Contact us directly on Telegram.',
    href: 'https://t.me/CiszukoNetwork', color: 'from-blue-400 to-cyan-600',
  },
  {
    name: 'WhatsApp', desc: 'Quick support via WhatsApp.',
    href: 'https://wa.me/584126858111', color: 'from-green-400 to-emerald-600',
  },
  {
    name: 'Email', desc: 'For formal inquiries or collaborations.',
    href: 'mailto:fplayersoffcial@gmail.com', color: 'from-brand to-brand-300',
  },
];

const faqLinks = [
  { q: 'How do I reset my password?', href: '#' },
  { q: 'Report a bug in a bot', href: '#' },
  { q: 'Request a new feature', href: '#' },
  { q: 'Server connection issues', href: '#' },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-header font-black tracking-tighter bg-gradient-to-r from-brand to-brand-200 bg-clip-text text-transparent mb-4">
            Support
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">We&apos;re here to help</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {supportChannels.map((c, i) => (
            <motion.a key={c.name} href={c.href} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand/50 transition-all hover:-translate-y-1"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} mb-4`} />
              <h3 className="text-lg font-header font-bold text-white mb-2 group-hover:text-brand transition-colors">{c.name}</h3>
              <p className="text-gray-400 text-sm">{c.desc}</p>
            </motion.a>
          ))}
        </div>

        <motion.div id="report" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-12"
        >
          <h2 className="text-xl font-header font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            Report a Bug
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            If you find a bug in any of our projects, please report it via Discord or Telegram,
            or open an issue on our GitHub repository.
          </p>
          <div className="flex flex-wrap gap-3">
            {SOCIALS.filter(s => ['GitHub', 'Discord', 'Telegram'].includes(s.name)).map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:border-brand/50 transition-all"
              >
                {s.icon}
                {s.name}
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
        >
          <h2 className="text-lg font-header font-bold text-white mb-4">Quick Help</h2>
          <div className="space-y-3">
            {faqLinks.map((f, i) => (
              <Link key={i} href={f.href}
                className="block text-sm text-gray-400 hover:text-brand transition-colors"
              >
                {f.q}
              </Link>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-white/5">
            <Link href="/faq"
              className="text-sm text-brand hover:text-brand-200 transition-colors"
            >
              View all FAQs →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
