"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { getImageUrl, fmt } from "@/types";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  slug: string;
  stock: number;
  productType: string;
  category: { name: string };
}

interface Recommendation {
  id: string;
  slug: string;
  name: string;
  reason: string;
  product: Product | null;
}

interface AIResponse {
  analysis: string;
  recommendations: Recommendation[];
}

type Step = "idle" | "camera" | "preview" | "loading" | "results";

export function CameraSearch() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStep("camera");
    } catch {
      setError("No se pudo acceder a la cámara. Verifica los permisos del navegador.");
      setStep("idle");
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
    setStep("preview");
  }, [stopCamera]);

  const analyzeImage = useCallback(async () => {
    if (!capturedImage) return;
    setStep("loading");
    setError(null);

    try {
      const res = await fetch("/api/ai-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: capturedImage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");
      setResult(data);
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al analizar la imagen");
      setStep("preview");
    }
  }, [capturedImage]);

  const reset = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setResult(null);
    setError(null);
    setStep("idle");
  }, [stopCamera]);

  const handleClose = useCallback(() => {
    reset();
    setOpen(false);
  }, [reset]);

  // Arrancar cámara cuando se abre el modal
  useEffect(() => {
    if (open && step === "idle") {
      startCamera();
    }
    return () => {
      if (!open) stopCamera();
    };
  }, [open, step, startCamera, stopCamera]);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleClose]);

  return (
    <>
      <button
        className="btn btn-sm d-flex align-items-center gap-2"
        style={{
          background: "linear-gradient(45deg,#7c3aed,#2563eb)",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "7px 16px",
          fontWeight: 600,
          boxShadow: "0 4px 14px rgba(99,102,241,.35)",
          transition: "transform .2s, box-shadow .2s",
        }}
        onClick={() => setOpen(true)}
        title="Buscar producto con tu cámara"
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 20px rgba(99,102,241,.5)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(99,102,241,.35)";
        }}
      >
        <i className="bi bi-camera-fill"></i>
        <span className="d-none d-sm-inline">Buscar por foto</span>
      </button>

      {open && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,.75)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem", animation: "fadeIn .2s ease",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div
            style={{
              background: "var(--card-bg, #0f172a)",
              border: "1px solid var(--border, rgba(255,255,255,.08))",
              borderRadius: 20,
              width: "100%", maxWidth: 640,
              maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0,0,0,.6)",
              animation: "slideUp .3s ease",
            }}
          >
            {/* Header */}
            <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border, rgba(255,255,255,.08))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(45deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="bi bi-stars" style={{ color: "#fff", fontSize: "1rem" }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: ".95rem", color: "var(--text, #f1f5f9)" }}>Buscar con IA</div>
                  <div style={{ fontSize: ".73rem", color: "var(--text-muted, #64748b)" }}>Toma una foto y te recomendamos productos</div>
                </div>
              </div>
              <button
                onClick={handleClose}
                style={{ background: "none", border: "none", color: "var(--text-muted, #64748b)", fontSize: "1.2rem", cursor: "pointer", padding: 4, borderRadius: 8, lineHeight: 1 }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px" }}>

              {/* Error */}
              {error && (
                <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#f87171", fontSize: ".85rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="bi bi-exclamation-triangle-fill"></i> {error}
                </div>
              )}

              {/* Cámara en vivo */}
              {(step === "camera" || step === "idle") && (
                <div>
                  <div style={{ borderRadius: 14, overflow: "hidden", background: "#000", position: "relative", aspectRatio: "16/9" }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    {step === "idle" && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="bi bi-camera" style={{ color: "rgba(255,255,255,.5)", fontSize: "1.3rem" }}></i>
                        </div>
                        <span style={{ color: "rgba(255,255,255,.5)", fontSize: ".82rem" }}>Iniciando cámara...</span>
                      </div>
                    )}
                    {/* Marco de enfoque */}
                    {step === "camera" && (
                      <div style={{ position: "absolute", inset: "15%", border: "2px solid rgba(129,140,248,.5)", borderRadius: 12, pointerEvents: "none", boxShadow: "0 0 0 9999px rgba(0,0,0,.25)" }}>
                        <div style={{ position: "absolute", top: -1, left: -1, width: 20, height: 20, borderTop: "3px solid #818cf8", borderLeft: "3px solid #818cf8", borderRadius: "4px 0 0 0" }}></div>
                        <div style={{ position: "absolute", top: -1, right: -1, width: 20, height: 20, borderTop: "3px solid #818cf8", borderRight: "3px solid #818cf8", borderRadius: "0 4px 0 0" }}></div>
                        <div style={{ position: "absolute", bottom: -1, left: -1, width: 20, height: 20, borderBottom: "3px solid #818cf8", borderLeft: "3px solid #818cf8", borderRadius: "0 0 0 4px" }}></div>
                        <div style={{ position: "absolute", bottom: -1, right: -1, width: 20, height: 20, borderBottom: "3px solid #818cf8", borderRight: "3px solid #818cf8", borderRadius: "0 0 4px 0" }}></div>
                      </div>
                    )}
                  </div>
                  <p style={{ color: "var(--text-muted, #64748b)", fontSize: ".8rem", textAlign: "center", marginTop: 10, marginBottom: 16 }}>
                    <i className="bi bi-info-circle me-1"></i>Apunta al objeto que buscas y captura la foto
                  </p>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      onClick={capturePhoto}
                      disabled={step !== "camera"}
                      style={{
                        width: 64, height: 64, borderRadius: "50%",
                        background: step === "camera" ? "linear-gradient(45deg,#7c3aed,#2563eb)" : "rgba(255,255,255,.1)",
                        border: "3px solid rgba(255,255,255,.2)",
                        cursor: step === "camera" ? "pointer" : "not-allowed",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "transform .2s, box-shadow .2s",
                        boxShadow: step === "camera" ? "0 0 0 6px rgba(99,102,241,.2)" : "none",
                      }}
                      title="Capturar foto"
                    >
                      <i className="bi bi-camera-fill" style={{ color: "#fff", fontSize: "1.4rem" }}></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Vista previa de la foto capturada */}
              {(step === "preview" || step === "loading") && capturedImage && (
                <div>
                  <div style={{ borderRadius: 14, overflow: "hidden", position: "relative" }}>
                    <img src={capturedImage} alt="Foto capturada" style={{ width: "100%", display: "block", borderRadius: 14 }} />
                    {step === "loading" && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, borderRadius: 14 }}>
                        <div style={{ width: 52, height: 52, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#818cf8", borderRightColor: "#c084fc", animation: "spin 1s linear infinite" }}></div>
                        <span style={{ color: "#fff", fontWeight: 600, fontSize: ".9rem" }}>Analizando con IA...</span>
                        <span style={{ color: "rgba(255,255,255,.6)", fontSize: ".78rem" }}>Gemini está buscando productos relacionados</span>
                      </div>
                    )}
                  </div>
                  {step === "preview" && (
                    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                      <button
                        onClick={reset}
                        className="btn btn-outline-secondary flex-fill"
                        style={{ borderRadius: 10 }}
                      >
                        <i className="bi bi-arrow-counterclockwise me-2"></i>Volver a tomar
                      </button>
                      <button
                        onClick={analyzeImage}
                        className="btn flex-fill"
                        style={{ background: "linear-gradient(45deg,#7c3aed,#2563eb)", color: "#fff", borderRadius: 10, fontWeight: 600, border: "none" }}
                      >
                        <i className="bi bi-stars me-2"></i>Analizar con IA
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Resultados */}
              {step === "results" && result && (
                <div>
                  {/* Análisis */}
                  <div style={{ background: "rgba(99,102,241,.08)", border: "1px solid rgba(99,102,241,.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10 }}>
                    <i className="bi bi-eye-fill" style={{ color: "#818cf8", fontSize: "1.1rem", flexShrink: 0, marginTop: 2 }}></i>
                    <div>
                      <div style={{ fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "#818cf8", marginBottom: 4 }}>Lo que veo en tu foto</div>
                      <p style={{ margin: 0, color: "var(--text, #f1f5f9)", fontSize: ".88rem", lineHeight: 1.6 }}>{result.analysis}</p>
                    </div>
                  </div>

                  {result.recommendations.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted, #64748b)" }}>
                      <i className="bi bi-search" style={{ fontSize: "2.5rem", display: "block", marginBottom: 10 }}></i>
                      <p>No encontré productos relacionados con esta imagen en nuestro catálogo.</p>
                      <button onClick={reset} className="btn btn-outline-primary btn-sm mt-2">Intentar con otra foto</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: ".75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--text-muted, #64748b)", marginBottom: 12 }}>
                        <i className="bi bi-stars me-1" style={{ color: "#818cf8" }}></i>Productos recomendados para ti
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {result.recommendations.map((rec, idx) => {
                          const p = rec.product;
                          if (!p) return null;
                          return (
                            <a
                              key={rec.id || idx}
                              href={`/productos/${rec.slug}`}
                              style={{
                                display: "flex", gap: 14, alignItems: "flex-start",
                                background: "rgba(255,255,255,.03)",
                                border: "1px solid var(--border, rgba(255,255,255,.08))",
                                borderRadius: 14, padding: "12px 14px",
                                textDecoration: "none", color: "inherit",
                                transition: "border-color .2s, background .2s, transform .2s",
                              }}
                              onMouseEnter={(e) => {
                                const el = e.currentTarget as HTMLAnchorElement;
                                el.style.borderColor = "rgba(129,140,248,.4)";
                                el.style.background = "rgba(99,102,241,.07)";
                                el.style.transform = "translateY(-2px)";
                              }}
                              onMouseLeave={(e) => {
                                const el = e.currentTarget as HTMLAnchorElement;
                                el.style.borderColor = "var(--border, rgba(255,255,255,.08))";
                                el.style.background = "rgba(255,255,255,.03)";
                                el.style.transform = "";
                              }}
                            >
                              <div style={{ position: "relative", flexShrink: 0 }}>
                                <img
                                  src={getImageUrl(p.image, p.name)}
                                  alt={p.name}
                                  style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10 }}
                                />
                                <div style={{
                                  position: "absolute", top: -8, left: -8,
                                  width: 22, height: 22, borderRadius: "50%",
                                  background: "linear-gradient(45deg,#7c3aed,#2563eb)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: ".68rem", fontWeight: 700, color: "#fff",
                                  boxShadow: "0 2px 8px rgba(99,102,241,.4)",
                                }}>
                                  {idx + 1}
                                </div>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                                  <span style={{ fontWeight: 700, fontSize: ".9rem", color: "var(--text, #f1f5f9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                                  {p.productType !== "external_game" && (
                                    <span style={{ fontWeight: 700, fontSize: ".9rem", background: "linear-gradient(45deg,#818cf8,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap", flexShrink: 0 }}>
                                      ${fmt(p.price)}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: ".72rem", color: "var(--text-muted, #64748b)", marginBottom: 5 }}>
                                  <span style={{ background: "rgba(255,255,255,.06)", padding: "2px 8px", borderRadius: 999, border: "1px solid rgba(255,255,255,.07)" }}>{p.category.name}</span>
                                </div>
                                <p style={{ fontSize: ".8rem", color: "rgba(148,163,184,.85)", margin: 0, lineHeight: 1.5 }}>
                                  <i className="bi bi-check2-circle me-1" style={{ color: "#818cf8" }}></i>{rec.reason}
                                </p>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                        <button onClick={reset} className="btn btn-outline-secondary btn-sm flex-fill" style={{ borderRadius: 10 }}>
                          <i className="bi bi-arrow-counterclockwise me-1"></i>Nueva búsqueda
                        </button>
                        <button onClick={handleClose} className="btn btn-sm flex-fill" style={{ background: "linear-gradient(45deg,#7c3aed,#2563eb)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600 }}>
                          Ver catálogo completo
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </>
  );
}
