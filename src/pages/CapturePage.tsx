import { Camera } from "lucide-react";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { extractTicketFromImage } from "../features/extraction/extraction.api";
import { useAppStore } from "../features/app/app.store";

export function CapturePage() {
  const setStep = useAppStore((state) => state.setStep);
  const setTicketFromExtraction = useAppStore((state) => state.setTicketFromExtraction);
  const [error, setError] = useState<string>();

  async function processImage(file: File) {
    setStep("processing");

    try {
      const result = await extractTicketFromImage(file);
      setTicketFromExtraction(result, URL.createObjectURL(file));
    } catch {
      setError("No he podido leer bien el ticket. Prueba con otra foto.");
      setStep("capture");
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      void processImage(file);
    }
  }

  return (
    <main className="simple-screen simple-screen--center home-screen">
      <img className="home-logo" src={`${import.meta.env.BASE_URL}kos.jpg`} alt="Kos Gastrobar" />
      <h1 className="home-title">&iquest;Cu&aacute;nto vale lo m&iacute;o?</h1>

      <label className="camera-button" aria-label="Abrir camara">
        <Camera size={56} strokeWidth={1.8} />
        <input accept="image/*" capture="environment" type="file" onChange={handleFileChange} />
      </label>
      {error && <p className="camera-error">{error}</p>}
    </main>
  );
}
