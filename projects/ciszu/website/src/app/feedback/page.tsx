import { MessageSquareWarning } from 'lucide-react';
import { CISZU_NETWORK } from '@/config/site';
import type { Metadata } from 'next';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';

export const metadata: Metadata = {
  title: 'Ciszu Network | FEEDBACK',
  description: 'Envíanos tu opinión, reporta un problema o abre el reporte de seguridad. Tus comentarios hacen crecer Ciszu Network.',
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <MessageSquareWarning className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Feedback
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Tu opinión construye {CISZU_NETWORK.name}
          </p>
        </div>

        <FeedbackForm email={CISZU_NETWORK.email} />
      </div>
    </div>
  );
}