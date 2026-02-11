
import React from 'react';
import { SIZINGS, ADDONS } from '../constants';
import { useLanguage } from '../LanguageContext';

const Services: React.FC = () => {
  const { t, language } = useLanguage();

  const labels = {
    en: { sizings: 'Length & Sizing', addons: 'Add-ons & Care' },
    fr: { sizings: 'Longueurs & Tailles', addons: 'Options & Soins' }
  }[language];

  return (
    <section id="services" className="py-20 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 md:mb-20 relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-brand-pink opacity-30 text-5xl md:text-7xl pointer-events-none animate-pulse">✦</div>
          <h2 className="text-3xl md:text-5xl font-bold serif text-brand-deep mb-4">
            <span className="text-brand-pink">✦</span> {t.services.title}
          </h2>
          <div className="w-20 md:w-24 h-1 bg-brand-deep mx-auto mb-6 md:mb-8 rounded-full"></div>
          <p className="text-gray-400 font-medium max-w-xl mx-auto uppercase tracking-widest text-[10px] md:text-xs">
            {t.services.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Sizings Bubble */}
          <div className="relative group">
            <div className="absolute inset-0 bg-brand-pink/50 blur-[50px] rounded-[3rem] md:rounded-[4rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative bg-[#FFC0CB] rounded-[3rem] md:rounded-[4rem] p-8 md:p-14 shadow-2xl border-[6px] md:border-[8px] border-white/90 backdrop-blur-sm">
              <div className="absolute top-6 right-8 text-brand-deep opacity-30 text-2xl md:text-3xl animate-pulse">✦</div>
              <h3 className="text-2xl md:text-3xl font-bold serif text-brand-deep mb-10 md:mb-12 flex items-center tracking-tight">
                <span className="w-10 h-10 md:w-12 md:h-12 bg-brand-deep text-white rounded-full flex items-center justify-center text-base md:text-lg mr-4 md:mr-5 font-bold shadow-xl">1</span>
                {labels.sizings}
              </h3>
              <div className="space-y-6 md:space-y-8">
                {SIZINGS.map((item) => (
                  <div key={item.id} className="flex justify-between items-center group/item pb-5 md:pb-6 border-b border-brand-deep/10 last:border-0 transition-all hover:translate-x-2">
                    <div className="pr-4">
                      <h4 className="font-bold text-brand-deep text-lg md:text-xl">
                        {language === 'fr' && item.nameFr ? item.nameFr : item.name}
                      </h4>
                      <p className="text-[10px] md:text-xs text-brand-deep/70 italic font-medium mt-1">
                        {language === 'fr' && item.descriptionFr ? item.descriptionFr : item.description}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="block font-bold text-brand-deep text-xl md:text-2xl whitespace-nowrap">{item.price}</span>
                      <span className="block text-[9px] md:text-[10px] text-brand-deep/50 uppercase tracking-[0.2em] font-black mt-1">{item.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add-ons Bubble */}
          <div className="relative group">
            <div className="absolute inset-0 bg-brand-pink/20 blur-[50px] rounded-[3rem] md:rounded-[4rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative bg-white rounded-[3rem] md:rounded-[4rem] p-8 md:p-14 shadow-2xl border-[6px] md:border-[8px] border-[#FFC0CB]/30 backdrop-blur-sm">
              <h3 className="text-2xl md:text-3xl font-bold serif text-brand-deep mb-10 md:mb-12 flex items-center tracking-tight">
                <span className="w-10 h-10 md:w-12 md:h-12 bg-brand-pink text-white rounded-full flex items-center justify-center text-base md:text-lg mr-4 md:mr-5 font-bold shadow-xl">2</span>
                {labels.addons}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 md:gap-y-10">
                {ADDONS.map((item) => (
                  <div key={item.id} className="flex justify-between items-start group/addon hover:translate-y-[-4px] transition-all">
                    <div className="flex-grow pr-3">
                      <h4 className="font-bold text-brand-deep text-sm md:text-base group-hover/addon:text-brand-pink transition-colors">
                        {language === 'fr' && item.nameFr ? item.nameFr : item.name}
                      </h4>
                      <p className="text-[9px] md:text-[10px] text-gray-400 font-bold leading-tight mt-2 uppercase tracking-widest">
                        {language === 'fr' && item.descriptionFr ? item.descriptionFr : item.description}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="inline-block font-black text-brand-deep text-xs px-2.5 py-1 bg-[#FFC0CB]/20 rounded-full border border-[#FFC0CB]/30 whitespace-nowrap">
                        {item.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 md:mt-24 text-center">
          <p className="text-gray-400 italic text-xs md:text-sm font-medium flex items-center justify-center gap-3 md:gap-4 px-4">
            <span className="text-brand-pink text-xl md:text-2xl">✦</span> 
            {t.services.note} 
            <span className="text-brand-pink text-xl md:text-2xl">✦</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Services;
