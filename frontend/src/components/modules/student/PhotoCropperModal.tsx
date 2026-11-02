"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import Modal from "@/components/modules/admin/Modal"; // the shared dialog shell from the admin work

const BOX = 256; // preview size in px
const OUTPUT = 512; // saved image size in px
const MIN_SIDE = 200; // reject images smaller than this

type Point = { x: number; y: number };

export default function PhotoCropperModal({
  file,
  onCancel,
  onConfirm,
}: {
  file: File;
  onCancel: () => void;
  onConfirm: (blob: Blob) => Promise<void>; // throw to show an error here
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState<Point>({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const imgRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  // Preview URL for the chosen file
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const tooSmall = natural !== null && Math.min(natural.w, natural.h) < MIN_SIDE;
  const base = natural ? BOX / Math.min(natural.w, natural.h) : 1; // scale at which the image just covers the box
  const scale = base * zoom;

  // Keep the picture covering the whole box
  function clamp(p: Point, s: number): Point {
    if (!natural) return p;
    return {
      x: Math.min(0, Math.max(BOX - natural.w * s, p.x)),
      y: Math.min(0, Math.max(BOX - natural.h * s, p.y)),
    };
  }

  function handleLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const w = e.currentTarget.naturalWidth;
    const h = e.currentTarget.naturalHeight;
    const s = BOX / Math.min(w, h);
    setNatural({ w, h });
    setPos({ x: (BOX - w * s) / 2, y: (BOX - h * s) / 2 }); // start centered
  }

  function changeZoom(next: number) {
    if (!natural) return;
    // Zoom around the center of the box
    const cx = (BOX / 2 - pos.x) / scale;
    const cy = (BOX / 2 - pos.y) / scale;
    const nextScale = base * next;
    setZoom(next);
    setPos(clamp({ x: BOX / 2 - cx * nextScale, y: BOX / 2 - cy * nextScale }, nextScale));
  }

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    setPos(clamp({ x: d.x + (e.clientX - d.px), y: d.y + (e.clientY - d.py) }, scale));
  }
  function onPointerUp() {
    drag.current = null;
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const step = 10;
    const moves: Record<string, Point> = {
      ArrowLeft: { x: step, y: 0 },
      ArrowRight: { x: -step, y: 0 },
      ArrowUp: { x: 0, y: step },
      ArrowDown: { x: 0, y: -step },
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    setPos((p) => clamp({ x: p.x + move.x, y: p.y + move.y }, scale));
  }

  async function save() {
    const img = imgRef.current;
    if (!img || !natural || tooSmall) return;
    setError("");

    // Draw exactly what's visible in the box into a 512x512 square
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Your browser couldn't process the image.");
      return;
    }
    ctx.fillStyle = "#ffffff"; // transparent PNGs become white instead of black
    ctx.fillRect(0, 0, OUTPUT, OUTPUT);
    ctx.drawImage(img, -pos.x / scale, -pos.y / scale, BOX / scale, BOX / scale, 0, 0, OUTPUT, OUTPUT);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) {
      setError("Could not process the image. Try a different one.");
      return;
    }

    setBusy(true);
    try {
      await onConfirm(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Modal title="Adjust your photo" onClose={onCancel} busy={busy}>
      <p className="text-sm text-muted-foreground">Drag the picture to position it, and use the slider to zoom.</p>

      <div className="mt-4 flex justify-center">
        <div
          tabIndex={0}
          role="img"
          aria-label="Photo preview. Use the arrow keys to move the picture."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          className="relative cursor-grab touch-none overflow-hidden rounded-full border-2 border-primary bg-muted outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:cursor-grabbing"
          style={{ width: BOX, height: BOX }}
        >
          {src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={src}
              alt=""
              draggable={false}
              onLoad={handleLoad}
              className="pointer-events-none absolute max-w-none select-none"
              style={
                natural
                  ? { width: natural.w * scale, height: natural.h * scale, left: pos.x, top: pos.y }
                  : { opacity: 0 }
              }
            />
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <label htmlFor="zoom" className="text-sm font-medium">
          Zoom
        </label>
        <input
          id="zoom"
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => changeZoom(Number(e.target.value))}
          disabled={!natural || busy}
          className="flex-1 accent-[var(--primary,#2563eb)]"
        />
      </div>

      {tooSmall && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          This image is too small. Please choose one at least {MIN_SIDE} × {MIN_SIDE} pixels.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={busy}
          className="rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={busy || !natural || tooSmall}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Save photo
        </button>
      </div>
    </Modal>
  );
}