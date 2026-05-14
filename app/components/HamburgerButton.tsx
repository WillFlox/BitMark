"use client";
import { useRef, useEffect, useMemo } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import rawAnimation from "../../public/animations/hamburger-menu.json";

function applyLightColors(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = JSON.parse(JSON.stringify(data));
  const layers = result.layers as Record<string, unknown>[];
  result.layers = layers.map((layer, i) => {
    if (i === layers.length - 1) {
      return { ...layer, hd: true };
    }
    const shapes = (layer.shapes as Record<string, unknown>[])?.map((shape) => {
      if (shape.ty === "fl") {
        const s = JSON.parse(JSON.stringify(shape));
        const keyframes = s.c.k as Record<string, unknown>[];
        s.c.k = keyframes.map((kf) => ({ ...kf, s: [0.88, 0.91, 1] }));
        return s;
      }
      return shape;
    });
    return { ...layer, shapes };
  });
  return result;
}

export default function HamburgerButton() {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const animationData = useMemo(() => applyLightColors(rawAnimation as Record<string, unknown>), []);

  useEffect(() => {
    const navMenu = document.getElementById("navMenu");
    if (!navMenu) return;

    const handleShow = () => {
      lottieRef.current?.setDirection(1);
      lottieRef.current?.play();
    };

    const handleHide = () => {
      lottieRef.current?.setDirection(-1);
      lottieRef.current?.play();
    };

    navMenu.addEventListener("show.bs.collapse", handleShow);
    navMenu.addEventListener("hide.bs.collapse", handleHide);

    return () => {
      navMenu.removeEventListener("show.bs.collapse", handleShow);
      navMenu.removeEventListener("hide.bs.collapse", handleHide);
    };
  }, []);

  return (
    <button
      className="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navMenu"
      aria-controls="navMenu"
      aria-expanded="false"
      aria-label="Abrir menú"
      style={{
        border: "1px solid rgba(255,255,255,0.15)",
        background: "transparent",
        padding: "2px",
        borderRadius: "8px",
      }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        autoplay={false}
        loop={false}
        style={{ width: 38, height: 38, display: "block" }}
      />
    </button>
  );
}
