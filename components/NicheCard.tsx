import React from 'react';
import { Niche } from '../types';
import * as Icons from 'lucide-react';

interface NicheCardProps {
  niche: Niche;
  onClick: (niche: Niche) => void;
}

export const NicheCard: React.FC<NicheCardProps> = ({ niche, onClick }) => {
  // Dynamic Icon loading with fallback
  const IconComponent = (Icons[niche.iconName as keyof typeof Icons] as React.ElementType) || Icons.Box;

  return (
    <div 
      onClick={() => onClick(niche)}
      className="group relative h-full bg-dark-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-brand-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/10 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer overflow-hidden"
    >
      {/* Background Gradient Blob - enhanced animation */}
      <div className={`absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br ${niche.gradient} opacity-10 blur-[60px] group-hover:opacity-30 group-hover:scale-150 transition-all duration-700 rounded-full pointer-events-none`} />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`relative inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-br ${niche.gradient} shadow-lg ring-1 ring-white/10 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-brand-500/40 transition-all duration-500`}>
            <IconComponent className="w-6 h-6 text-white relative z-10" />
            {/* Inner highlight */}
            <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </div>
          
          {/* Hover action indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
             <div className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 shadow-lg backdrop-blur-sm">
                <Icons.Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
             </div>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-100 transition-colors">
          {niche.title}
        </h3>
        
        <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-grow line-clamp-3 group-hover:text-slate-300 transition-colors">
          {niche.description}
        </p>
        
        <div className="relative pt-4 border-t border-white/5 mt-auto">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-brand-400 transition-colors duration-300">
            <span>Generate Script</span>
            <Icons.ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
          </div>
          <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-brand-500 to-purple-500 group-hover:w-full transition-all duration-700 ease-out" />
        </div>
      </div>
    </div>
  );
};