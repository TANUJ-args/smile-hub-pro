import React, { useState, useRef } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Crop as CropIcon, X, Check } from 'lucide-react';

interface ImageCropperProps {
  image: string;
  onCrop: (croppedImage: string) => void;
  open: boolean;
  onClose: () => void;
}

export default function ImageCropper({ image, onCrop, open, onClose }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  const [completedCrop, setCompletedCrop] = useState<any>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const getCroppedImg = () => {
    if (!completedCrop || !imgRef.current) return;
    
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return;
    }
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );
    
    // Convert to base64
    const base64Image = canvas.toDataURL('image/jpeg');
    onCrop(base64Image);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CropIcon className="mr-2 h-5 w-5" />
            Crop Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="my-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={undefined}
          >
            <img
              ref={imgRef}
              src={image}
              alt="Crop preview"
              className="max-h-[60vh] object-contain"
            />
          </ReactCrop>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={getCroppedImg}>
            <Check className="mr-2 h-4 w-4" />
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
