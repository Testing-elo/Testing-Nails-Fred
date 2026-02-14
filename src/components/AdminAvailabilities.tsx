import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../services/supabase';

const PRESET_TIME_SLOTS = [
  "09:00 AM", "10:30 AM", "12:00 PM", 
  "01:30 PM", "03:00 PM", "04:30 PM", "06:00 PM"
];

interface AdminAvailabilitiesProps {
  onNotify: (message: string) => void;
}

const AdminAvailabilities: React.FC<AdminAvailabilitiesProps> = ({ onNotify }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState<Record<string, string[]>>({});
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [customTimeNum, setCustomTimeNum] = useState("");
  const [customTimePeriod, setCustomTimePeriod] = useState("AM");

  // Load availabilities from Supabase on mount
  useEffect(() => {
    const fetchAvailabilities = async () => {
      const { data, error } = await supabase
        .from('availabilities')
        .select('*');
      
      if (error) { console.error(error); return; }

      const times: Record<string, string[]> = {};
      data.forEach((row: { date: string; time: string }) => {
        if (!times[row.date]) times[row.date] = [];
        times[row.date].push(row.time);
      });
      setAvailableTimes(times);
    };

    fetchAvailabilities();
  }, []);

  const availableDates = Object.keys(availableTimes).filter(d => availableTimes[d].length > 0);

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

  const toggleDateSelection = (dateStr: string) => {
    setActiveDate(activeDate === dateStr ? null : dateStr);
  };

  const addTime = async (dateStr: string, time: string) => {
    if (!time.trim()) return;
    const currentTimes = availableTimes[dateStr] || [];
    if (currentTimes.includes(time)) return;

    const { error } = await supabase
      .from('availabilities')
      .insert({ date: dateStr, time });

    if (error) { onNotify('Error adding time'); return; }

    const newTimes = [...currentTimes, time].sort((a, b) => {
      const parse = (t: string) => {
        const [timePart, period] = t.split(' ');
        let [h, m] = timePart.split(':').map(Number);
        if (period === 'PM' && h < 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return h * 60 + (m || 0);
      };
      return parse(a) - parse(b);
    });

    setAvailableTimes(prev => ({ ...prev, [dateStr]: newTimes }));
    onNotify(`Time ${time} added`);
  };

  const removeTime = async (dateStr: string, time: string) => {
    const { error } = await supabase
      .from('availabilities')
      .delete()
      .eq('date', dateStr)
      .eq('time', time);

    if (error) { onNotify('Error removing time'); return; }

    const newTimes = (availableTimes[dateStr] || []).filter(t => t !== time);
    setAvailableTimes(prev => ({ ...prev, [dateStr]: newTimes }));
    onNotify(`Time ${time} removed`);
  };

  const clearDate = async (dateStr: string) => {
    if (!window.confirm("Clear all slots for this date?")) return;

    const { error } = await supabase
      .from('availabilities')
      .delete()
      .eq('date', dateStr);

    if (error) { onNotify('Error clearing date'); return; }

    setAvailableTimes(prev => { const u = { ...prev }; delete u[dateStr]; return u; });
    onNotify("Date cleared successfully");
  };

  const handleCustomTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDate || !customTimeNum) return;
    let formattedTime = customTimeNum;
    if (!formattedTime.includes(':')) {
      if (formattedTime.length <= 2) formattedTime = `${formattedTime}:00`;
      else {
        const h = formattedTime.slice(0, -2);
        const m = formattedTime.slice(-2);
        formattedTime = `${h}:${m}`;
      }
    }
    addTime(activeDate, `${formattedTime} ${customTimePeriod}`);
    setCustomTimeNum("");
  };

  const handleTimeInputChange = (val: string) => {
    setCustomTimeNum(val.replace(/[^0-9:]/g, ''));
  };

  return (
    <section className="py-20 md:py-32 bg-gray-50 relative min-h-screen">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block text-brand-pink font-black text-[10px] uppercase tracking-[0.5em] mb-4">✦ Scheduling Management ✦</span>
          <h2 className="text-4xl md:text-6xl font-bold serif text-brand-deep mb-6">Modular Availability</h2>
          <p className="text-gray-400 font-medium max-w-lg mx-auto text-sm leading-relaxed">
            Select a day on the calendar, then manually add or toggle the hours you want to be available.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-[4rem] shadow-2xl border-4 border-white animate-fade-in">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-bold serif text-brand-deep">
                {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-4">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 bg-gray-50 rounded-full hover:bg-brand-pink/20 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 bg-gray-50 rounded-full hover:bg-brand-pink/20 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-[9px] font-black text-gray-300 uppercase">{d}</div>)}
              {calendarDays.map((date, idx) => {
                if (!date) return <div key={idx}></div>;
                const dateStr = date.toDateString();
                const isActive = activeDate === dateStr;
                const hasSlots = (availableTimes[dateStr] || []).length > 0;
                return (
                  <button key={idx} onClick={() => toggleDateSelection(dateStr)}
                    className={`relative w-full aspect-square flex flex-col items-center justify-center rounded-2xl text-xs font-black transition-all border-2 ${
                      isActive ? 'bg-brand-deep text-white border-brand-deep shadow-lg scale-110 z-10' :
                      hasSlots ? 'bg-brand-pink/10 text-brand-deep border-brand-pink' :
                      'bg-white text-gray-200 border-gray-50 hover:border-brand-pink/50'
                    }`}>
                    {date.getDate()}
                    {hasSlots && !isActive && <span className="absolute bottom-1 w-1 h-1 bg-brand-pink rounded-full"></span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5">
            {activeDate ? (
              <div className="bg-white p-10 rounded-[4rem] shadow-2xl border-4 border-brand-pink/20 animate-fade-in sticky top-32">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Manage Day</h4>
                    <h3 className="text-2xl font-bold serif text-brand-deep">{new Date(activeDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
                  </div>
                  <button onClick={() => clearDate(activeDate)} className="text-red-400 hover:text-red-600 transition-colors p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
                <form onSubmit={handleCustomTimeSubmit} className="mb-8 space-y-4">
                  <div className="flex gap-2">
                    <input type="text" inputMode="numeric" placeholder="e.g. 10:30"
                      className="flex-grow p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-brand-deep outline-none text-xs font-bold"
                      value={customTimeNum} onChange={(e) => handleTimeInputChange(e.target.value)} />
                    <select className="p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-brand-deep outline-none text-xs font-black uppercase tracking-widest cursor-pointer appearance-none"
                      value={customTimePeriod} onChange={(e) => setCustomTimePeriod(e.target.value)}>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-brand-deep text-white p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-pink hover:text-brand-deep transition-all shadow-lg">
                    Add Available Time Slot
                  </button>
                </form>
                <h5 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-4">Quick Toggle Presets</h5>
                <div className="flex flex-wrap gap-2 mb-8">
                  {PRESET_TIME_SLOTS.map(slot => {
                    const isSelected = (availableTimes[activeDate] || []).includes(slot);
                    return (
                      <button key={slot} onClick={() => isSelected ? removeTime(activeDate, slot) : addTime(activeDate, slot)}
                        className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase transition-all border-2 ${
                          isSelected ? 'bg-brand-pink text-brand-deep border-brand-pink' : 'bg-gray-50 text-gray-300 border-transparent hover:border-brand-pink/30'
                        }`}>
                        {slot}
                      </button>
                    );
                  })}
                </div>
                <h5 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-4">Current Availability</h5>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {(availableTimes[activeDate] || []).length > 0 ? (
                    (availableTimes[activeDate] || []).map(time => (
                      <div key={time} className="flex items-center justify-between p-4 bg-brand-deep/5 rounded-2xl group animate-fade-in border border-transparent hover:border-brand-pink/20">
                        <span className="text-xs font-black text-brand-deep">{time}</span>
                        <button onClick={() => removeTime(activeDate, time)} className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-gray-300 italic py-4">No hours set for this day.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-12 text-center bg-white/50 backdrop-blur-sm rounded-[4rem] border-4 border-dashed border-gray-100 italic text-gray-300 text-sm">
                Select a date on the calendar to manage its specific hours.
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #FFC0CB; border-radius: 10px; }
      `}</style>
    </section>
  );
};

export default AdminAvailabilities;
