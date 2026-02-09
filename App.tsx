
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import Services from './components/Services';
import Gallery from './components/Gallery';
import Booking from './components/Booking';
import AvailabilityView from './components/AvailabilityView';
import AdminAvailabilities from './components/AdminAvailabilities';

export type View = 'home' | 'booking' | 'portfolio' | 'availabilities' | 'admin-avail';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [preselectedDate, setPreselectedDate] = useState<Date | null>(null);
  const [preselectedTime, setPreselectedTime] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // Reliable scroll lock
  useEffect(() => {
    if (showAdminModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      document.body.style.overflow = '';
    }
  }, [showAdminModal]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdminSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (adminCode === "6741") {
      setIsAdmin(true);
      setShowAdminModal(false);
      setAdminCode('');
      showNotification("Welcome back, Fred! Admin access granted.");
    } else {
      showNotification("Incorrect code.", 'error');
      setAdminCode('');
    }
  };

  const handleBookingBack = () => {
    setPreselectedDate(null);
    setPreselectedTime(null);
    navigateTo('home');
  };

  const navigateTo = (view: View, date?: Date, time?: string) => {
    if (date) setPreselectedDate(date);
    if (time) setPreselectedTime(time);
    setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <Hero 
              onBookClick={() => navigateTo('booking')} 
              onPortfolioClick={() => navigateTo('portfolio')}
            />
            <Services />
            <Gallery isAdmin={isAdmin} onNotify={showNotification} />
          </>
        );
      case 'portfolio':
        return (
          <div className="pt-24 min-h-screen">
            <Gallery isAdmin={isAdmin} onNotify={showNotification} />
          </div>
        );
      case 'availabilities':
        return (
          <div className="pt-24 min-h-screen">
            <AvailabilityView onBookNow={(date, time) => navigateTo('booking', date, time)} />
          </div>
        );
      case 'admin-avail':
        return (
          <div className="pt-24 min-h-screen">
            <AdminAvailabilities onNotify={showNotification} />
          </div>
        );
      case 'booking':
        return (
          <div className="pt-24 min-h-screen">
            <Booking 
              initialDate={preselectedDate}
              initialTime={preselectedTime}
              onBack={handleBookingBack} 
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={navigateTo} isAdmin={isAdmin} onAdminLogin={() => setShowAdminModal(true)}>
      <div className="transition-opacity duration-500">
        {renderContent()}
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-fade-in-up">
          <div className={`px-8 py-4 rounded-full shadow-2xl font-black uppercase text-[10px] tracking-widest text-white flex items-center gap-3 ${toast.type === 'success' ? 'bg-brand-deep' : 'bg-red-500'}`}>
            <span className="text-brand-pink text-lg">✦</span>
            {toast.message}
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-brand-deep/80 backdrop-blur-md" onClick={() => setShowAdminModal(false)}></div>
          <div className="relative bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border-4 border-brand-pink max-w-md w-full animate-scale-in">
            <div className="text-center mb-8">
              <span className="text-brand-pink text-4xl block mb-4">✦</span>
              <h2 className="text-3xl font-bold serif text-brand-deep mb-2">Owner Login</h2>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Enter Access Code</p>
            </div>
            <form onSubmit={handleAdminSubmit} className="space-y-6">
              <input 
                autoFocus
                type="password"
                className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-brand-deep rounded-2xl outline-none text-center text-2xl font-black tracking-[0.5em] transition-all"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="••••"
              />
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-gray-400 hover:text-brand-deep transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="py-4 bg-brand-deep text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-pink hover:text-brand-deep transition-all shadow-xl"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <button 
        onClick={() => navigateTo('booking')}
        className={`fixed bottom-8 right-8 md:hidden w-16 h-16 bg-brand-deep text-white rounded-full flex items-center justify-center shadow-2xl z-40 transition-all duration-300 border-4 border-white ${currentView === 'booking' ? 'scale-0' : 'scale-100'}`}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
      </button>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </Layout>
  );
};

export default App;
