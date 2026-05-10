import { Camera, ImageUp } from "lucide-react";
import type { ChangeEvent } from "react";

type CameraUploadProps = {
  imageUrl?: string;
  onImageSelected: (file: File, imageUrl: string) => void;
};

export function CameraUpload({ imageUrl, onImageSelected }: CameraUploadProps) {
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onImageSelected(file, URL.createObjectURL(file));
  }

  return (
    <section className="capture-panel">
      <div className="ticket-preview">
        {imageUrl ? <img src={imageUrl} alt="Ticket seleccionado" /> : <Camera size={54} strokeWidth={1.6} />}
      </div>

      <div className="upload-grid">
        <label className="secondary-button">
          <Camera size={20} />
          Hacer foto
          <input accept="image/*" capture="environment" type="file" onChange={handleFileChange} />
        </label>
        <label className="secondary-button">
          <ImageUp size={20} />
          Subir imagen
          <input accept="image/*" type="file" onChange={handleFileChange} />
        </label>
      </div>
    </section>
  );
}
