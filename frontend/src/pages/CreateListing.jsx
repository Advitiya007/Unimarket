import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import MainLayout from '../layouts/MainLayout';
import { CATEGORIES, CONDITIONS, MEETUP_LOCATIONS } from '../utils/constants';
import api from '../services/api';

export default function CreateListing() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [images, setImages] = useState([]); // { file, preview }
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '', price: '', condition: '',
    brand: '', meetupLocation: '', meetupNotes: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addFiles = (fileList) => {
    const files = Array.from(fileList).slice(0, 5 - images.length);
    const mapped = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...mapped].slice(0, 5));
  };

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error('Add at least one image');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append('images', img.file));

      const { data } = await api.post('/listings', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Listing published!');
      navigate(`/listings/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-5 py-14">
        <p className="eyebrow">New listing</p>
        <h1 className="h-display mt-2 text-4xl text-campus-ink">Sell something on campus</h1>
        <p className="mt-2 text-sm text-campus-ink/50">
          Your listing stays live for 7 days and is only visible to verified NIT Jalandhar students.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          {/* Image upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-campus-ink">Photos (up to 5)</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
                dragActive ? 'border-campus-blue-400 bg-campus-blue-50' : 'border-campus-ink/15 bg-white'
              }`}
            >
              <FiUploadCloud size={28} className="text-campus-ink/30" />
              <p className="mt-2 text-sm text-campus-ink/60">Drag and drop images, or click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {images.map((img, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-campus-ink/10">
                    <img src={img.preview} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Title</label>
            <input name="title" required value={form.title} onChange={handleChange}
              placeholder="e.g. Data Structures Textbook (3rd Edition)" className="input-field" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Description</label>
            <textarea name="description" required rows={4} value={form.description} onChange={handleChange}
              placeholder="Condition details, why you're selling, anything a buyer should know…"
              className="input-field resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Category</label>
              <select name="category" required value={form.category} onChange={handleChange} className="input-field">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Condition</label>
              <select name="condition" required value={form.condition} onChange={handleChange} className="input-field">
                <option value="">Select condition</option>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Price (₹)</label>
              <input type="number" name="price" required min="0" value={form.price} onChange={handleChange}
                placeholder="500" className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Brand (optional)</label>
              <input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. HP, Hero" className="input-field" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Campus Meetup Location</label>
            <select name="meetupLocation" required value={form.meetupLocation} onChange={handleChange} className="input-field">
              <option value="">Select location</option>
              {MEETUP_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Meetup Notes (optional)</label>
            <input name="meetupNotes" value={form.meetupNotes} onChange={handleChange}
              placeholder='e.g. "Near Library Gate", "Outside Hostel 7"' className="input-field" />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Publishing…' : 'Publish Listing →'}
          </button>
        </form>
      </div>
    </MainLayout>
  );
}
