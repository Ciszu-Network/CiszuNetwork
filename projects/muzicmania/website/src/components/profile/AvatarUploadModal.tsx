import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/config/supabase';

const EasyCropper = Cropper as any;

const X = ({ className = 'w-4 h-4' }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const Check = ({ className = 'w-4 h-4' }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const Upload = ({ className = 'w-4 h-4' }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const RefreshCw = ({ className = 'w-4 h-4' }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>;

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onUploadSuccess: (url: string) => void;
}

export default function AvatarUploadModal({ isOpen, onClose, userId, onUploadSuccess }: AvatarUploadModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Limit size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen es muy pesada. Límite: 5MB.');
        return;
      }

      setError('');
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async (): Promise<Blob | null> => {
    if (!imageSrc || !croppedAreaPixels) return null;
    
    const image = new Image();
    image.src = imageSrc;
    await new Promise(resolve => image.onload = resolve);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = 400; // Output resolution 400x400
    canvas.height = 400;

    // Advanced rotation & cropping logic
    ctx.translate(200, 200);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-200, -200);

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      400,
      400
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleSave = async () => {
    try {
      setIsUploading(true);
      setError('');
      
      const blob = await createCroppedImage();
      if (!blob) throw new Error('Error al procesar la imagen.');

      // Nota sobre Moderación: Aquí se podría llamar a una API de moderación (Sightengine, AWS Rekognition)
      // para validar si la imagen es +18 o gore antes de subirla al bucket.

      const fileExt = 'jpeg';
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) {
        throw new Error('Error al subir la imagen. Verifica que el bucket "avatars" exista y tenga permisos.');
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Actualizar perfil
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (dbError) throw dbError;

      onUploadSuccess(publicUrl);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error desconocido.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-header font-black italic uppercase text-2xl text-neon-blue">Foto de Perfil</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}

          {!imageSrc ? (
            <div className="relative border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-neon-blue/50 hover:bg-neon-blue/5 transition-all cursor-pointer">
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/webp" 
                onChange={onFileChange} 
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="font-header font-bold uppercase tracking-widest text-sm text-white">Haz click o arrastra tu imagen</p>
              <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase">JPG, PNG, WEBP (Max 5MB)</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative w-full h-64 bg-black rounded-2xl overflow-hidden">
                <EasyCropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Zoom</label>
                  <input 
                    type="range" 
                    value={zoom} 
                    min={1} 
                    max={3} 
                    step={0.1}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-neon-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Rotación</label>
                  <input 
                    type="range" 
                    value={rotation} 
                    min={0} 
                    max={360} 
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full accent-neon-blue"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setImageSrc(null)} 
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold uppercase text-xs transition-colors"
                >
                  Cambiar
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isUploading}
                  className="flex-1 py-3 bg-neon-blue text-black font-black uppercase text-xs rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                  {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {isUploading ? 'Guardando...' : 'Aplicar'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
