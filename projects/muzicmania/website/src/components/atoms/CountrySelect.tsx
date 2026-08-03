"use client";

import { useState, useRef, useEffect } from "react";
import { COUNTRIES } from "@/utils/countries";
import { motion, AnimatePresence } from "framer-motion";

interface CountrySelectProps {
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  error?: string;
}

export default function CountrySelect({ value, onChange, error }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCountry = COUNTRIES.find(c => c.code === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-black/60 border ${error ? 'border-red-500/50' : 'border-white/5'} rounded-2xl px-5 py-4 text-white font-header font-bold focus:border-neon-pink/50 transition-all outline-none text-left`}
      >
        {selectedCountry ? (
          <div className="flex items-center gap-3">
            <svg className="w-6 h-4 rounded-[2px] overflow-hidden" preserveAspectRatio="none">
              <use href={`/icons/sprites/sprite-flags.svg#flag-${selectedCountry.code}`} />
            </svg>
            <span className="truncate">{selectedCountry.name}</span>
          </div>
        ) : (
          <span className="text-gray-700">Selecciona tu país</span>
        )}
        <svg viewBox="0 0 24 24" className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-black border border-white/10 rounded-xl shadow-2xl shadow-neon-pink/10 overflow-hidden"
          >
            <div className="p-2 border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar país..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-neon-pink/50 outline-none"
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {filteredCountries.map(country => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onChange({ target: { name: "nationality", value: country.code } });
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
                >
                  <svg className="w-6 h-4 rounded-[2px] overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity" preserveAspectRatio="none">
                    <use href={`/icons/sprites/sprite-flags.svg#flag-${country.code}`} />
                  </svg>
                  <span className="text-gray-400 group-hover:text-white font-bold text-[11px] truncate">
                    <span className="text-gray-600 mr-2 uppercase">{country.code}</span>
                    {country.name}
                  </span>
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-xs font-bold">
                  No se encontraron países
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
