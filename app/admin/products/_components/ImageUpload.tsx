"use client";

import { useRef, useState } from "react";

interface ImageUploadProps {
  currentImage?: string | null;
}

export default function ImageUpload({ currentImage }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageValue, setImageValue] = useState<string>(currentImage ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayImage = preview ?? (imageValue || null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al subir la imagen.");
        setPreview(null);
        return;
      }

      setImageValue(data.url);
    } catch {
      setError("Error de red al subir la imagen.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setPreview(null);
    setImageValue("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="col-12">
      <label className="form-label">Imagen del producto</label>

      <input type="hidden" name="image" value={imageValue} />

      {displayImage && (
        <div className="mb-3 position-relative d-inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImage}
            alt="Vista previa"
            style={{
              maxHeight: 200,
              maxWidth: "100%",
              borderRadius: 8,
              objectFit: "cover",
              border: "1px solid #dee2e6",
            }}
          />
          {uploading && (
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
              style={{ background: "rgba(255,255,255,.7)", borderRadius: 8 }}
            >
              <div className="spinner-border spinner-border-sm text-primary" />
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
              style={{ lineHeight: 1, padding: "2px 6px" }}
              onClick={handleRemove}
              title="Quitar imagen"
            >
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>
      )}

      <div className="d-flex gap-2 align-items-center flex-wrap">
        <label
          className="btn btn-outline-primary btn-sm mb-0"
          style={{ cursor: uploading ? "not-allowed" : "pointer" }}
        >
          <i className="bi bi-upload me-1" />
          {uploading ? "Subiendo…" : displayImage ? "Cambiar imagen" : "Seleccionar imagen"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            className="d-none"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>

        {!displayImage && (
          <span className="text-muted small">JPG, PNG, WEBP o GIF · máx. 5 MB</span>
        )}
      </div>

      {error && (
        <div className="text-danger small mt-1">
          <i className="bi bi-exclamation-circle me-1" />
          {error}
        </div>
      )}
    </div>
  );
}
