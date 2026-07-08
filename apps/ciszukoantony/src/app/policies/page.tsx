'use client';

import React from 'react';
import { motion } from 'framer-motion';

const sections = [
  {
    id: 'terms', title: 'Terms & Conditions',
    content: 'By accessing and using this website, you agree to comply with these terms. If you do not agree, do not use this site. <a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" class="text-brand hover:text-brand-200 transition-colors">Ciszuko Network</a> reserves the right to modify these terms at any time. Continued use of the site constitutes acceptance of any changes.'
  },
  {
    id: 'privacy', title: 'Privacy Policy',
    content: 'At <a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" class="text-brand hover:text-brand-200 transition-colors">Ciszuko Network</a>, the privacy of our visitors is important. We do not collect personal information without explicit consent. Collected information is used only to improve the user experience and is not shared with third parties without authorization.'
  },
  {
    id: 'cookies', title: 'Cookie Policy',
    content: 'This website may use cookies to enhance the user experience. Cookies are small text files stored on your device. You can configure your browser to reject all cookies or to indicate when a cookie is being sent.'
  },
  {
    id: 'legal', title: 'Legal Notice',
    content: '<a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" class="text-brand hover:text-brand-200 transition-colors">Ciszuko Network</a>&reg; is a registered trademark. All rights reserved. The content of this website may not be reproduced, distributed or used without prior written authorization. Product names, logos and brands mentioned are the property of their respective owners.'
  },
];

export default function PoliciesPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-header font-black tracking-tighter bg-gradient-to-r from-brand-dark to-brand bg-clip-text text-transparent mb-4">
            Policies
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">Terms, Privacy & Legal Notice</p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <motion.div key={s.id} id={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <h2 className="text-xl font-header font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-brand" />
                {s.title}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: s.content }} />
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-12 p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center"
        >
          <p className="text-gray-500 text-xs leading-relaxed">
            Last updated: July 2026. For more information, contact us on{' '}
            <a href="/contact" className="text-brand hover:text-brand-200 transition-colors">our contact page</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
