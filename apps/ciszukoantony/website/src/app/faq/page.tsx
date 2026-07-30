'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const faqs = [
  {
    q: '¿Qué es Ciszuko Network?',
    a: '<a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" class="text-brand hover:text-brand-200 transition-colors">Ciszuko Network</a> is a network of technology projects founded by Ciszuko Antony (Francisco Garcia Antonio M. / y8). Includes software development, Minecraft servers, Discord/WhatsApp/Telegram bots, CLI tools and more.',
  },
  {
    q: '¿Cómo puedo unirme al servidor de Minecraft?',
    a: 'The server IP and more info are available in our projects section. The server is currently in development phase.',
  },
  {
    q: '¿Los bots son de uso gratuito?',
    a: 'Yes, all bots developed by <a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" class="text-brand hover:text-brand-200 transition-colors">Ciszuko Network</a> are free to use. Some may have optional premium features.',
  },
  {
    q: '¿Cómo puedo contactar con Ciszuko Antony?',
    a: 'You can contact us through the Contact section on this website, or via our social networks: Discord, Telegram, WhatsApp.',
  },
  {
    q: '¿Dónde puedo ver el código fuente?',
    a: 'The source code for many projects is available on our GitHub: github.com/Ciszu-Network.',
  },
  {
    q: '¿Aceptan contribuciones?',
    a: 'Yes! Open source projects are open to contributions. You can fork, submit pull requests or report issues on GitHub.',
  },
  {
    q: '¿Qué tecnologías usan principalmente?',
    a: 'We work with TypeScript, Node.js, Next.js, Python, Java (PaperMC/Spigot), MongoDB, Docker and more.',
  },
  {
    q: '¿Tienen planes de expansión?',
    a: 'Yes, we are constantly developing new projects and improving existing ones. Follow us on social media to stay up to date.',
  },
];

export default function FAQPage() {
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
                  <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: faq.a }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
