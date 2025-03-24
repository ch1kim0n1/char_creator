import { useEffect, useRef, useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
  const imageRef = useRef(null);
  const [crop, setCrop] = useState({
    unit: 'px',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  });

  const handleCropChange = (newCrop) => {
    if (newCrop.width >= 100 && newCrop.height >= 100) {
      setCrop(newCrop);
    }
  };

  const handleCropComplete = async () => {
    if (!imageRef.current || !crop.width || !crop.height) {
      console.warn('Invalid crop parameters');
      return;
    }

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      imageRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      500,
      500
    );

    canvas.toBlob(blob => {
      if (blob) {
        blob.name = 'cropped-image.jpg';
        onCropComplete(blob);
      }
    }, 'image/jpeg', 1);
  };

  // Modal container that prevents event bubbling
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.stopPropagation();
          onCancel();
        }
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Crop Image</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Drag to move, handles to resize, keep it 1x1 ratio
          </span>
        </div>
        
        <div 
          className="max-h-[70vh] overflow-auto bg-gray-100 dark:bg-gray-900 rounded-xl p-4"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <ReactCrop
            crop={crop}
            onChange={handleCropChange}
            aspect={1}
            minWidth={100}
            minHeight={100}
            className="flex justify-center isolate"
            ruleOfThirds
          >
            <img
              ref={imageRef}
              src={image}
              alt="Crop me"
              className="max-w-full max-h-[60vh] object-contain select-none"
              onDragStart={(e) => e.preventDefault()}
              draggable={false}
            />
          </ReactCrop>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 
                      text-gray-700 dark:text-gray-300 rounded-xl 
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      active:scale-95 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCropComplete();
            }}
            className="px-5 py-2.5 bg-primary text-white rounded-xl 
                      hover:bg-primary/90 active:scale-95 transition-all duration-200
                      shadow-md shadow-primary/20"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
