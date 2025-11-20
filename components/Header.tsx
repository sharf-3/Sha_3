import React, { useState } from 'react';
import { Ghost, Menu, Search, X } from 'lucide-react';

interface HeaderProps {
  onSearch: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-dark-950/80 border-b border-white/10 transition-all duration-300 shadow-lg shadow-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0 cursor-pointer group">
            <div className="p-2 bg-brand-500/20 rounded-lg border border-brand-500/30 group-hover:bg-brand-500/30 transition-colors">
              <Ghost className="w-6 h-6 text-brand-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="hidden md:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-100 to-brand-500">
              FacelessCreate
            </span>
          </div>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-lg hidden sm:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search niches (e.g., 'cooking', 'ASMR')..."
                onChange={(e) => onSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-full leading-5 bg-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all duration-300 hover:bg-white/10 shadow-inner"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors hover:scale-105 transform duration-200">Dashboard</a>
            <a href="#" className="hover:text-white transition-colors hover:scale-105 transform duration-200">Trending</a>
            <a href="#" className="hover:text-white transition-colors hover:scale-105 transform duration-200">Saved Scripts</a>
          </nav>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
             <button 
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
             >
                {isMobileSearchOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
             </button>
             <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
               <Menu className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {isMobileSearchOpen && (
            <div className="md:hidden py-4 px-2 border-t border-white/5 animate-slide-up">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search niches..."
                        onChange={(e) => onSearch(e.target.value)}
                        autoFocus
                        className="block w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                    />
                </div>
            </div>
        )}
      </div>
    </header>
  );
};