import { useCallback, useRef } from "react";
import type { ImageFile } from "../types";

interface ImageUploadProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  disabled?: boolean;
}

export function ImageUpload({
  images,
  onImagesChange,
  disabled,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newImages: ImageFile[] = Array.from(files).map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
      }));

      onImagesChange([...images, ...newImages]);
    },
    [images, onImagesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeImage = useCallback(
    (id: string) => {
      const imageToRemove = images.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      onImagesChange(images.filter((img) => img.id !== id));
    },
    [images, onImagesChange]
  );

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="image-upload">
      <div
        className={`upload-zone ${disabled ? "disabled" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/heic,image/heif"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
        />
        <div className="upload-content">
          <svg
            className="upload-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="upload-text">
            Drag and drop images here, or click to select
          </p>
          <p className="upload-hint">Supports JPEG, PNG, HEIC</p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="image-previews">
          {images.map((image) => (
            <div key={image.id} className="image-preview">
              <img src={image.preview} alt={image.file.name} />
              <button
                className="remove-button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(image.id);
                }}
                disabled={disabled}
                aria-label={`Remove ${image.file.name}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <span className="image-name">{image.file.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
