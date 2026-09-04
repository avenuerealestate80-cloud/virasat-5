import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, ImageIcon, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  className?: string;
  aspectRatio?: string;
}

export function ImageUpload({ value, onChange, label = 'Image', folder = 'properties', className = '', aspectRatio = 'aspect-video' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }
    setError(null);
    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('property-images').upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(fileName);
    onChange(urlData.publicUrl);
    setUploading(false);
  }, [folder, onChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      {value ? (
        <div className={`relative ${aspectRatio} rounded-xl overflow-hidden border border-slate-200 group`}>
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button type="button" onClick={() => inputRef.current?.click()} className="px-3 py-1.5 bg-white/90 text-slate-800 rounded-lg text-xs font-medium mr-2 hover:bg-white">
              Replace
            </button>
            <button type="button" onClick={() => onChange('')} className="px-3 py-1.5 bg-red-500/90 text-white rounded-lg text-xs font-medium hover:bg-red-500">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`${aspectRatio} rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${dragOver ? 'border-gold-400 bg-gold-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}
        >
          {uploading ? (
            <Loader2 size={28} className="text-slate-400 animate-spin" />
          ) : (
            <>
              <Upload size={24} className="text-slate-400 mb-2" />
              <span className="text-xs text-slate-500 font-medium">Click or drag to upload</span>
              <span className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 5MB</span>
            </>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}
    </div>
  );
}

interface GalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  folder?: string;
}

export function GalleryUpload({ value, onChange, label = 'Gallery Images', folder = 'properties' }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    if (valid.length === 0) { setError('No valid images (must be under 5MB)'); return; }
    setError(null);
    setUploading(true);
    const urls: string[] = [];
    for (const file of valid) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('property-images').upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(fileName);
        urls.push(urlData.publicUrl);
      }
    }
    onChange([...value, ...urls]);
    setUploading(false);
  };

  const removeImage = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const moveImage = (idx: number, dir: 'left' | 'right') => {
    const newArr = [...value];
    const swap = dir === 'left' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= newArr.length) return;
    [newArr[idx], newArr[swap]] = [newArr[swap], newArr[idx]];
    onChange(newArr);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={(e) => e.target.files && uploadFiles(e.target.files)} className="hidden" />
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {value.map((url, idx) => (
          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
            <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
              <button type="button" onClick={() => moveImage(idx, 'left')} disabled={idx === 0} className="p-1 bg-white/80 rounded text-slate-700 disabled:opacity-30">←</button>
              <button type="button" onClick={() => removeImage(idx)} className="p-1 bg-red-500/80 rounded text-white"><X size={14} /></button>
              <button type="button" onClick={() => moveImage(idx, 'right')} disabled={idx === value.length - 1} className="p-1 bg-white/80 rounded text-slate-700 disabled:opacity-30">→</button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:border-slate-400 hover:bg-slate-50 transition-colors"
        >
          {uploading ? <Loader2 size={20} className="text-slate-400 animate-spin" /> : <><ImageIcon size={20} className="text-slate-400 mb-1" /><span className="text-xs text-slate-500">Add</span></>}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}
    </div>
  );
}
