import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../LanguageContext';
import { GalleryImage } from '../types';
import { supabase } from '../services/supabase';

const DEFAULT_CATEGORIES = ['All', 'Classic', 'Acrylic', 'Art', 'Gel', 'Luxury'];

interface GalleryProps {
  isAdmin?: boolean;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

const Gallery: React.FC<GalleryProps> = ({ isAdmin = false, onNotify }) => {
  const { t, language } = useLanguage();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [uploading, setUploading] = useState(false);
  const [newImage, setNewImage] = useState({ title: '', category: 'Art' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Admin category management state
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
      if (data) setImages(data.map((row: any) => ({ id: row.id.toString(), url: row.url, title: row.title, category: row.category })));
    };
    fetchImages();

    // Load saved categories from localStorage
    const saved = localStorage.getItem('portfolio_categories');
    if (saved) {
      try {
        const parsed: string[] = JSON.parse(saved);
        setCategories(parsed);
        // Sync the upload form's category to the first real category available
        const firstReal = parsed.find(c => c !== 'All');
        if (firstReal) setNewImage(prev => ({ ...prev, category: firstReal }));
      } catch {}
    }
  }, []);

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
    onNotify?.(`Category "${trimmed}" added`);
  };

  const handleRemoveCategory = (cat: string) => {
    if (cat === 'All') return;
    const updated = categories.filter(c => c !== cat);
    saveCategories(updated);
    if (activeFilter === cat) setActiveFilter('All');
    onNotify?.(`Category "${cat}" removed`);
  };

  const filteredImages = useMemo(() => {
    if (activeFilter === 'All') return images;
    return images.filter(img => img.category === activeFilter);
  }, [images, activeFilter]);

  const handleUpload = async () => {
    if (!selectedFile || !newImage.title) {
      onNotify?.("Please enter a title and select a file", 'error');
      return;
    }

    setUploading(true);

    const fileName = `${Date.now()}-${selectedFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from('portfolio')
      .upload(fileName, selectedFile);

    if (uploadError) {
      onNotify?.("Error uploading image", 'error');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('portfolio')
      .getPublicUrl(fileName);

    const { data, error } = await supabase.from('portfolio').insert({
      url: urlData.publicUrl,
      title: newImage.title,
      category: newImage.category
    }).select().single();

    if (error) {
      onNotify?.("Error saving image", 'error');
      setUploading(false);
      return;
    }

    setImages(prev => [{ id: data.id.toString(), url: urlData.publicUrl, title: data.title, category: data.category }, ...prev]);
    setNewImage({ title: '', category: categories.find(c => c !== 'All') || 'Art' });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploading(false);
    onNotify?.("Portfolio Masterpiece Added!");
  };

  const handleDeleteImage = async (id: string, url: string) => {
    if (!window.confirm("Delete this masterpiece?")) return;

    const fileName = url.split('/').pop();
    if (fileName) {
      await supabase.storage.from('portfolio').remove([fileName]);
    }

    const { error } = await supabase.from('portfolio').delete().eq('id', id);
    if (error) { onNotify?.("Error deleting image", 'error'); return; }

    setImages(prev => prev.filter(img => img.id !== id));
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
          <div className="mb-10 bg-gray-50 p-10 md:p-14 rounded-[4rem] border-4 border-dashed border-brand-pink/30 animate-fade-in">
            <h3 className="text-2xl font-bold serif text-brand-deep mb-8 flex items-center gap-4">
              <span className="text-brand-pink">✦</span> {t.gallery.addTitle}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t.gallery.admin.titleLabel}</label>
                <input
                  type="text"
                  className="w-full p-4 bg-white rounded-2xl border-2 border-transparent focus:border-brand-pink outline-none text-xs font-bold shadow-sm"
                  placeholder="Glow Set"
                  value={newImage.title}
                  onChange={e => setNewImage({...newImage, title: e.target.value})}
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t.gallery.admin.categoryLabel}</label>
                <select
                  className="w-full p-4 bg-white rounded-2xl border-2 border-transparent focus:border-brand-pink outline-none text-xs font-bold appearance-none shadow-sm cursor-pointer"
                  value={newImage.category}
                  onChange={e => setNewImage({...newImage, category: e.target.value})}
                >
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t.gallery.admin.fileLabel}</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="w-full p-4 bg-white rounded-2xl border-2 border-transparent focus:border-brand-pink outline-none text-xs font-bold shadow-sm cursor-pointer"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  disabled={uploading}
                />
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !newImage.title}
                className="bg-brand-deep text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-pink hover:text-brand-deep transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
              >
                {uploading ? t.gallery.admin.uploading : t.gallery.admin.addBtn}
              </button>
            </div>

            {/* Category Manager */}
            <div className="mt-10 border-t-2 border-dashed border-brand-pink/20 pt-8">
              <button
                onClick={() => setShowCatManager(v => !v)}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-deep transition-colors"
              >
                <span className={`transition-transform ${showCatManager ? 'rotate-90' : ''}`}>▶</span>
                {t.gallery.admin.manageCategories}
              </button>

              {showCatManager && (
                <div className="mt-6 animate-fade-in">
                  {/* Existing categories */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {categories.filter(c => c !== 'All').map(cat => (
                      <div key={cat} className="flex items-center gap-2 bg-white border-2 border-gray-100 rounded-xl px-4 py-2 shadow-sm">
                        <span className="text-xs font-bold text-brand-deep">{cat}</span>
                        <button
                          onClick={() => handleRemoveCategory(cat)}
                          className="w-5 h-5 bg-red-100 text-red-400 rounded-full flex items-center justify-center text-[10px] hover:bg-red-500 hover:text-white transition-all font-black"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                  {/* Add new category */}
                  <div className="flex gap-4 items-center">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                      placeholder={t.gallery.admin.newCategoryPlaceholder}
                      className="p-3 bg-white rounded-2xl border-2 border-transparent focus:border-brand-pink outline-none text-xs font-bold shadow-sm w-48"
                    />
                    <button
                      onClick={handleAddCategory}
                      disabled={!newCatName.trim()}
                      className="px-6 py-3 bg-brand-pink/20 text-brand-deep rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-pink hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {t.gallery.admin.addCategoryBtn}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 mb-12 md:mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-6 py-2.5 md:px-8 md:py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all duration-300 border-2 ${
                activeFilter === cat
                ? 'bg-brand-deep border-brand-deep text-white shadow-xl scale-105 md:scale-110'
                : 'bg-white border-gray-50 text-gray-300 hover:border-brand-pink hover:text-brand-pink'
              }`}
            >
              {cat === 'All' ? t.gallery.categories.all : cat}
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
                      onClick={() => handleDeleteImage(img.id, img.url)}
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
            <p className="text-gray-400 font-bold text-base md:text-lg mb-2">{t.gallery.emptyMessage}</p>
            <p className="text-brand-pink font-black text-[9px] md:text-[10px] uppercase tracking-[0.4em]">✦ {t.gallery.emptySubtitle} ✦</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
