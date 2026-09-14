"use client";

import { useEffect, useRef } from "react";

type LandDot = { lat: number; lon: number; size: number };

function buildLandDots(): LandDot[] {
  const dots: LandDot[] = [];
  const add = (
    latMin: number,
    latMax: number,
    lonMin: number,
    lonMax: number,
    count: number,
    jitter = 0
  ) => {
    for (let i = 0; i < count; i++) {
      const lat = latMin + Math.random() * (latMax - latMin) + (Math.random() - 0.5) * jitter;
      const lon = lonMin + Math.random() * (lonMax - lonMin) + (Math.random() - 0.5) * jitter;
      dots.push({ lat, lon, size: Math.random() > 0.85 ? 1.6 : 1.1 });
    }
  };
  add(24, 50, -130, -65, 180);
  add(-35, 12, -82, -35, 110);
  add(-35, 36, -18, 50, 140);
  add(35, 71, -25, 40, 120);
  add(5, 80, 45, 180, 260);
  add(-45, -10, 112, 154, 60);
  add(8, 35, 68, 97, 140);
  add(26, 36, 74, 81, 50);
  add(60, 83, -60, -15, 30);
  return dots;
}

const LAND_DOTS = buildLandDots();

export default function Globe({
  onSelectIndia,
  searchActive,
}: {
  onSelectIndia: () => void;
  searchActive: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const rotation = useRef({ x: -0.25, y: 0.6 });
  const targetRotation = useRef({ x: -0.25, y: 0.6 });
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const zoom = useRef(1);
  const targetZoom = useRef(1);
  const indiaPin = useRef({ x: 0, y: 0, visible: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;

    const resize = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const project = (lat: number, lon: number) => {
      const latRad = (lat * Math.PI) / 180;
      const lonRad = (lon * Math.PI) / 180;
      const rotY = rotation.current.y;
      const rotX = rotation.current.x;
      const x0 = Math.cos(latRad) * Math.cos(lonRad);
      const y0 = Math.sin(latRad);
      const z0 = Math.cos(latRad) * Math.sin(lonRad);
      const x1 = x0 * Math.cos(rotX) + z0 * Math.sin(rotX);
      const z1 = -x0 * Math.sin(rotX) + z0 * Math.cos(rotX);
      const y1 = y0;
      const x2 = x1 * Math.cos(rotY) - y1 * Math.sin(rotY);
      const y2 = x1 * Math.sin(rotY) + y1 * Math.cos(rotY);
      return { x: x2, y: y2, z: z1 };
    };

    const draw = () => {
      if (!dragging.current && !searchActive) targetRotation.current.y += 0.0025;
      rotation.current.y += (targetRotation.current.y - rotation.current.y) * 0.06;
      rotation.current.x += (targetRotation.current.x - rotation.current.x) * 0.06;
      zoom.current += (targetZoom.current - zoom.current) * 0.08;

      const radius = Math.min(width, height) * 0.42 * zoom.current;
      const cx = width * 0.5;
      const cy = height * 0.52;

      ctx.fillStyle = "#0B1220";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(255,255,255,0.15)";
      for (let i = 0; i < 120; i++) {
        const sx = (Math.sin(i * 1.7) * 0.5 + 0.5) * width;
        const sy = (Math.cos(i * 2.3) * 0.5 + 0.5) * height * 0.8;
        if (Math.random() > 0.97) {
          ctx.beginPath();
          ctx.arc(sx, sy, Math.random() * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const haloGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.35);
      haloGrad.addColorStop(0, "rgba(16,185,129,0.08)");
      haloGrad.addColorStop(0.6, "rgba(16,185,129,0.02)");
      haloGrad.addColorStop(1, "rgba(11,18,32,0)");
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0f1d33";
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let first = true;
        for (let lon = -180; lon <= 180; lon += 5) {
          const p = project(lat, lon);
          if (p.z < -0.1) continue;
          const px = cx + p.x * radius;
          const py = cy + p.y * radius;
          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      for (const dot of LAND_DOTS) {
        const p = project(dot.lat, dot.lon);
        if (p.z < 0) continue;
        const shade = Math.pow(p.z, 0.8) * 0.95 + 0.08;
        const size = dot.size * (0.6 + p.z * 0.8);
        const px = cx + p.x * radius;
        const py = cy + p.y * radius;
        if (dot.lat > 8 && dot.lat < 35 && dot.lon > 68 && dot.lon < 97) {
          ctx.fillStyle = `rgba(110, 231, 183, ${shade})`;
        } else {
          ctx.fillStyle = `rgba(203, 213, 225, ${shade * 0.9})`;
        }
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      const india = project(20.5937, 78.9629);
      if (india.z > 0) {
        const px = cx + india.x * radius;
        const py = cy + india.y * radius;
        indiaPin.current = { x: px, y: py, visible: true };
        const t = Date.now() * 0.001;
        for (let i = 0; i < 3; i++) {
          const phase = (t * 0.9 + i * 1.2) % 2.5;
          const r = 8 + phase * 18;
          const alpha = Math.max(0, 0.5 - phase * 0.18);
          ctx.strokeStyle = `rgba(16,185,129,${alpha})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = "#10B981";
        ctx.shadowColor = "#10B981";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        indiaPin.current.visible = false;
      }

      const vignette = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.2,
        radius * 0.2,
        cx,
        cy,
        radius
      );
      vignette.addColorStop(0, "rgba(255,255,255,0.06)");
      vignette.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx.fillStyle = vignette;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };
    draw();

    const onPointerDown = (e: PointerEvent) => {
      dragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      targetRotation.current.y += dx * 0.008;
      targetRotation.current.x += dy * 0.005;
      targetRotation.current.x = Math.max(-1.1, Math.min(1.1, targetRotation.current.x));
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => {
      dragging.current = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      targetZoom.current = Math.max(0.75, Math.min(2.6, targetZoom.current + delta));
    };
    const onClick = (e: MouseEvent) => {
      if (!indiaPin.current.visible) return;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const dx = px - indiaPin.current.x;
      const dy = py - indiaPin.current.y;
      if (Math.sqrt(dx * dx + dy * dy) < 28) onSelectIndia();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("click", onClick);
    };
  }, [onSelectIndia, searchActive]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />
    </div>
  );
}
