import { useCallback, useState, useEffect, useRef } from 'react';
import { X, Upload, Loader } from 'lucide-react';
import { PhotoItem } from '@/types';
import { buildUploadUrl } from '@/lib/uploads';

function generateRandomFilename(extension = 'jpg') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let filename = '';
  for (let i = 0; i < 16; i++) {
    filename += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${filename}.${extension}`;
}

interface PhotoDropzoneProps {
  photos: string[];
  setPhotos: (photos: string[]) => void;
  uploadImage: (file: File, filename?: string) => Promise<string>;
}

export default function PhotoDropzone({ photos, setPhotos, uploadImage }: PhotoDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>([]);
  const isInternalSyncRef = useRef(false);

  
  const allowedFormats = ['jpg', 'jpeg', 'png', 'webp'];

  
  const isValidFileFormat = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension && allowedFormats.includes(extension);
  };

  
  useEffect(() => {
    if (isInternalSyncRef.current) {
      isInternalSyncRef.current = false;
      return;
    }

    setPhotoItems(prevItems => {
      const committedFilenames = prevItems
        .filter(item => item.filename && !item.isUploading)
        .map(item => item.filename);

      if (JSON.stringify(committedFilenames) === JSON.stringify(photos)) {
        return prevItems;
      }

      if (Array.isArray(photos) && photos.length > 0) {
        return photos.map(filename => ({
          id: filename,
          filename,
        }));
      }

      return [];
    });
  }, [photos]);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      
      
      const invalidFiles = Array.from(files).filter(file => !isValidFileFormat(file));
      if (invalidFiles.length > 0) {
        setError("Format de fichier invalide. Seuls les formats JPG, PNG et WebP sont acceptés.");
        return;
      }

      setUploading(true);

      try {
        const newItems: PhotoItem[] = [];
        
        
        for (const file of Array.from(files)) {
          const previewUrl = URL.createObjectURL(file);
          const tempId = `temp_${Date.now()}_${Math.random()}`;
          
          newItems.push({
            id: tempId,
            filename: '',
            previewUrl,
            isUploading: true,
            file,
          });
        }

        
        setPhotoItems(prevItems => [...prevItems, ...newItems]);

        
        for (let i = 0; i < newItems.length; i++) {
          const item = newItems[i];
          const file = item.file!;
          
          try {
            
            const extMatch = file.name.match(/\.(\w+)$/);
            const extension = extMatch ? extMatch[1] : 'jpg';

            
            const randomName = generateRandomFilename(extension);

            
            const filename = await uploadImage(file, randomName);
            
            
            setPhotoItems(prevItems => 
              prevItems.map(prevItem => 
                prevItem.id === item.id 
                  ? { ...prevItem, filename, isUploading: false }
                  : prevItem
              )
            );

            
            if (item.previewUrl) {
              URL.revokeObjectURL(item.previewUrl);
            }

          } catch (uploadError) {
            console.error('Erreur upload:', uploadError);
            
            setPhotoItems(prevItems => {
              const filtered = prevItems.filter(prevItem => prevItem.id !== item.id);
              if (item.previewUrl) {
                URL.revokeObjectURL(item.previewUrl);
              }
              return filtered;
            });
          }
        }

      } catch (e) {
        setError("Erreur lors du téléchargement des images.");
      } finally {
        setUploading(false);
      }
    },
    [uploadImage]
  );

  
  useEffect(() => {
    const finalFilenames = photoItems
      .filter(item => item.filename && !item.isUploading)
      .map(item => item.filename);
    
    if (JSON.stringify(finalFilenames) !== JSON.stringify(photos)) {
      isInternalSyncRef.current = true;
      setPhotos(finalFilenames);
    }
  }, [photoItems, photos, setPhotos]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (uploading) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length) {
      handleFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploading) return;
    const files = e.target.files;
    if (files && files.length) {
      handleFiles(files);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const item = photoItems[index];
    if (item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
    
    const newItems = photoItems.filter((_, i) => i !== index);
    setPhotoItems(newItems);
    
    const newPhotos = newItems
      .filter(item => item.filename && !item.isUploading)
      .map(item => item.filename);
    setPhotos(newPhotos);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
        onClick={() => !uploading && document.getElementById('fileInput')?.click()}
      >
        <div className="flex flex-col items-center space-y-3">
          <Upload className={`w-12 h-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          {uploading ? (
            <p className="text-blue-500 font-medium">Téléchargement en cours...</p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-700">
                {dragActive ? 'Déposez les images ici' : 'Ajoutez des photos'}
              </p>
              <p className="text-sm text-gray-500">
                Formats acceptés: JPG, PNG, WebP
              </p>
            </>
          )}
        </div>
        <input
          id="fileInput"
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {photoItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photoItems.map((item, index) => (
            <div 
              key={item.id} 
              className={`relative group ${
                index === 0 ? 'md:col-span-2 md:row-span-2' : 
                index === 1 ? 'lg:col-span-1' :
                index === 2 ? 'lg:col-span-1' :
                ''
              }`}
            >
              <div className="w-full h-full rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors aspect-square">
                {item.isUploading ? (
                  <div className="relative w-full h-full">
                    <img
                      src={item.previewUrl}
                      alt={`Upload en cours ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="flex flex-col items-center text-white">
                        <Loader className="w-6 h-6 animate-spin mb-2" />
                        <span className="text-xs font-medium">Upload...</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={buildUploadUrl(item.filename) || ''}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Z"/>
                            </svg>
                            <span class="text-xs text-gray-500">Image indisponible</span>
                          </div>
                        `;
                      }
                    }}
                  />
                )}
              </div>
              
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-lg"
                aria-label="Supprimer la photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
