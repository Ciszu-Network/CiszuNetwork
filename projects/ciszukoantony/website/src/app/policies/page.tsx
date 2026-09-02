'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LegalCiszuLink } from '@ciszu/ui';
import { RichText, type RichPart } from '@/components/RichText';
import { usePageTitle } from '@/lib/usePageTitle';

const NETWORK_LINK: RichPart = { link: 'Ciszuko Network', href: 'https://ciszunetwork.vercel.app' };

const sections = [
  {
    id: 'terms', title: 'Terms & Conditions',
    content: [
      { text: 'By accessing and using this website, you agree to comply with these terms. If you do not agree, do not use this site. ' },
      NETWORK_LINK,
      { text: ' reserves the right to modify these terms at any time. Continued use of the site constitutes acceptance of any changes.' },
    ] as RichPart[],
  },
  {
    id: 'privacy', title: 'Privacy Policy',
    content: [
      { text: 'At ' },
      NETWORK_LINK,
      { text: ', the privacy of our visitors is important. We do not collect personal information without explicit consent. Collected information is used only to improve the user experience and is not shared with third parties without authorization.' },
    ] as RichPart[],
  },
  {
    id: 'cookies', title: 'Cookie Policy',
    content: [
      { text: 'This website may use cookies to enhance the user experience. Cookies are small text files stored on your device. You can configure your browser to reject all cookies or to indicate when a cookie is being sent.' },
    ] as RichPart[],
  },
  {
    id: 'anuncios', title: 'Ads & Advertising',
    content: [
      { text: 'This website shows its own ads (promotion of the Ciszu Network ecosystem) and, in the future, third-party ads. All ads are optional and closable, with a visible countdown timer and a link to these policies. Impressions, clicks and dismissals are measured in aggregate (Google Analytics 4) to improve relevance; we never link ads to sensitive data.' },
    ] as RichPart[],
  },
  {
    id: 'ads-data', title: 'Data for Ad Recommendations',
    content: [
      { text: 'To recommend better ads we may use aggregate browsing and audience signals (pages visited, browser language, approximate region) collected by Google Analytics 4. This data is processed in an aggregated and anonymous way and is never used to identify a specific person beyond what is strictly necessary for the service. You can block analytics cookies from your browser or the site preferences.' },
    ] as RichPart[],
  },
  {
    id: 'geolocation', title: 'Geolocation',
    content: [
      { text: 'We may estimate your approximate location (region/country) from your IP address to: (1) serve content and ads relevant to your region, (2) comply with local legal requirements and (3) improve security (suspicious access detection). Precise (GPS) geolocation is only used when a feature explicitly requires it and with your consent; it is never used for advertising.' },
    ] as RichPart[],
  },
  {
    id: 'accounts', title: 'Accounts & Registration',
    content: [
      { text: 'Creating an account (CISZU ID) is optional and serves to sync your progress, profile and preferences across the ecosystem services. By creating an account you accept these policies, are responsible for keeping your credentials confidential and for the activity performed with your account. You can delete your account by contacting us; associated data will be removed unless legally required to retain it.' },
    ] as RichPart[],
  },
  {
    id: 'legal', title: 'Legal Notice',
    content: [
      NETWORK_LINK,
      { text: '\u00AE is a registered trademark. All rights reserved. The content of this website may not be reproduced, distributed or used without prior written authorization. Product names, logos and brands mentioned are the property of their respective owners.' },
    ] as RichPart[],
  },
];

export default function PoliciesPage() {
  usePageTitle('POLICIES');
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
              <RichText parts={s.content} className="text-gray-400 text-sm leading-relaxed" />
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

        <LegalCiszuLink />
      </div>
    </div>
  );
}
