"use client";

import Link from "next/link";
import {
  ChangeEvent,
  PointerEvent as ReactPointerEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";

type Cluster = {
  id: string;
  name: string;
  slug: string;
  map_x: number | null;
  map_y: number | null;
  display_order: number | null;
};

type MasterplanSettings = {
  id: string | null;
  live_image_url: string | null;
  live_storage_path: string | null;
  reference_image_url: string | null;
  reference_storage_path: string | null;
};

type Props = {
  communityId: string;
  initialClusters: Cluster[];
  initialSettings: MasterplanSettings;
};

export default function MapCalibrationClient({
  communityId,
  initialClusters,
  initialSettings,
}: Props) {
  const supabase = createClient();

  const mapRef = useRef<HTMLDivElement | null>(null);

  const [clusters, setClusters] =
    useState<Cluster[]>(initialClusters);

  const [settings, setSettings] =
    useState<MasterplanSettings>(
      initialSettings
    );

  const [selectedId, setSelectedId] =
    useState(initialClusters[0]?.id ?? "");

  const [showLabels, setShowLabels] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState<"live" | "reference" | null>(
      null
    );

  const [message, setMessage] =
    useState("");

  const [imageMessage, setImageMessage] =
    useState("");

  const [dragging, setDragging] =
    useState(false);

  const selectedIndex = useMemo(
    () =>
      clusters.findIndex(
        (cluster) =>
          cluster.id === selectedId
      ),
    [clusters, selectedId]
  );

  const selectedCluster = useMemo(
    () =>
      clusters.find(
        (cluster) =>
          cluster.id === selectedId
      ) ?? null,
    [clusters, selectedId]
  );

  const mappedCount = useMemo(
    () =>
      clusters.filter(
        (cluster) =>
          cluster.map_x !== null &&
          cluster.map_y !== null
      ).length,
    [clusters]
  );

  const liveImage =
    settings.live_image_url ||
    "/images/masterplan/3.png";

  const referenceImage =
    settings.reference_image_url ||
    "/images/masterplan/4.png";

  const activeImage = showLabels
    ? referenceImage
    : liveImage;

  function updateSelectedPosition(
    x: number,
    y: number
  ) {
    if (!selectedCluster) return;

    const safeX = Math.min(
      100,
      Math.max(0, x)
    );

    const safeY = Math.min(
      100,
      Math.max(0, y)
    );

    setClusters((current) =>
      current.map((cluster) =>
        cluster.id === selectedCluster.id
          ? {
              ...cluster,
              map_x: Number(
                safeX.toFixed(2)
              ),
              map_y: Number(
                safeY.toFixed(2)
              ),
            }
          : cluster
      )
    );

    setMessage("");
  }

  function getPositionFromPointer(
    event: ReactPointerEvent<HTMLElement>
  ) {
    if (!mapRef.current) return null;

    const rect =
      mapRef.current.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) /
        rect.width) *
      100;

    const y =
      ((event.clientY - rect.top) /
        rect.height) *
      100;

    return { x, y };
  }

  function handleMapPointerDown(
    event: ReactPointerEvent<HTMLDivElement>
  ) {
    if (!selectedCluster) return;

    const target =
      event.target as HTMLElement;

    if (
      target.closest(
        "[data-cluster-marker]"
      )
    ) {
      return;
    }

    const position =
      getPositionFromPointer(event);

    if (!position) return;

    updateSelectedPosition(
      position.x,
      position.y
    );
  }

  function handleMarkerPointerDown(
    event: ReactPointerEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    setDragging(true);

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }

  function handleMarkerPointerMove(
    event: ReactPointerEvent<HTMLButtonElement>
  ) {
    if (!dragging) return;

    const position =
      getPositionFromPointer(event);

    if (!position) return;

    updateSelectedPosition(
      position.x,
      position.y
    );
  }

  function handleMarkerPointerUp(
    event: ReactPointerEvent<HTMLButtonElement>
  ) {
    setDragging(false);

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {
      // Pointer may already be released.
    }
  }

  function selectPreviousCluster() {
    if (clusters.length === 0) return;

    const newIndex =
      selectedIndex <= 0
        ? clusters.length - 1
        : selectedIndex - 1;

    setSelectedId(
      clusters[newIndex].id
    );

    setMessage("");
  }

  function selectNextCluster() {
    if (clusters.length === 0) return;

    const newIndex =
      selectedIndex >=
      clusters.length - 1
        ? 0
        : selectedIndex + 1;

    setSelectedId(
      clusters[newIndex].id
    );

    setMessage("");
  }

  async function savePosition(
    moveNext = false
  ) {
    if (
      !selectedCluster ||
      selectedCluster.map_x === null ||
      selectedCluster.map_y === null
    ) {
      setMessage(
        "Place the cluster on the map first."
      );

      return;
    }

    setSaving(true);
    setMessage("");

    const clusterName =
      selectedCluster.name;

    const { error } = await supabase
      .from("clusters")
      .update({
        map_x: selectedCluster.map_x,
        map_y: selectedCluster.map_y,
      })
      .eq("id", selectedCluster.id);

    setSaving(false);

    if (error) {
      console.error(
        "Map position save error:",
        error
      );

      setMessage(
        "Could not save the position."
      );

      return;
    }

    if (moveNext) {
      setMessage(
        `${clusterName} saved.`
      );

      const newIndex =
        selectedIndex >=
        clusters.length - 1
          ? 0
          : selectedIndex + 1;

      setSelectedId(
        clusters[newIndex].id
      );

      return;
    }

    setMessage(
      `${clusterName} saved successfully.`
    );
  }

  async function uploadMasterplan(
    event: ChangeEvent<HTMLInputElement>,
    type: "live" | "reference"
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageMessage(
        "Please select an image file."
      );

      event.target.value = "";
      return;
    }

    setUploading(type);
    setImageMessage("");

    const extension =
      file.name.split(".").pop() || "png";

    const storagePath =
      `damac-hills-2/${type}-${Date.now()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("masterplans")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

    if (uploadError) {
      console.error(
        "Masterplan upload error:",
        uploadError
      );

      setUploading(null);
      setImageMessage(
        "Image upload failed."
      );

      event.target.value = "";
      return;
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from("masterplans")
      .getPublicUrl(storagePath);

    const publicUrl =
      publicUrlData.publicUrl;

    const update =
      type === "live"
        ? {
            live_image_url: publicUrl,
            live_storage_path:
              storagePath,
            updated_at:
              new Date().toISOString(),
          }
        : {
            reference_image_url:
              publicUrl,
            reference_storage_path:
              storagePath,
            updated_at:
              new Date().toISOString(),
          };

    const { error: updateError } =
      await supabase
        .from("masterplan_settings")
        .update(update)
        .eq(
          "community_id",
          communityId
        );

    setUploading(null);

    if (updateError) {
      console.error(
        "Masterplan settings update error:",
        updateError
      );

      setImageMessage(
        "Image uploaded, but settings could not be updated."
      );

      event.target.value = "";
      return;
    }

    setSettings((current) => ({
      ...current,
      ...(type === "live"
        ? {
            live_image_url:
              publicUrl,
            live_storage_path:
              storagePath,
          }
        : {
            reference_image_url:
              publicUrl,
            reference_storage_path:
              storagePath,
          }),
    }));

    setImageMessage(
      type === "live"
        ? "Live masterplan updated successfully."
        : "Reference masterplan updated successfully."
    );

    event.target.value = "";
  }

  return (
    <main className="min-h-screen bg-[#f4f1ea] text-[#171717]">
      {/* HEADER */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 px-6 py-5 md:px-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-neutral-500">
            Find It With Brian
          </p>

          <h1 className="mt-1 text-xl font-semibold">
            DAMAC Hills 2 Map Calibration
          </h1>
        </div>

        <Link
          href="/damac-hills-2"
          className="rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-medium"
        >
          View Public Explorer →
        </Link>
      </header>

      {/* IMAGE MANAGER */}
      <section className="border-b border-neutral-200 px-6 py-8 md:px-10">
        <div className="max-w-6xl">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">
              Masterplan Images
            </p>

            <h2 className="mt-2 text-3xl font-semibold">
              Live & Reference Images
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              The live image is used by visitors.
              The reference image is used here
              while positioning cluster markers.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {/* LIVE */}
            <div className="overflow-hidden rounded-[2rem] bg-white">
              <div className="aspect-[16/8] overflow-hidden bg-neutral-100">
                <img
                  src={liveImage}
                  alt="Current live DAMAC Hills 2 masterplan"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                      Live
                    </p>

                    <h3 className="mt-1 text-xl font-semibold">
                      Public Masterplan
                    </h3>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    Public
                  </span>
                </div>

                <label className="mt-5 block cursor-pointer rounded-full bg-black px-5 py-3 text-center text-sm font-semibold text-white">
                  {uploading === "live"
                    ? "Uploading..."
                    : "Change Live Image"}

                  <input
                    type="file"
                    accept="image/*"
                    disabled={
                      uploading !== null
                    }
                    onChange={(event) =>
                      uploadMasterplan(
                        event,
                        "live"
                      )
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* REFERENCE */}
            <div className="overflow-hidden rounded-[2rem] bg-white">
              <div className="aspect-[16/8] overflow-hidden bg-neutral-100">
                <img
                  src={referenceImage}
                  alt="Current DAMAC Hills 2 calibration reference"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                      Reference
                    </p>

                    <h3 className="mt-1 text-xl font-semibold">
                      Calibration Image
                    </h3>
                  </div>

                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                    Admin
                  </span>
                </div>

                <label className="mt-5 block cursor-pointer rounded-full border border-black px-5 py-3 text-center text-sm font-semibold">
                  {uploading ===
                  "reference"
                    ? "Uploading..."
                    : "Change Reference Image"}

                  <input
                    type="file"
                    accept="image/*"
                    disabled={
                      uploading !== null
                    }
                    onChange={(event) =>
                      uploadMasterplan(
                        event,
                        "reference"
                      )
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {imageMessage && (
            <div className="mt-4 rounded-2xl bg-white px-5 py-4">
              <p className="text-sm text-neutral-600">
                {imageMessage}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CALIBRATION */}
      <section className="grid gap-6 px-6 py-8 md:px-10 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">
              Calibration
            </p>

            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
              {selectedIndex + 1} /{" "}
              {clusters.length}
            </span>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>
                Cluster positions
              </span>

              <span>
                {mappedCount}/
                {clusters.length}
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-black transition-all"
                style={{
                  width: `${
                    clusters.length
                      ? (mappedCount /
                          clusters.length) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <label className="mt-7 block text-sm font-medium">
            Select cluster
          </label>

          <select
            value={selectedId}
            onChange={(event) => {
              setSelectedId(
                event.target.value
              );
              setMessage("");
            }}
            className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3"
          >
            {clusters.map(
              (cluster) => (
                <option
                  key={cluster.id}
                  value={cluster.id}
                >
                  {cluster.name}
                </option>
              )
            )}
          </select>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={
                selectPreviousCluster
              }
              className="rounded-2xl border border-neutral-300 px-4 py-3 text-sm font-medium"
            >
              ← Previous
            </button>

            <button
              type="button"
              onClick={
                selectNextCluster
              }
              className="rounded-2xl border border-neutral-300 px-4 py-3 text-sm font-medium"
            >
              Next →
            </button>
          </div>

          <div className="mt-7">
            <p className="text-sm font-medium">
              Image
            </p>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setShowLabels(false)
                }
                className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                  !showLabels
                    ? "bg-black text-white"
                    : "border border-neutral-300"
                }`}
              >
                Live
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowLabels(true)
                }
                className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                  showLabels
                    ? "bg-black text-white"
                    : "border border-neutral-300"
                }`}
              >
                Reference
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-neutral-100 p-5">
            <p className="text-sm text-neutral-500">
              Selected cluster
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {selectedCluster?.name ??
                "None"}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs text-neutral-400">
                  X
                </p>

                <p className="mt-1 font-semibold">
                  {selectedCluster?.map_x ??
                    "—"}
                  %
                </p>
              </div>

              <div className="rounded-xl bg-white p-3">
                <p className="text-xs text-neutral-400">
                  Y
                </p>

                <p className="mt-1 font-semibold">
                  {selectedCluster?.map_y ??
                    "—"}
                  %
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              savePosition(false)
            }
            disabled={saving}
            className="mt-6 w-full rounded-full border border-black px-5 py-4 text-sm font-semibold disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Position"}
          </button>

          <button
            type="button"
            onClick={() =>
              savePosition(true)
            }
            disabled={saving}
            className="mt-3 w-full rounded-full bg-black px-5 py-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save & Next →"}
          </button>

          {message && (
            <p className="mt-4 rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-600">
              {message}
            </p>
          )}
        </aside>

        {/* MAP */}
        <div className="min-w-0">
          <div className="mb-4">
            <p className="text-sm font-medium">
              {showLabels
                ? "Reference masterplan"
                : "Live masterplan"}
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              Click anywhere to position{" "}
              <strong>
                {selectedCluster?.name}
              </strong>
              .
            </p>
          </div>

          <div className="overflow-hidden rounded-[2rem] bg-black p-2">
            <div
              ref={mapRef}
              onPointerDown={
                handleMapPointerDown
              }
              className="relative cursor-crosshair overflow-hidden rounded-[1.5rem]"
            >
              <img
                src={activeImage}
                alt="DAMAC Hills 2 calibration masterplan"
                draggable={false}
                className="h-auto w-full select-none"
              />

              {clusters.map(
                (cluster) => {
                  if (
                    cluster.map_x ===
                      null ||
                    cluster.map_y ===
                      null
                  ) {
                    return null;
                  }

                  const selected =
                    cluster.id ===
                    selectedId;

                  return (
                    <div
                      key={cluster.id}
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${cluster.map_x}%`,
                        top: `${cluster.map_y}%`,
                      }}
                    >
                      <div
                        className={`rounded-full border-2 border-white shadow ${
                          selected
                            ? "h-4 w-4 bg-red-600"
                            : "h-2.5 w-2.5 bg-black/55"
                        }`}
                      />
                    </div>
                  );
                }
              )}

              {selectedCluster &&
                selectedCluster.map_x !==
                  null &&
                selectedCluster.map_y !==
                  null && (
                  <button
                    type="button"
                    data-cluster-marker
                    onPointerDown={
                      handleMarkerPointerDown
                    }
                    onPointerMove={
                      handleMarkerPointerMove
                    }
                    onPointerUp={
                      handleMarkerPointerUp
                    }
                    onPointerCancel={() =>
                      setDragging(false)
                    }
                    className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none active:cursor-grabbing"
                    style={{
                      left: `${selectedCluster.map_x}%`,
                      top: `${selectedCluster.map_y}%`,
                    }}
                  >
                    <div className="relative">
                      <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 bg-red-500/25" />

                      <div className="relative h-6 w-6 rounded-full border-4 border-white bg-red-600 shadow-xl" />

                      <div className="pointer-events-none absolute left-1/2 top-9 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-3 py-2 text-xs font-semibold text-white shadow-xl">
                        {selectedCluster.name}
                      </div>
                    </div>
                  </button>
                )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}