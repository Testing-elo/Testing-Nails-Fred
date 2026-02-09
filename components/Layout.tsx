
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { View } from '../App';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
  isAdmin: boolean;
  onAdminLogin: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, isAdmin, onAdminLogin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const LanguageToggle = () => (
    <div className="relative flex items-center bg-brand-deep p-0.5 md:p-1 rounded-full border-[1.5px] md:border-2 border-brand-deep shadow-xl ring-1 md:ring-2 ring-brand-pink/20 animate-pulse-slow overflow-hidden shrink-0">
      <div 
        className={`absolute h-[calc(100%-4px)] md:h-[calc(100%-8px)] w-[calc(50%-2px)] md:w-[calc(50%-4px)] bg-brand-pink rounded-full transition-transform duration-300 ease-out z-0 ${language === 'fr' ? 'translate-x-full' : 'translate-x-0'}`}
      />
      <button onClick={() => setLanguage('en')} className={`relative z-10 px-2.5 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black tracking-widest transition-colors duration-300 ${language === 'en' ? 'text-brand-deep' : 'text-white hover:text-brand-pink/80'}`}>EN</button>
      <button onClick={() => setLanguage('fr')} className={`relative z-10 px-2.5 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black tracking-widest transition-colors duration-300 ${language === 'fr' ? 'text-brand-deep' : 'text-white hover:text-brand-pink/80'}`}>FR</button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white font-inter">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || currentView !== 'home' ? 'bg-white/95 backdrop-blur-md shadow-lg py-2 md:py-3 border-b border-gray-100' : 'bg-transparent py-4 md:py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-4 group">
            {/* Admin Star - White on Deep Plum for Max Visibility */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                onAdminLogin();
              }}
              className="hidden lg:flex items-center justify-center w-10 h-10 bg-brand-deep rounded-full text-white text-xl transition-all hover:rotate-180 hover:scale-110 duration-700 cursor-pointer relative z-50 shadow-md"
              title="Admin Login"
            >
              ✦
            </button> 
            <button onClick={() => onNavigate('home')} className="text-lg md:text-2xl font-bold tracking-tighter serif text-brand-deep group-hover:text-brand-pink transition-colors duration-500">
              nailzbyfred
            </button>
          </div>
          
          <div className="hidden md:flex items-center space-x-10 font-black text-[10px] uppercase tracking-[0.3em] text-gray-400">
            <button onClick={() => onNavigate('home')} className={`transition-all relative py-2 ${currentView === 'home' ? 'text-brand-deep' : 'hover:text-brand-pink'}`}>
              {t.nav.home}
              {currentView === 'home' && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-pink rounded-full"></div>}
            </button>
            <button onClick={() => onNavigate('portfolio')} className={`transition-all relative py-2 ${currentView === 'portfolio' ? 'text-brand-deep' : 'hover:text-brand-pink'}`}>
              {t.nav.portfolio}
              {currentView === 'portfolio' && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-pink rounded-full"></div>}
            </button>
            <button onClick={() => onNavigate('availabilities')} className={`transition-all relative py-2 ${currentView === 'availabilities' ? 'text-brand-deep' : 'hover:text-brand-pink'}`}>
              {t.nav.availabilities}
              {currentView === 'availabilities' && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-pink rounded-full"></div>}
            </button>
            {isAdmin && (
              <button onClick={() => onNavigate('admin-avail')} className={`transition-all relative py-2 font-black text-brand-pink ${currentView === 'admin-avail' ? 'text-brand-deep' : 'hover:text-brand-pink'}`}>
                Set Availabilities ✦
              </button>
            )}
            {currentView !== 'booking' && (
              <button onClick={() => onNavigate('booking')} className="px-8 py-3.5 rounded-full transition-all border-2 border-brand-deep text-brand-deep btn-book-glow hover:scale-105 active:scale-95">{t.nav.bookNow}</button>
            )}
            <div className="ml-4"><LanguageToggle /></div>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <LanguageToggle />
            <button onClick={() => onNavigate('availabilities')} className={`text-[8px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border-2 ${currentView === 'availabilities' ? 'bg-brand-deep text-white border-brand-deep' : 'bg-white/50 text-brand-deep border-brand-deep'}`}>
              {t.nav.availabilities}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow">{children}</main>

      <footer className="bg-white py-24 border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-20 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-bold text-brand-deep serif mb-8 flex items-center justify-center md:justify-start gap-3"><span className="text-brand-pink">✦</span> nailzbyfred</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-medium mx-auto md:mx-0">{t.footer.about}</p>
          </div>
          <div>
            <h4 className="font-black mb-10 uppercase text-[10px] tracking-[0.5em] text-brand-deep">{t.footer.connect}</h4>
            <div className="flex justify-center md:justify-start">
              <a href="https://www.instagram.com/nailzbyfred/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-pink transition-all flex items-center gap-5 group" aria-label="Instagram">
                <div className="w-14 h-14 rounded-2xl border border-gray-100 flex items-center justify-center group-hover:bg-brand-pink/10 group-hover:border-brand-pink/30 group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </div>
                <span className="font-bold text-sm tracking-widest uppercase text-brand-deep">@nailzbyfred</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-24 pt-10 border-t border-gray-50 max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] text-gray-300 uppercase tracking-[0.6em] font-medium">&copy; {new Date().getFullYear()} NailzByFred Studio</div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
