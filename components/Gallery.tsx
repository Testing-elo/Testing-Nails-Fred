
import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../LanguageContext';
import { GalleryImage } from '../types';

const CATEGORIES = ['All', 'Classic', 'Acrylic', 'Art', 'Gel', 'Luxury'];

interface GalleryProps {
  isAdmin?: boolean;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

const Gallery: React.FC<GalleryProps> = ({ isAdmin = false, onNotify }) => {
  const { t, language } = useLanguage();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Admin Form State
  const [newImage, setNewImage] = useState({ url: '', title: '', category: 'Art' });

  useEffect(() => {
    const savedImages = localStorage.getItem('nailzbyfred_gallery');
    if (savedImages) {
      setImages(JSON.parse(savedImages));
    }
  }, []);

  const filteredImages = useMemo(() => {
    if (activeFilter === 'All') return images;
    return images.filter(img => img.category === activeFilter);
  }, [images, activeFilter]);

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage.url || !newImage.title) {
      onNotify?.("Missing information", 'error');
      return;
    }
    
    const imageToAdd: GalleryImage = {
      id: Date.now().toString(),
      ...newImage
    };
    
    const updated = [imageToAdd, ...images];
    setImages(updated);
    localStorage.setItem('nailzbyfred_gallery', JSON.stringify(updated));
    setNewImage({ url: '', title: '', category: 'Art' });
    onNotify?.("Portfolio Masterpiece Added!");
  };

  const handleDeleteImage = (id: string) => {
    if (!window.confirm("Delete this masterpiece?")) return;
    const updated = images.filter(img => img.id !== id);
    setImages(updated);
    localStorage.setItem('nailzbyfred_gallery', JSON.stringify(updated));
    onNotify?.("Image removed from portfolio");
  };

  return (
    <section id="gallery" className="py-20 md:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 md:mb-16 gap-6 md:gap-8">
          <div className="text-center md:text-left flex-grow">
            <span className="inline-block text-brand-pink font-black text-[9px] md:text-[10px] uppercase tracking-[0.5em] mb-3 md:mb-4">✦ Showcase ✦</span>
            <h2 className="text-4xl md:text-6xl font-bold serif text-brand-deep mb-4">
              {t.gallery.title}
            </h2>
            <div className="w-20 md:w-24 h-1.5 bg-brand-pink rounded-full mx-auto md:mx-0"></div>
          </div>
        </div>

        {/* Admin Upload Panel */}
        {isAdmin && (
          <div className="mb-20 bg-gray-50 p-10 md:p-14 rounded-[4rem] border-4 border-dashed border-brand-pink/30 animate-fade-in">
            <h3 className="text-2xl font-bold serif text-brand-deep mb-8 flex items-center gap-4">
              <span className="text-brand-pink">✦</span> Add New Portfolio Item
            </h3>
            <form onSubmit={handleAddImage} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Image URL</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-white rounded-2xl border-2 border-transparent focus:border-brand-pink outline-none text-xs font-bold shadow-sm"
                  placeholder="https://..."
                  value={newImage.url}
                  onChange={e => setNewImage({...newImage, url: e.target.value})}
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Title</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-white rounded-2xl border-2 border-transparent focus:border-brand-pink outline-none text-xs font-bold shadow-sm"
                  placeholder="Glow Set"
                  value={newImage.title}
                  onChange={e => setNewImage({...newImage, title: e.target.value})}
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Category</label>
                <select 
                  className="w-full p-4 bg-white rounded-2xl border-2 border-transparent focus:border-brand-pink outline-none text-xs font-bold appearance-none shadow-sm cursor-pointer"
                  value={newImage.category}
                  onChange={e => setNewImage({...newImage, category: e.target.value})}
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" className="bg-brand-deep text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-pink hover:text-brand-deep transition-all shadow-xl hover:scale-105 active:scale-95">
                Update Portfolio
              </button>
            </form>
          </div>
        )}

        {/* Filter Section */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 mb-12 md:mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-6 py-2.5 md:px-8 md:py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all duration-300 border-2 ${
                activeFilter === cat 
                ? 'bg-brand-deep border-brand-deep text-white shadow-xl scale-105 md:scale-110' 
                : 'bg-white border-gray-50 text-gray-300 hover:border-brand-pink hover:text-brand-pink'
              }`}
            >
              {cat === 'All' ? (language === 'fr' ? 'Tout' : 'All') : cat}
            </button>
          ))}
        </div>

        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {filteredImages.map((img) => (
              <div 
                key={img.id} 
                className="group relative bg-white rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 border-4 border-white animate-fade-in"
              >
                <div className="aspect-[4/5] overflow-hidden bg-gray-50 relative">
                  <img 
                    src={img.url} 
                    alt={img.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  {isAdmin && (
                    <button 
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-6 right-6 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  )}
                </div>
                <div className="p-8 md:p-10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-brand-pink bg-brand-pink/10 px-4 py-1.5 rounded-full">
                      {img.category}
                    </span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold text-brand-deep serif tracking-tight">{img.title}</h4>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 md:py-32 bg-gray-50 rounded-[3rem] md:rounded-[5rem] border-4 border-dashed border-gray-100">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 text-gray-200 shadow-sm">
               <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <p className="text-gray-400 font-bold text-base md:text-lg mb-2">Portfolio is currently empty.</p>
            <p className="text-brand-pink font-black text-[9px] md:text-[10px] uppercase tracking-[0.4em]">✦ Awaiting Fred's Masterpieces ✦</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
