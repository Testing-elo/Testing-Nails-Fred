
import React, { useState, useMemo, useEffect } from 'react';
import { SIZINGS, ADDONS } from '../constants';
import { useLanguage } from '../LanguageContext';

interface BookingProps {
  onBack: () => void;
  initialDate?: Date | null;
  initialTime?: string | null;
}

const Booking: React.FC<BookingProps> = ({ onBack, initialDate, initialTime }) => {
  const { language, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Real Availabilities from Admin
  const [availabilities, setAvailabilities] = useState<{ dates: string[], times: Record<string, string[]> }>({ dates: [], times: {} });
  const [bookings, setBookings] = useState<{ date: string, time: string }[]>([]);

  useEffect(() => {
    const savedAvail = localStorage.getItem('nailzbyfred_availabilities');
    if (savedAvail) setAvailabilities(JSON.parse(savedAvail));
    
    const savedBookings = localStorage.getItem('nailzbyfred_bookings');
    if (savedBookings) setBookings(JSON.parse(savedBookings));
  }, []);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null);
  const [selectedTime, setSelectedTime] = useState<string | null>(initialTime || null);

  useEffect(() => {
    if (initialDate) {
      setCurrentMonth(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
      setSelectedDate(initialDate);
    }
    if (initialTime) setSelectedTime(initialTime);
  }, [initialDate, initialTime]);

  const [formState, setFormState] = useState({ 
    name: '', 
    contactMethod: '', 
    contactDetail: '',
    lengthId: SIZINGS[0].id 
  });
  
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysCount = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysCount; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentMonth]);

  const activeTimes = useMemo(() => {
    if (!selectedDate) return [];
    const rawTimes = availabilities.times[selectedDate.toDateString()] || [];
    // Filter out already booked slots
    return rawTimes.filter(time => 
      !bookings.some(b => b.date === selectedDate.toDateString() && b.time === time)
    );
  }, [selectedDate, availabilities, bookings]);

  const totals = useMemo(() => {
    const base = SIZINGS.find(s => s.id === formState.lengthId);
    const basePrice = parseInt(base?.price.replace('$', '') || '0');
    let addonTotal = 0;
    const selectedItemsList: { name: string, price: string }[] = [];

    (Object.entries(selectedAddons) as [string, number][]).forEach(([id, qty]) => {
      if (qty > 0) {
        const addon = ADDONS.find(a => a.id === id);
        if (addon) {
          const priceStr = addon.price.split('–')[0].replace('$', '');
          const price = parseInt(priceStr) || 0;
          addonTotal += price * qty;
          selectedItemsList.push({ 
            name: `${qty > 1 ? qty + 'x ' : ''}${language === 'fr' ? addon.nameFr : addon.name}`, 
            price: `$${price * qty}` 
          });
        }
      }
    });

    return { 
      price: basePrice + addonTotal, 
      baseName: base ? (language === 'fr' ? base.nameFr : base.name) : '',
      items: selectedItemsList
    };
  }, [formState.lengthId, selectedAddons, language]);

  const isStepValid = () => {
    if (step === 1) return !!formState.lengthId;
    if (step === 2) return true; // Add-ons are optional
    if (step === 3) return !!selectedDate && !!selectedTime;
    if (step === 4) {
      const isNameValid = formState.name.trim() !== '';
      const isMethodValid = formState.contactMethod !== '';
      const isDetailValid = formState.contactDetail.trim() !== '';
      if (formState.contactMethod === 'phone') {
         return isNameValid && isMethodValid && formState.contactDetail.length === 14;
      }
      return isNameValid && isMethodValid && isDetailValid;
    }
    return true;
  };

  const handleFinalSubmit = () => {
    if (!selectedDate || !selectedTime) return;

    // Save Booking
    const newBooking = { date: selectedDate.toDateString(), time: selectedTime };
    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    localStorage.setItem('nailzbyfred_bookings', JSON.stringify(updatedBookings));

    setShowSuccess(true);
  };

  const nextStep = () => {
    if (!isStepValid()) return;
    if (step === 4) {
      handleFinalSubmit();
    } else {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => ({
      ...prev,
      [id]: prev[id] ? 0 : 1
    }));
  };

  const updateAddonQty = (id: string, delta: number) => {
    setSelectedAddons(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next < 0) return { ...prev, [id]: 0 };
      if (next > 20) return { ...prev, [id]: 20 };
      return { ...prev, [id]: next };
    });
  };

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '').slice(0, 10);
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength <= 3) return phoneNumber;
    if (phoneNumberLength <= 6) {
      return `(${phoneNumber.slice(0, 3)})-${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)})-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handleContactDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (formState.contactMethod === 'phone') {
      value = formatPhoneNumber(value);
    }
    setFormState({ ...formState, contactDetail: value });
  };

  if (showSuccess) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="w-24 h-24 bg-brand-deep text-white rounded-full flex items-center justify-center mx-auto mb-10 text-4xl shadow-2xl">✦</div>
      <h2 className="text-5xl md:text-6xl font-bold serif text-brand-deep mb-6">Request Sent!</h2>
      <p className="text-gray-500 mb-12 italic text-lg">Fred will review your request and reach out shortly via {formState.contactMethod}: <b>{formState.contactDetail}</b>.</p>
      <button onClick={onBack} className="px-14 py-6 bg-brand-deep text-white rounded-full font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:scale-105 transition-all">Return Home</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFC0CB]/5 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-16 md:mb-20 text-center">
          <button onClick={onBack} className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-brand-deep transition-all mb-12 group">
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Exit Booking
          </button>
          <div className="flex items-center justify-center space-x-2 md:space-x-8">
            {[1, 2, 3, 4].map(num => (
              <React.Fragment key={num}>
                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center font-black text-[10px] md:text-sm transition-all shadow-xl ${step >= num ? 'bg-brand-deep text-white' : 'bg-white text-gray-300 border-2 border-gray-50'}`}>
                  {num}
                </div>
                {num < 4 && <div className={`w-4 md:w-16 h-1 rounded-full ${step > num ? 'bg-brand-deep' : 'bg-gray-100'}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
          <div className="lg:col-span-8 space-y-12">
            {step === 1 && (
              <div className="bg-white p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] shadow-2xl animate-fade-in border-4 border-white">
                <span className="text-brand-pink font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">Step 01</span>
                <h2 className="text-3xl md:text-5xl font-bold serif mb-10 md:mb-12 text-brand-deep">Select Length</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {SIZINGS.map((s) => (
                    <button key={s.id} onClick={() => setFormState({...formState, lengthId: s.id})} className={`p-8 md:p-10 text-left rounded-[2.5rem] md:rounded-[3rem] border-4 transition-all relative overflow-hidden group ${formState.lengthId === s.id ? 'border-brand-deep bg-white shadow-2xl scale-[1.02]' : 'border-gray-50 bg-gray-50/30 hover:border-brand-pink/50'}`}>
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                          <h4 className="font-black uppercase tracking-widest text-xs text-brand-deep mb-1">{language === 'fr' ? s.nameFr : s.name}</h4>
                          <p className="text-[10px] text-gray-400 italic font-medium">{language === 'fr' ? s.descriptionFr : s.description}</p>
                        </div>
                        <span className="font-black text-brand-deep text-xl md:text-2xl">{s.price}</span>
                      </div>
                      {formState.lengthId === s.id && <div className="absolute top-0 right-0 p-4 text-brand-pink">✦</div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] shadow-2xl animate-fade-in border-4 border-white">
                <span className="text-brand-pink font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">Step 02</span>
                <h2 className="text-3xl md:text-5xl font-bold serif mb-10 md:mb-12 text-brand-deep">Enhance Your Set</h2>
                <p className="text-gray-400 text-xs font-medium mb-10 uppercase tracking-widest italic">Pick quantities for details & designs (max 20)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {ADDONS.map((addon) => {
                    const qty = selectedAddons[addon.id] || 0;
                    const isMulti = ['ft', 'od', 'bn', 'cg', '3d'].includes(addon.id);
                    return (
                      <div key={addon.id} className={`p-6 md:p-8 rounded-[2rem] border-2 transition-all flex items-center justify-between ${qty > 0 ? 'bg-brand-pink/5 border-brand-pink shadow-md' : 'bg-gray-50 border-transparent hover:border-gray-100'}`}>
                        <div className="flex-grow">
                          <h4 className="font-bold text-brand-deep text-sm md:text-base mb-1">{language === 'fr' ? addon.nameFr : addon.name}</h4>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">{addon.price}</p>
                        </div>
                        {isMulti ? (
                          <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-100 overflow-hidden ml-4">
                            <button onClick={(e) => { e.stopPropagation(); updateAddonQty(addon.id, -1); }} className="w-10 h-10 flex items-center justify-center text-brand-deep hover:bg-brand-pink/20 transition-colors font-bold text-lg">-</button>
                            <span className="w-8 text-center text-xs font-black">{qty}</span>
                            <button onClick={(e) => { e.stopPropagation(); updateAddonQty(addon.id, 1); }} className="w-10 h-10 flex items-center justify-center text-brand-deep hover:bg-brand-pink/20 transition-colors font-bold text-lg">+</button>
                          </div>
                        ) : (
                          <button onClick={() => toggleAddon(addon.id)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${qty > 0 ? 'bg-brand-deep text-white shadow-lg' : 'bg-white text-gray-200 border border-gray-100'}`}>{qty > 0 ? '✓' : '+'}</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] shadow-2xl animate-fade-in border-4 border-white">
                <span className="text-brand-pink font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">Step 03</span>
                <div className="flex justify-between items-center mb-10 md:mb-12">
                  <h2 className="text-3xl md:text-5xl font-bold serif text-brand-deep">Pick a Slot</h2>
                  <div className="flex gap-4">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-3 bg-gray-50 rounded-full hover:bg-brand-pink/20 transition-all">←</button>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-3 bg-gray-50 rounded-full hover:bg-brand-pink/20 transition-all">→</button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-3 md:gap-4 mb-12">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-[9px] font-black text-gray-300 uppercase">{d}</div>)}
                  {calendarDays.map((date, idx) => {
                    if (!date) return <div key={idx}></div>;
                    const dateStr = date.toDateString();
                    const isAvailable = availabilities.dates.includes(dateStr);
                    const isSelected = selectedDate?.toDateString() === dateStr;
                    return (
                      <button 
                        key={idx} 
                        disabled={!isAvailable} 
                        onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                        className={`aspect-square flex items-center justify-center rounded-2xl text-[10px] md:text-xs font-black transition-all ${isSelected ? 'bg-brand-pink text-brand-deep shadow-lg scale-110 z-10' : !isAvailable ? 'text-gray-100 opacity-20 cursor-not-allowed' : 'bg-gray-50 text-brand-deep hover:bg-brand-pink/20'}`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
                {selectedDate && (
                  <div className="animate-fade-in">
                    {activeTimes.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                        {activeTimes.map(slot => (
                          <button key={slot} onClick={() => setSelectedTime(slot)} className={`py-4 rounded-2xl text-[10px] font-black transition-all border-2 ${selectedTime === slot ? 'bg-brand-deep text-white border-brand-deep shadow-xl scale-105' : 'bg-gray-50 text-brand-deep border-transparent hover:border-brand-pink'}`}>
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-300 italic text-xs border-2 border-dashed border-gray-100 rounded-3xl">All slots booked or unavailable.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="bg-white p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] shadow-2xl border-4 border-white animate-fade-in">
                <span className="text-brand-pink font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">Step 04</span>
                <h2 className="text-3xl md:text-5xl font-bold serif mb-10 md:mb-12 text-brand-deep">Your Details</h2>
                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-6">Full Name</label>
                    <input type="text" className="w-full p-8 bg-gray-50 border-2 border-transparent rounded-[2.5rem] outline-none focus:border-brand-deep focus:bg-white text-lg font-medium transition-all" value={formState.name} onChange={(e) => setFormState({...formState, name: e.target.value})} placeholder="e.g. Jane Doe" />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-6">How should Fred reach you?</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['email', 'phone'].map(method => (
                        <button key={method} onClick={() => setFormState({...formState, contactMethod: method, contactDetail: ''})} className={`py-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${formState.contactMethod === method ? 'bg-brand-deep text-white border-brand-deep shadow-lg' : 'bg-white text-gray-400 border-gray-50 hover:border-brand-pink'}`}>{method}</button>
                      ))}
                    </div>
                  </div>

                  {formState.contactMethod && (
                     <div className="animate-fade-in space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block ml-6">Your {formState.contactMethod} detail</label>
                        <input type="text" className="w-full p-8 bg-gray-50 border-2 border-transparent rounded-[2.5rem] outline-none focus:border-brand-deep focus:bg-white text-lg font-medium transition-all" placeholder={formState.contactMethod === 'phone' ? '(514)-123-4567' : `Enter your ${formState.contactMethod}...`} value={formState.contactDetail} onChange={handleContactDetailChange} />
                     </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-12">
              {step > 1 ? (
                <button onClick={prevStep} className="px-10 py-5 text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] flex items-center hover:text-brand-deep transition-all"><span className="mr-3">←</span> Back</button>
              ) : <div />}
              
              <button onClick={nextStep} disabled={!isStepValid()} className={`px-14 py-6 bg-brand-deep text-white rounded-full font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl transition-all ${!isStepValid() ? 'opacity-20 cursor-not-allowed translate-y-2' : 'hover:scale-105 active:scale-95'}`}>{step === 4 ? 'Send Request ✦' : 'Next Step'}</button>
            </div>
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
            <div className="bg-white p-10 md:p-12 rounded-[3.5rem] md:rounded-[4rem] shadow-2xl border-4 border-[#FFC0CB]/30 relative overflow-hidden">
               <h3 className="text-2xl font-bold serif mb-10 text-brand-deep border-b border-gray-50 pb-6">Summary</h3>
               <div className="space-y-6">
                 <div className="flex justify-between items-start">
                    <div>
                      <span className="text-gray-400 uppercase tracking-widest text-[8px] font-black block mb-1">Base Selection</span>
                      <span className="text-brand-deep font-bold text-xs">{totals.baseName}</span>
                    </div>
                    <span className="text-brand-deep font-black text-xs">{SIZINGS.find(s => s.id === formState.lengthId)?.price}</span>
                 </div>
                 {totals.items.length > 0 && (
                    <div className="space-y-4 pt-2">
                       <span className="text-gray-400 uppercase tracking-widest text-[8px] font-black block">Custom Add-ons</span>
                       {totals.items.map((item, i) => (
                         <div key={i} className="flex justify-between items-center text-[10px] animate-fade-in"><span className="text-gray-500 font-medium">{item.name}</span><span className="text-brand-deep font-bold">{item.price}</span></div>
                       ))}
                    </div>
                 )}
                 {selectedDate && (
                   <div className="pt-6 border-t border-gray-50 animate-fade-in">
                      <span className="text-gray-400 uppercase tracking-widest text-[8px] font-black block mb-2">Requested Slot</span>
                      <div className="bg-brand-pink/10 p-4 rounded-2xl flex items-center justify-between"><span className="text-brand-deep font-black text-[9px]">{selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span><span className="text-brand-deep font-black text-[10px]">{selectedTime || '...'}</span></div>
                   </div>
                 )}
                 <div className="pt-8 mt-4 border-t-2 border-brand-deep/5 flex justify-between items-center"><span className="text-gray-400 uppercase tracking-widest text-[10px] font-black">Est. Total</span><span className="text-4xl font-bold italic serif text-brand-deep leading-none">${totals.price}</span></div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
