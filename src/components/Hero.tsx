
import React from 'react';
import { useLanguage } from '../LanguageContext';

interface HeroProps {
  onBookClick: () => void;
  onPortfolioClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBookClick, onPortfolioClick }) => {
  const { t } = useLanguage();

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-[#FFC0CB]">
      {/* Sparkle decorative elements */}
      <div className="absolute top-20 left-1/4 text-white opacity-60 text-3xl md:text-5xl animate-pulse">✦</div>
      <div className="absolute bottom-40 right-1/4 text-white opacity-40 text-5xl md:text-7xl animate-pulse delay-700">✦</div>
      <div className="absolute top-1/2 right-20 text-white opacity-30 text-2xl md:text-3xl animate-bounce">✦</div>
      
      {/* Soft gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <span className="inline-block text-brand-deep font-bold tracking-[0.5em] uppercase mb-4 md:mb-6 animate-fade-in border-b-2 border-brand-deep pb-2 text-[9px] md:text-[10px]">
          {t.hero.badge}
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-9xl text-brand-deep font-bold serif mb-6 md:mb-8 tracking-tighter leading-[0.9] md:leading-[0.85]">
          {t.hero.title} <br/> 
          <span className="italic relative drop-shadow-sm">
            {t.hero.subtitle}
            <span className="absolute -top-4 -right-6 md:-top-6 md:-right-10 text-white text-2xl md:text-4xl animate-pulse">✦</span>
          </span>
        </h1>
        <p className="text-base md:text-xl text-brand-deep/80 mb-10 md:mb-12 max-w-2xl mx-auto font-medium leading-relaxed italic">
          {t.hero.description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
          <button 
            onClick={onBookClick}
            className="px-8 py-4 md:px-10 md:py-5 bg-brand-deep text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-transform duration-300 w-full sm:w-auto text-center uppercase tracking-[0.2em] text-[9px] md:text-[10px] shadow-2xl"
          >
            {t.hero.ctaBook}
          </button>
          <button 
            onClick={onPortfolioClick}
            className="px-8 py-4 md:px-10 md:py-5 bg-white text-brand-deep border-2 border-brand-deep rounded-full font-bold hover:scale-105 active:scale-95 transition-transform duration-300 w-full sm:w-auto text-center uppercase tracking-[0.2em] text-[9px] md:text-[10px] shadow-xl"
          >
            {t.hero.ctaGallery}
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <svg className="w-5 h-5 md:w-6 md:h-6 text-brand-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
      </div>
    </section>
  );
};

export default Hero;
