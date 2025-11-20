import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { NicheCard } from './components/NicheCard';
import { GeneratorModal } from './components/GeneratorModal';
import { CATEGORIES, NICHES } from './constants';
import { Niche } from './types';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeNiche, setActiveNiche] = useState<Niche | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredNiches = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return NICHES.filter(n => {
      const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
      const matchesSearch = !term || 
        n.title.toLowerCase().includes(term) || 
        n.description.toLowerCase().includes(term) ||
        n.category.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <div className="min-h-screen bg-dark-950 text-slate-200 pb-20 selection:bg-brand-500 selection:text-white">
      <Header onSearch={setSearchTerm} />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none animate-pulse" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in backdrop-blur-sm">
             <Sparkles className="w-4 h-4 text-yellow-400" />
             <span className="text-xs sm:text-sm font-bold tracking-wide text-slate-300 uppercase">AI-Powered Content Automation</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 animate-slide-up">
            Create Viral <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400">Faceless</span> Videos
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 animate-slide-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Select a high-performing niche, input your topic, and instantly generate production-ready scripts, visual cues, and captions optimized for social engagement.
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 animate-slide-up max-w-5xl mx-auto" style={{ animationDelay: '0.2s' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                  selectedCategory === cat.id
                    ? 'bg-white text-dark-950 border-white shadow-lg shadow-white/20 scale-105'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Niche Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNiches.map((niche, index) => (
             <div 
               key={niche.id} 
               className="animate-slide-up" 
               style={{ animationDelay: `${0.1 + (index * 0.05)}s` }}
             >
               <NicheCard 
                 niche={niche} 
                 onClick={setActiveNiche} 
               />
             </div>
          ))}
        </div>

        {filteredNiches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 animate-fade-in">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-lg font-medium">No niches found matching your search.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="mt-4 text-brand-400 hover:text-brand-300 underline underline-offset-4"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-600 text-sm mt-12 border-t border-white/5">
        <p>© {new Date().getFullYear()} FacelessCreate. Powered by Google Gemini.</p>
      </footer>

      {/* Modal */}
      {activeNiche && (
        <GeneratorModal 
          niche={activeNiche} 
          onClose={() => setActiveNiche(null)} 
        />
      )}
    </div>
  );
}