import React from 'react';
import type { ReactNode, FC } from 'react';
import { motion } from 'framer-motion';
import QuickDocks from '@/components/molecules/QuickDocks';

interface ContentPageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  icon?: ReactNode;
}

export const ContentPage = ({ title, subtitle, children, icon }: ContentPageProps) => {
  return (
    <div className="min-h-screen bg-black text-white pb-20 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center gap-6 mb-2">
            {icon && (
              <div className="p-0 text-neon-blue drop-shadow-neon-blue shrink-0">
                {icon}
              </div>
            )}
            <h1 className="text-5xl md:text-7xl font-header font-black tracking-tighter bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent uppercase py-2 leading-none whitespace-nowrap">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-white font-header font-bold tracking-[0.3em] text-sm md:text-base uppercase opacity-90">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Content Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-neon-blue/5 blur-[100px] rounded-full -z-10" />
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
               <div className="w-64 h-64 border-2 border-neon-blue rounded-full rotate-45 transform translate-x-32 -translate-y-32" />
            </div>
            <div className="prose prose-invert prose-neon max-w-none text-gray-300 leading-relaxed font-body">
              {children}
            </div>
          </div>
        </motion.div>
        
        {/* QuickDocks is injected directly into the template */}
        <QuickDocks />
      </div>
    </div>
  );
};
