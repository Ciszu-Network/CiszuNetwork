"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DateSelectProps {
  value: string; // YYYY-MM-DD
  onChange: (e: { target: { name: string; value: string } }) => void;
  error?: string;
  name?: string;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DAYS_SHORT = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export default function DateSelect({ value, onChange, error, name = "birthDate" }: DateSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Parse current value or use a reasonable default (e.g. 2000 for birthdate)
  const initialDate = useMemo(() => {
    if (value) return new Date(value + 'T12:00:00');
    const d = new Date();
    d.setFullYear(2000); // Default to year 2000 for birthdate ease
    return d;
  }, [value]);
  
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode("days");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay() - 1;
    if (day === -1) day = 6; // Monday = 0
    return day;
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === "days") {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(viewMonth - 1);
      }
    } else if (viewMode === "years") {
      setViewYear(viewYear - 12);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === "days") {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    } else if (viewMode === "years") {
      setViewYear(viewYear + 12);
    }
  };

  const handleSelectDate = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const newValue = `${viewYear}-${mm}-${dd}`;
    onChange({ target: { name, value: newValue } });
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Year range for "years" mode
  const years = useMemo(() => {
    const start = viewYear - 5;
    return Array.from({ length: 12 }, (_, i) => start + i);
  }, [viewYear]);

  const displayValue = value ? (() => {
    const d = new Date(value + 'T12:00:00');
    return `${String(d.getDate()).padStart(2, '0')} / ${String(d.getMonth() + 1).padStart(2, '0')} / ${d.getFullYear()}`;
  })() : "";

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-black/60 border ${error ? 'border-red-500/50' : 'border-white/5'} rounded-2xl px-5 py-4 text-white font-header font-bold focus:border-neon-pink/50 transition-all outline-none text-left h-[58px]`}
      >
        {displayValue ? (
          <span className="text-white tracking-widest">{displayValue}</span>
        ) : (
          <span className="text-gray-700">DD / MM / YYYY</span>
        )}
        <div className="w-4 h-4 text-gray-500">
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
      </button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-[100] w-full mt-2 bg-[#050505] border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] shadow-neon-pink/5 overflow-hidden p-4 backdrop-blur-xl"
          >
            {/* Header / Navigation */}
            <div className="flex items-center justify-between mb-4 px-1">
              <button type="button" onClick={handlePrev} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              
              <div className="flex gap-1">
                <button 
                  type="button" 
                  onClick={() => setViewMode(viewMode === "months" ? "days" : "months")}
                  className={`px-2 py-1 rounded-lg font-header font-black uppercase text-[10px] tracking-widest transition-all ${viewMode === "months" ? 'bg-neon-pink text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {MONTHS[viewMonth]}
                </button>
                <button 
                  type="button" 
                  onClick={() => setViewMode(viewMode === "years" ? "days" : "years")}
                  className={`px-2 py-1 rounded-lg font-header font-black uppercase text-[10px] tracking-widest transition-all ${viewMode === "years" ? 'bg-neon-purple text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {viewYear}
                </button>
              </div>

              <button type="button" onClick={handleNext} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
            
            <div className="min-h-[220px]">
              <AnimatePresence mode="wait">
                {viewMode === "days" && (
                  <motion.div key="days" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {DAYS_SHORT.map(d => (
                        <div key={d} className="text-center text-[9px] font-black text-neon-pink/60 uppercase tracking-tighter py-1">
                          {d}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {blanks.map(b => <div key={`blank-${b}`} className="h-9" />)}
                      {days.map(d => {
                        const isSelected = value && value === `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => handleSelectDate(d)}
                            className={`h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all
                              ${isSelected 
                                ? 'bg-neon-pink text-white shadow-[0_0_15px_rgba(255,0,128,0.4)]' 
                                : 'text-gray-400 hover:bg-white/10 hover:text-white'
                              }`}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {viewMode === "months" && (
                  <motion.div key="months" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="grid grid-cols-3 gap-2 py-2">
                    {MONTHS.map((m, i) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => { setViewMonth(i); setViewMode("days"); }}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMonth === i ? 'bg-neon-pink text-white shadow-lg' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                      >
                        {m.substring(0, 3)}
                      </button>
                    ))}
                  </motion.div>
                )}

                {viewMode === "years" && (
                  <motion.div key="years" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="grid grid-cols-3 gap-2 py-2">
                    {years.map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => { setViewYear(y); setViewMode("days"); }}
                        className={`py-3 rounded-xl text-[11px] font-black tracking-widest transition-all ${viewYear === y ? 'bg-neon-purple text-white shadow-lg' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                      >
                        {y}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer con botón Hoy */}
            <div className="mt-2 pt-2 border-t border-white/5 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setViewYear(now.getFullYear());
                  setViewMonth(now.getMonth());
                  setViewMode("days");
                }}
                className="text-[9px] font-black uppercase tracking-[0.2em] text-neon-cyan hover:text-white transition-colors"
              >
                IR A HOY
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
