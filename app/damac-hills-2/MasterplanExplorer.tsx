"use client";

import Link from "next/link";
import {
  PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from "react";

type Cluster = {
  id: string;
  name: string;
  slug: string;
  map_x: number | null;
  map_y: number | null;
  brian_score: number | null;
  short_description: string | null;
};

type Props = {
  imageUrl: string;
  clusters: Cluster[];
};

export default function MasterplanExplorer({
  imageUrl,
  clusters,
}: Props) {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [dragging, setDragging] = useState(false);

  const dragStart = useRef({
    pointerX: 0,
    pointerY: 0,
    startX: 0,
    startY: 0,
  });

  const MIN_SCALE = 1;
  const MAX_SCALE = 3;

  function zoomIn() {
    setScale((current) =>
      Math.min(MAX_SCALE, current + 0.25)
    );
  }

  function zoomOut() {
    setScale((current) => {
      const next = Math.max(
        MIN_SCALE,
        current - 0.25
      );

      if (next === 1) {
        setPosition({
          x: 0,
          y: 0,
        });
      }

      return next;
    });
  }

  function resetView() {
    setScale(1);
    setPosition({
      x: 0,
      y: 0,
    });
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    if (scale <= 1) return;

    const target = event.target as HTMLElement;

   if (
  target.closest("[data-map-marker]") ||
  target.closest("[data-map-control]")
) {
  return;
}

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: position.x,
      startY: position.y,
    };

    setDragging(true);
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    if (!dragging || scale <= 1) return;

    const deltaX =
      event.clientX -
      dragStart.current.pointerX;

    const deltaY =
      event.clientY -
      dragStart.current.pointerY;

    setPosition({
      x:
        dragStart.current.startX +
        deltaX,
      y:
        dragStart.current.startY +
        deltaY,
    });
  }

  function stopDragging(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    if (!dragging) return;

    setDragging(false);

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {
      // Pointer may already be released.
    }
  }

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white p-3 shadow-sm md:p-5">
      <div
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        className={`relative overflow-hidden rounded-[1.5rem] bg-[#e7e4d6] touch-none ${
          scale > 1
            ? dragging
              ? "cursor-grabbing"
              : "cursor-grab"
            : "cursor-default"
        }`}
      >
        {/* MOVABLE MAP */}
        <div
          className="relative origin-center will-change-transform"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: dragging
              ? "none"
              : "transform 200ms ease-out",
          }}
        >
          <img
            src={imageUrl}
            alt="DAMAC Hills 2 aerial masterplan"
            className="h-auto w-full select-none"
            draggable={false}
          />

          {/* DARK EDGE FADE */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/15 to-transparent" />

          {/* CLUSTER MARKERS */}
          {clusters.map((cluster) => (
            <Link
              key={cluster.id}
              data-map-marker
              href={`/damac-hills-2/clusters/${cluster.slug}`}
              aria-label={`Explore ${cluster.name}`}
              className="group absolute z-30 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${cluster.map_x}%`,
                top: `${cluster.map_y}%`,
              }}
            >
              <div className="relative flex h-10 w-10 items-center justify-center">
                <span className="absolute h-9 w-9 rounded-full bg-black/10 transition duration-300 group-hover:scale-125 group-hover:bg-black/20 group-focus-visible:scale-125" />

                <span className="relative flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-white bg-black shadow-xl transition duration-300 group-hover:scale-110 group-focus-visible:scale-110">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>

                <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 hidden w-[220px] -translate-x-1/2 rounded-2xl bg-black/95 p-4 text-white shadow-2xl backdrop-blur-md group-hover:block group-focus-visible:block md:w-[240px]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {cluster.name}
                      </p>

                      <p className="mt-1 text-[11px] text-white/50">
                        DAMAC Hills 2
                      </p>
                    </div>

                    {cluster.brian_score && (
                      <div className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-black">
                        {cluster.brian_score}/10
                      </div>
                    )}
                  </div>

                  {cluster.short_description && (
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/65">
                      {cluster.short_description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">
                      Explore cluster
                    </span>

                    <span className="text-sm text-white/70">
                      →
                    </span>
                  </div>

                  <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black/95" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* BRAND */}
        <div className="pointer-events-none absolute left-5 top-5 z-40 rounded-2xl bg-black/80 px-4 py-3 text-white shadow-lg backdrop-blur md:left-7 md:top-7">
          <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/60">
            Find It With Brian
          </p>

          <p className="mt-1 text-sm font-semibold md:text-base">
            DAMAC Hills 2
          </p>
        </div>

        {/* ZOOM CONTROLS */}
<div
  data-map-control
  onPointerDown={(event) => event.stopPropagation()}
  onPointerMove={(event) => event.stopPropagation()}
  className="absolute right-5 top-5 z-[100] flex flex-col gap-2 md:right-7 md:top-7"
>
  <button
    type="button"
    onClick={(event) => {
      event.stopPropagation();
      zoomIn();
    }}
    disabled={scale >= MAX_SCALE}
    aria-label="Zoom in"
    className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-xl font-medium text-white shadow-xl transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
  >
    +
  </button>

  <button
    type="button"
    onClick={(event) => {
      event.stopPropagation();
      zoomOut();
    }}
    disabled={scale <= MIN_SCALE}
    aria-label="Zoom out"
    className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-xl font-medium text-white shadow-xl transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
  >
    −
  </button>

  <button
    type="button"
    onClick={(event) => {
      event.stopPropagation();
      resetView();
    }}
    disabled={
      scale === 1 &&
      position.x === 0 &&
      position.y === 0
    }
    className="rounded-full bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-black shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
  >
    Reset
  </button>
</div>

        {/* SCALE */}
        {scale > 1 && (
          <div className="pointer-events-none absolute bottom-5 right-5 z-40 rounded-full bg-black/70 px-3 py-2 text-[10px] font-medium text-white backdrop-blur md:bottom-7 md:right-7">
            {Math.round(scale * 100)}%
          </div>
        )}

        {/* INSTRUCTION */}
        <div className="pointer-events-none absolute bottom-5 left-5 z-40 rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-white shadow-xl backdrop-blur-md md:bottom-7 md:left-7">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-white bg-black" />
            </span>

            <div>
              <p className="text-xs font-medium">
                Explore the clusters
              </p>

              <p className="mt-0.5 text-[10px] text-white/50">
                {scale > 1
                  ? "Drag to move around the masterplan"
                  : "Hover a marker or zoom in"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}