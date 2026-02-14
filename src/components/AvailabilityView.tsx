import { supabase } from '../services/supabase';
import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

interface AvailabilityViewProps {
  onBookNow: (date: Date, time: string) => void;
}

const AvailabilityView: React.FC<AvailabilityViewProps> = ({ onBookNow }) => {
  const { language } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Real Availabilities and Bookings
  const [availabilities, setAvailabilities] = useState<{ dates: string[], times: Record<string, string[]> }>({ dates: [], times: {} });
  const [bookings, setBookings] = useState<{ date: string, time: string }[]>([]);

 useEffect(() => {
    const fetchData = async () => {
      const { data: availData } = await supabase.from('availabilities').select('*');
      if (availData) {
        const times: Record<string, string[]> = {};
        const dates: string[] = [];
        availData.forEach((row: { date: string; time: string }) => {
          if (!times[row.date]) { times[row.date] = []; dates.push(row.date); }
          times[row.date].push(row.time);
        });
        setAvailabilities({ dates, times });
      }

      const { data: bookingData } = await supabase.from('bookings').select('date, time');
      if (bookingData) setBookings(bookingData);
    };

    fetchData();
  }, []);

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
    const times = availabilities.times[selectedDate.toDateString()] || [];
    return times.map(slot => ({
      time: slot,
      isBooked: bookings.some(b => b.date === selectedDate.toDateString() && b.time === slot)
    }));
  }, [selectedDate, availabilities, bookings]);

  return (
    <section className="py-20 md:py-32 bg-white relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block text-brand-pink font-black text-[10px] uppercase tracking-[0.5em] mb-4">✦ Availability ✦</span>
          <h2 className="text-4xl md:text-6xl font-bold serif text-brand-deep mb-6">Check Openings</h2>
          <p className="text-gray-400 font-medium max-w-lg mx-auto text-sm leading-relaxed italic">
            Slots marked as booked are currently unavailable. Find an open spot to begin your transformation!
          </p>
        </div>

        <div className="bg-white p-8 md:p-16 rounded-[4rem] shadow-2xl border-4 border-[#FFC0CB]/30 relative overflow-hidden animate-fade-in mb-12">
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-3xl font-bold serif text-brand-deep">
              {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-4">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-3 bg-gray-50 rounded-full hover:bg-brand-pink/10 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-3 bg-gray-50 rounded-full hover:bg-brand-pink/10 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4 md:gap-6 mb-8">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-[9px] font-black text-gray-300 uppercase">{d}</div>)}
            {calendarDays.map((date, idx) => {
              if (!date) return <div key={idx}></div>;
              const dateStr = date.toDateString();
              const isAvailable = availabilities.dates.includes(dateStr);
              const isSelected = selectedDate?.toDateString() === dateStr;
              const isPast = date < new Date(new Date().setHours(0,0,0,0));
              
              return (
                <button 
                  key={idx}
                  disabled={!isAvailable || isPast}
                  onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                  className={`aspect-square flex flex-col items-center justify-center rounded-3xl text-sm font-black transition-all relative ${
                    isSelected ? 'bg-brand-pink text-brand-deep shadow-2xl scale-110' : 
                    isPast ? 'bg-gray-100/40 text-gray-200 opacity-40 cursor-not-allowed' :
                    !isAvailable ? 'bg-gray-50/50 text-gray-300 opacity-60 cursor-not-allowed' : 
                    'bg-gray-50 text-brand-deep hover:bg-brand-pink/20 hover:scale-105'
                  }`}
                >
                  <span className={isPast ? 'line-through' : ''}>{date.getDate()}</span>
                  {isPast && <span className="absolute bottom-2 text-[6px] uppercase tracking-tighter opacity-50 font-black">Past</span>}
                  {isAvailable && !isPast && !isSelected && <span className="absolute bottom-2 text-[6px] text-brand-pink animate-pulse">✦</span>}
                  {!isAvailable && !isPast && <span className="absolute bottom-2 text-[5px] uppercase tracking-widest opacity-40 font-black">N/A</span>}
                </button>
              );
            })}
          </div>

          {selectedDate && activeTimes.length > 0 && (
            <div className="animate-fade-in border-t-2 border-dashed border-gray-100 pt-12 text-center">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-8">✦ Available Times ✦</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {activeTimes.map(slot => (
                  <button
                    key={slot.time}
                    disabled={slot.isBooked}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-4 rounded-2xl text-[10px] font-black transition-all relative overflow-hidden ${
                      slot.isBooked 
                      ? 'bg-gray-50 text-gray-300 cursor-not-allowed opacity-60' 
                      : selectedTime === slot.time 
                        ? 'bg-brand-deep text-white shadow-xl scale-105' 
                        : 'bg-[#FFC0CB]/5 text-brand-deep hover:bg-white border-2 border-transparent hover:border-brand-pink'
                    }`}
                  >
                    <span className={slot.isBooked ? 'line-through' : ''}>{slot.time}</span>
                    {slot.isBooked && <span className="absolute inset-0 flex items-center justify-center bg-gray-100/40 text-[8px] uppercase tracking-widest text-gray-500 font-black">Booked</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {selectedDate && activeTimes.length === 0 && (
            <div className="text-center py-10 text-gray-400 italic text-xs animate-fade-in">
              Fred hasn't set specific times for this date yet.
            </div>
          )}
        </div>

        <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out transform ${selectedDate && selectedTime ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
          <button
            onClick={() => selectedDate && selectedTime && onBookNow(selectedDate, selectedTime)}
            className="group relative flex items-center gap-6 bg-brand-deep text-white px-10 py-6 rounded-full shadow-2xl hover:scale-105 transition-all"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Book {selectedDate?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} @ {selectedTime}</span>
            <div className="w-8 h-8 bg-brand-pink text-brand-deep rounded-full flex items-center justify-center font-bold">✦</div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default AvailabilityView;
