import React, { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';

const PRESET_TIME_SLOTS = [
  "09:00 AM", "10:30 AM", "12:00 PM",
  "01:30 PM", "03:00 PM", "04:30 PM", "06:00 PM"
];

const DEFAULT_CATEGORIES = ['All', 'Classic', 'Acrylic', 'Art', 'Gel', 'Luxury'];

interface AdminDashboardProps {
  onNotify: (message: string, type?: 'success' | 'error') => void;
  onLogout: () => void;
}

interface Booking {
  date: string;
  time: string;
  customer_name: string;
  contact_method: string;
  contact_detail: string;
  service: string;
  addons?: { name: string; price: string }[];
  estimated_total: number;
}

interface PortfolioImage {
  id: string;
  url: string;
  title: string;
  category: string;
}

type Tab = 'overview' | 'schedule' | 'bookings' | 'portfolio';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNotify, onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState<Record<string, string[]>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [customTimeNum, setCustomTimeNum] = useState('');
  const [customTimePeriod, setCustomTimePeriod] = useState('AM');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Portfolio state
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newImage, setNewImage] = useState({ title: '', category: 'Art' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newCatName, setNewCatName] = useState('');
  const [showCatManager, setShowCatManager] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: availData } = await supabase.from('availabilities').select('*');
      if (availData) {
        const times: Record<string, string[]> = {};
        availData.forEach((row: { date: string; time: string }) => {
          if (!times[row.date]) times[row.date] = [];
          times[row.date].push(row.time);
        });
        setAvailableTimes(times);
      }
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('date, time, customer_name, contact_method, contact_detail, service, addons, estimated_total')
        .order('date', { ascending: false });
      if (bookingData) setBookings(bookingData);
      setLoading(false);
    };
    fetchData();

    const saved = localStorage.getItem('portfolio_categories');
    if (saved) {
      try {
        const parsed: string[] = JSON.parse(saved);
        setCategories(parsed);
        const firstReal = parsed.find(c => c !== 'All');
        if (firstReal) setNewImage(prev => ({ ...prev, category: firstReal }));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'portfolio') {
      const fetchPortfolio = async () => {
        setPortfolioLoading(true);
        const { data } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
        if (data) {
          setPortfolioImages(data.map((row: any) => ({
            id: row.id.toString(),
            url: row.url,
            title: row.title,
            category: row.category,
          })));
        }
        setPortfolioLoading(false);
      };
      fetchPortfolio();
    }
  }, [activeTab]);

  const saveCategories = (cats: string[]) => {
    setCategories(cats);
    localStorage.setItem('portfolio_categories', JSON.stringify(cats));
  };

  const handleAddCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    const updated = [...categories, trimmed];
    saveCategories(updated);
    setNewCatName('');
    setNewImage(prev => ({ ...prev, category: trimmed }));
    onNotify(`Category "${trimmed}" added`);
  };

  const handleRemoveCategory = (cat: string) => {
    if (cat === 'All') return;
    const updated = categories.filter(c => c !== cat);
    saveCategories(updated);
    if (activeFilter === cat) setActiveFilter('All');
    onNotify(`Category "${cat}" removed`);
  };

  const handleUpload = async () => {
    if (!selectedFile || !newImage.title) {
      onNotify('Please enter a title and select a file', 'error');
      return;
    }
    setUploading(true);
    const fileName = `${Date.now()}-${selectedFile.name}`;
    const { error: uploadError } = await supabase.storage.from('portfolio').upload(fileName, selectedFile);
    if (uploadError) { onNotify('Error uploading image', 'error'); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(fileName);
    const { data, error } = await supabase.from('portfolio').insert({
      url: urlData.publicUrl,
      title: newImage.title,
      category: newImage.category,
    }).select().single();
    if (error) { onNotify('Error saving image', 'error'); setUploading(false); return; }
    setPortfolioImages(prev => [{ id: data.id.toString(), url: urlData.publicUrl, title: data.title, category: data.category }, ...prev]);
    setNewImage({ title: '', category: categories.find(c => c !== 'All') || 'Art' });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploading(false);
    onNotify('Portfolio image added!');
  };

  const handleDeleteImage = async (id: string, url: string) => {
    if (!window.confirm('Delete this image?')) return;
    const fileName = url.split('/').pop();
    if (fileName) await supabase.storage.from('portfolio').remove([fileName]);
    const { error } = await supabase.from('portfolio').delete().eq('id', id);
    if (error) { onNotify('Error deleting image', 'error'); return; }
    setPortfolioImages(prev => prev.filter(img => img.id !== id));
    onNotify('Image removed');
  };

  const filteredImages = useMemo(() => {
    if (activeFilter === 'All') return portfolioImages;
    return portfolioImages.filter(img => img.category === activeFilter);
  }, [portfolioImages, activeFilter]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.estimated_total || 0), 0);
    const todayBookings = bookings.filter(b => b.date === today);
    const upcomingDates = Object.keys(availableTimes).filter(
      d => new Date(d) >= new Date(new Date().setHours(0, 0, 0, 0))
    );
    return {
      total: bookings.length,
      todayCount: todayBookings.length,
      revenue: totalRevenue,
      upcomingSlots: upcomingDates.length,
    };
  }, [bookings, availableTimes]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysCount = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysCount; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentMonth]);

  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    bookings.forEach(b => {
      if (!grouped[b.date]) grouped[b.date] = [];
      grouped[b.date].push(b);
    });
    return grouped;
  }, [bookings]);

  const activeDateBookings = activeDate ? (bookingsByDate[activeDate] || []) : [];

  const parseTime = (t: string) => {
    const [timePart, period] = t.split(' ');
    let [h, m] = timePart.split(':').map(Number);
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + (m || 0);
  };

  const addTime = async (dateStr: string, time: string) => {
    if (!time.trim()) return;
    const currentTimes = availableTimes[dateStr] || [];
    if (currentTimes.includes(time)) return;
    const { error } = await supabase.from('availabilities').insert({ date: dateStr, time });
    if (error) { onNotify('Error adding time', 'error'); return; }
    const newTimes = [...currentTimes, time].sort((a, b) => parseTime(a) - parseTime(b));
    setAvailableTimes(prev => ({ ...prev, [dateStr]: newTimes }));
    onNotify('Slot ' + time + ' added');
  };

  const removeTime = async (dateStr: string, time: string) => {
    const { error } = await supabase.from('availabilities').delete().eq('date', dateStr).eq('time', time);
    if (error) { onNotify('Error removing time', 'error'); return; }
    setAvailableTimes(prev => ({ ...prev, [dateStr]: (prev[dateStr] || []).filter(t => t !== time) }));
    onNotify('Slot ' + time + ' removed');
  };

  const clearDate = async (dateStr: string) => {
    if (!window.confirm('Clear all slots for this date?')) return;
    const { error } = await supabase.from('availabilities').delete().eq('date', dateStr);
    if (error) { onNotify('Error clearing date', 'error'); return; }
    setAvailableTimes(prev => { const u = { ...prev }; delete u[dateStr]; return u; });
    onNotify('Date cleared');
  };

  const deleteBooking = async (dateStr: string, time: string) => {
    if (!window.confirm('Remove this booking?')) return;
    const { error } = await supabase.from('bookings').delete().eq('date', dateStr).eq('time', time);
    if (error) { onNotify('Error removing booking', 'error'); return; }
    setBookings(prev => prev.filter(b => !(b.date === dateStr && b.time === time)));
    onNotify('Booking removed');
  };

  const handleCustomTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDate || !customTimeNum) return;
    let t = customTimeNum;
    if (!t.includes(':')) t = t.length <= 2 ? t + ':00' : t.slice(0, -2) + ':' + t.slice(-2);
    addTime(activeDate, t + ' ' + customTimePeriod);
    setCustomTimeNum('');
  };

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.toLowerCase();
    return bookings.filter(b =>
      b.customer_name?.toLowerCase().includes(q) ||
      b.service?.toLowerCase().includes(q) ||
      b.contact_detail?.toLowerCase().includes(q)
    );
  }, [bookings, searchQuery]);

  const statCards = [
    { label: 'Total Bookings', value: stats.total, icon: 'CAL', color: 'from-pink-500/20' },
    { label: "Today's Appointments", value: stats.todayCount, icon: 'NOW', color: 'from-purple-500/20' },
    { label: 'Est. Revenue', value: '$' + stats.revenue, icon: 'REV', color: 'from-green-500/20' },
    { label: 'Available Days', value: stats.upcomingSlots, icon: 'AVL', color: 'from-blue-500/20' },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d14]">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0d0d14]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-white font-black text-sm uppercase tracking-[0.3em]">NailzByFred</h1>
              <p className="text-white/30 text-[9px] uppercase tracking-widest font-bold">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Live</span>
            <button
              onClick={onLogout}
              className="ml-6 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/5"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-10 bg-white/5 p-1.5 rounded-2xl w-fit">
          {(['overview', 'schedule', 'bookings', 'portfolio'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                'px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ' +
                (activeTab === tab
                  ? 'bg-brand-pink text-brand-deep shadow-lg'
                  : 'text-white/40 hover:text-white/70')
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((s, i) => (
                <div key={i} className={'p-6 rounded-3xl border border-white/5 bg-gradient-to-br ' + s.color + ' bg-white/5'}>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-3 block">{s.icon}</span>
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-2">{s.label}</p>
                  <p className="text-white font-black text-3xl">{loading ? '...' : s.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-white font-black text-sm uppercase tracking-widest">Recent Bookings</h3>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-brand-pink text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {loading ? (
                  <div className="p-8 text-center text-white/20 text-xs italic">Loading...</div>
                ) : bookings.slice(0, 5).length === 0 ? (
                  <div className="p-8 text-center text-white/20 text-xs italic">No bookings yet.</div>
                ) : bookings.slice(0, 5).map((b, i) => (
                  <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-pink/20 rounded-2xl flex items-center justify-center text-brand-pink font-black text-sm">
                        {b.customer_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{b.customer_name}</p>
                        <p className="text-white/30 text-[10px] font-medium italic">{b.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-[10px] font-black">{b.date}</p>
                      <p className="text-brand-pink font-black text-xs">{b.time}</p>
                    </div>
                    <span className="ml-6 text-white font-black text-sm">${b.estimated_total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white/5 border border-white/5 p-8 md:p-10 rounded-[3rem] shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-white font-bold text-xl">
                  {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                    className="p-2.5 bg-white/5 rounded-xl hover:bg-brand-pink/20 transition-all text-white/60 hover:text-white"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                    className="p-2.5 bg-white/5 rounded-xl hover:bg-brand-pink/20 transition-all text-white/60 hover:text-white"
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-center text-[9px] font-black text-white/20 uppercase pb-3">{d}</div>
                ))}
                {calendarDays.map((date, idx) => {
                  if (!date) return <div key={idx} />;
                  const dateStr = date.toDateString();
                  const isActive = activeDate === dateStr;
                  const hasSlots = (availableTimes[dateStr] || []).length > 0;
                  const hasBookings = (bookingsByDate[dateStr] || []).length > 0;
                  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveDate(isActive ? null : dateStr)}
                      className={
                        'relative w-full aspect-square flex flex-col items-center justify-center rounded-2xl text-xs font-black transition-all border ' +
                        (isActive
                          ? 'bg-brand-pink text-brand-deep border-brand-pink shadow-lg scale-110 z-10'
                          : isPast
                          ? 'bg-white/3 text-white/15 border-transparent cursor-not-allowed'
                          : hasSlots
                          ? 'bg-brand-pink/10 text-brand-pink border-brand-pink/30 hover:bg-brand-pink/20'
                          : 'bg-white/5 text-white/30 border-white/5 hover:border-brand-pink/30 hover:text-white/60')
                      }
                    >
                      {date.getDate()}
                      {hasSlots && !isActive && (
                        <span className="absolute bottom-1 w-1 h-1 bg-brand-pink rounded-full"></span>
                      )}
                      {hasBookings && !isActive && (
                        <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-6 mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/30">
                  <span className="w-2 h-2 bg-brand-pink rounded-full"></span> Available
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/30">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span> Has Bookings
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 sticky top-28">
              {activeDate ? (
                <div className="bg-white/5 border border-white/5 p-8 rounded-[3rem] space-y-7">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-brand-pink text-[9px] font-black uppercase tracking-[0.4em] mb-2">Manage Day</p>
                      <h3 className="text-white text-xl font-bold">
                        {new Date(activeDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </h3>
                    </div>
                    <button
                      onClick={() => clearDate(activeDate)}
                      className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all text-xs font-black"
                    >
                      Clear
                    </button>
                  </div>

                  {activeDateBookings.length > 0 && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">
                        Bookings ({activeDateBookings.length})
                      </p>
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {activeDateBookings
                          .sort((a, b) => parseTime(a.time) - parseTime(b.time))
                          .map((booking, i) => (
                            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 group flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[9px] font-black bg-brand-pink/20 text-brand-pink px-2 py-0.5 rounded-full">{booking.time}</span>
                                  <span className="text-green-400 font-black text-[10px]">${booking.estimated_total}</span>
                                </div>
                                <p className="text-white font-bold text-xs">{booking.customer_name}</p>
                                <p className="text-white/30 text-[9px] italic">{booking.service}</p>
                              </div>
                              <button
                                onClick={() => deleteBooking(activeDate, booking.time)}
                                className="w-7 h-7 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all text-xs"
                              >
                                X
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleCustomTimeSubmit} className="space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Add Time Slot</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="e.g. 10:30"
                        className="flex-grow p-4 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-white outline-none focus:border-brand-pink transition-all"
                        value={customTimeNum}
                        onChange={e => setCustomTimeNum(e.target.value.replace(/[^0-9:]/g, ''))}
                      />
                      <select
                        className="p-4 bg-white/5 border border-white/5 rounded-xl text-xs font-black uppercase text-white/70 cursor-pointer outline-none"
                        value={customTimePeriod}
                        onChange={e => setCustomTimePeriod(e.target.value)}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-brand-pink text-brand-deep p-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                    >
                      + Add Slot
                    </button>
                  </form>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">Quick Presets</p>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_TIME_SLOTS.map(slot => {
                        const isSelected = (availableTimes[activeDate] || []).includes(slot);
                        return (
                          <button
                            key={slot}
                            onClick={() => isSelected ? removeTime(activeDate, slot) : addTime(activeDate, slot)}
                            className={
                              'px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ' +
                              (isSelected
                                ? 'bg-brand-pink text-brand-deep border-brand-pink'
                                : 'bg-white/5 text-white/30 border-white/5 hover:border-brand-pink/30 hover:text-white/60')
                            }
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">Current Slots</p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {(availableTimes[activeDate] || []).length > 0 ? (
                        (availableTimes[activeDate] || []).map(time => {
                          const isBooked = activeDateBookings.some(b => b.time === time);
                          return (
                            <div
                              key={time}
                              className={
                                'flex items-center justify-between px-4 py-3 rounded-xl group border ' +
                                (isBooked
                                  ? 'bg-green-500/5 border-green-500/20'
                                  : 'bg-white/5 border-white/5 hover:border-brand-pink/20')
                              }
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-white/70">{time}</span>
                                {isBooked && (
                                  <span className="text-[8px] font-black uppercase tracking-widest text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                                    Booked
                                  </span>
                                )}
                              </div>
                              {!isBooked && (
                                <button
                                  onClick={() => removeTime(activeDate, time)}
                                  className="text-red-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-xs font-black"
                                >
                                  X
                                </button>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-white/15 italic text-[10px] py-3">No slots set for this day.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] text-white/15 italic text-sm text-center px-8">
                  Select a date to manage availability
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search by name, service, contact..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full p-4 pl-10 bg-white/5 border border-white/5 rounded-2xl text-white text-xs font-medium outline-none focus:border-brand-pink transition-all placeholder:text-white/20"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm font-black">S</span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
              <div className="px-8 py-5 border-b border-white/5 grid grid-cols-12 gap-4">
                {[
                  { label: 'Client', span: 'col-span-2' },
                  { label: 'Service', span: 'col-span-3' },
                  { label: 'Date & Time', span: 'col-span-2' },
                  { label: 'Contact', span: 'col-span-3' },
                  { label: 'Total', span: 'col-span-1' },
                  { label: '', span: 'col-span-1' },
                ].map((h, i) => (
                  <div key={i} className={'text-[9px] font-black uppercase tracking-widest text-white/25 ' + h.span}>
                    {h.label}
                  </div>
                ))}
              </div>
              <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <div className="p-10 text-center text-white/20 italic text-xs">Loading...</div>
                ) : filteredBookings.length === 0 ? (
                  <div className="p-10 text-center text-white/20 italic text-xs">No bookings found.</div>
                ) : filteredBookings.map((b, i) => (
                  <div key={i} className="px-8 py-5 grid grid-cols-12 gap-4 items-center hover:bg-white/5 transition-colors group">
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-pink/20 rounded-xl flex items-center justify-center text-brand-pink font-black text-xs flex-shrink-0">
                        {b.customer_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-white font-bold text-xs truncate">{b.customer_name}</span>
                    </div>
                    <div className="col-span-3">
                      <p className="text-white/70 text-xs font-medium truncate">{b.service}</p>
                      {b.addons && b.addons.length > 0 && (
                        <p className="text-white/25 text-[9px] italic">
                          +{b.addons.length} add-on{b.addons.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <p className="text-white/50 text-[10px] font-medium">{b.date}</p>
                      <p className="text-brand-pink font-black text-[10px]">{b.time}</p>
                    </div>
                    <div className="col-span-3">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/25 bg-white/5 px-2 py-0.5 rounded-full">
                        {b.contact_method}
                      </span>
                      <p className="text-white/50 text-[10px] mt-1 truncate">{b.contact_detail}</p>
                    </div>
                    <div className="col-span-1 text-white font-black text-sm">${b.estimated_total}</div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => deleteBooking(b.date, b.time)}
                        className="w-7 h-7 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all text-xs font-black"
                      >
                        X
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-white/20 text-[9px] font-black uppercase tracking-widest">
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} shown
            </p>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-8">
            {/* Upload Panel */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
              <h3 className="text-white font-black text-sm uppercase tracking-widest mb-6">Add New Image</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Glow Set"
                    className="w-full p-4 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-white outline-none focus:border-brand-pink transition-all placeholder:text-white/20"
                    value={newImage.title}
                    onChange={e => setNewImage({ ...newImage, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Category</label>
                  <select
                    className="w-full p-4 bg-white/5 border border-white/5 rounded-xl text-xs font-black text-white/70 outline-none focus:border-brand-pink transition-all cursor-pointer"
                    value={newImage.category}
                    onChange={e => setNewImage({ ...newImage, category: e.target.value })}
                  >
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="w-full p-3.5 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-white/50 outline-none cursor-pointer"
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                    disabled={uploading}
                  />
                </div>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile || !newImage.title}
                  className="w-full bg-brand-pink text-brand-deep p-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : '+ Upload'}
                </button>
              </div>

              {/* Category Manager */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <button
                  onClick={() => setShowCatManager(v => !v)}
                  className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
                >
                  <span className={`transition-transform text-[8px] ${showCatManager ? 'rotate-90' : ''}`}>▶</span>
                  Manage Categories
                </button>
                {showCatManager && (
                  <div className="mt-5 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {categories.filter(c => c !== 'All').map(cat => (
                        <div key={cat} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                          <span className="text-xs font-bold text-white/60">{cat}</span>
                          <button
                            onClick={() => handleRemoveCategory(cat)}
                            className="w-4 h-4 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center text-[9px] hover:bg-red-500 hover:text-white transition-all font-black"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                        placeholder="New category name"
                        className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-white outline-none focus:border-brand-pink transition-all w-48 placeholder:text-white/20"
                      />
                      <button
                        onClick={handleAddCategory}
                        disabled={!newCatName.trim()}
                        className="px-5 py-3 bg-brand-pink/20 text-brand-pink rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-brand-pink hover:text-brand-deep transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={
                    'px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ' +
                    (activeFilter === cat
                      ? 'bg-brand-pink text-brand-deep border-brand-pink'
                      : 'bg-white/5 text-white/30 border-white/5 hover:border-brand-pink/30 hover:text-white/60')
                  }
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Image Grid */}
            {portfolioLoading ? (
              <div className="p-20 text-center text-white/20 italic text-xs">Loading...</div>
            ) : filteredImages.length === 0 ? (
              <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl text-white/15 italic text-sm">
                No images yet. Upload one above!
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map(img => (
                  <div key={img.id} className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-white font-bold text-xs truncate">{img.title}</p>
                      <span className="text-[8px] font-black uppercase tracking-widest text-brand-pink">{img.category}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteImage(img.id, img.url)}
                      className="absolute top-3 right-3 w-8 h-8 bg-red-500/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 text-xs font-black"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-white/20 text-[9px] font-black uppercase tracking-widest">
              {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''} shown
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
