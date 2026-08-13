'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RichText, type RichPart } from '@/components/RichText';
import { usePageTitle } from '@/lib/usePageTitle';

const faqs = [
  {
    q: '¿Qué es Ciszuko Network?',
    a: [
      { link: 'Ciszuko Network', href: 'https://ciszunetwork.vercel.app' },
      { text: ' is a network of technology projects founded by Ciszuko Antony (Francisco Garcia Antonio M. / y8). Includes software development, Minecraft servers, Discord/WhatsApp/Telegram bots, CLI tools and more.' },
    ] as RichPart[],
  },
  {
    q: '¿Cómo puedo unirme al servidor de Minecraft?',
    a: [
      { text: 'The server IP and more info are available in our projects section. The server is currently in development phase.' },
    ] as RichPart[],
  },
  {
    q: '¿Los bots son de uso gratuito?',
    a: [
      { text: 'Yes, all bots developed by ' },
      { link: 'Ciszuko Network', href: 'https://ciszunetwork.vercel.app' },
      { text: ' are free to use. Some may have optional premium features.' },
    ] as RichPart[],
  },
  {
    q: '¿Cómo puedo contactar con Ciszuko Antony?',
    a: [
      { text: 'You can contact us through the Contact section on this website, or via our social networks: Discord, Telegram, WhatsApp.' },
    ] as RichPart[],
  },
  {
    q: '¿Dónde puedo ver el código fuente?',
    a: [
      { text: 'The source code for many projects is available on our GitHub: github.com/Ciszu-Network.' },
    ] as RichPart[],
  },
  {
    q: '¿Aceptan contribuciones?',
    a: [
      { text: 'Yes! Open source projects are open to contributions. You can fork, submit pull requests or report issues on GitHub.' },
    ] as RichPart[],
  },
  {
    q: '¿Qué tecnologías usan principalmente?',
    a: [
      { text: 'We work with TypeScript, Node.js, Next.js, Python, Java (PaperMC/Spigot), MongoDB, Docker and more.' },
    ] as RichPart[],
  },
  {
    q: '¿Tienen planes de expansión?',
    a: [
      { text: 'Yes, we are constantly developing new projects and improving existing ones. Follow us on social media to stay up to date.' },
    ] as RichPart[],
  },
];

export default function FAQPage() {
  usePageTitle('FAQ');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-header font-black tracking-tighter bg-gradient-to-r from-brand to-brand-200 bg-clip-text text-transparent mb-4">
            FAQ
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">Frequently Asked Questions</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-white/5 border border-white/10 overflow-hidden"
            >
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/[0.02]"
              >
                <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
                <svg className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
                  {openIndex === i && (
                <div className="px-5 pb-5">
                  <RichText parts={faq.a} className="text-sm text-gray-400 leading-relaxed" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
