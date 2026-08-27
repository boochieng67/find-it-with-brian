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

type CalibrationMode = "clusters" | "amenities";

type Cluster = {
  id: string;
  name: string;
  slug: string;
  map_x: number | null;
  map_y: number | null;
  display_order: number | null;
};

type Amenity = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  icon: string | null;
  map_x: number | null;
  map_y: number | null;
  featured: boolean | null;
  published: boolean | null;
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
  initialAmenities: Amenity[];
  initialSettings: MasterplanSettings;
};

export default function MapCalibrationClient({
  communityId,
  initialClusters,
  initialAmenities,
  initialSettings,
}: Props) {
  const supabase = createClient();

  const mapRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] =
    useState<CalibrationMode>("clusters");

  const [clusters, setClusters] =
    useState<Cluster[]>(initialClusters);

  const [amenities, setAmenities] =
    useState<Amenity[]>(initialAmenities);

  const [settings, setSettings] =
    useState<MasterplanSettings>(
      initialSettings
    );

  const [selectedClusterId, setSelectedClusterId] =
    useState(initialClusters[0]?.id ?? "");

  const [selectedAmenityId, setSelectedAmenityId] =
    useState(initialAmenities[0]?.id ?? "");

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

  const activeItems = mode === "clusters"
    ? clusters
    : amenities;

  const selectedId = mode === "clusters"
    ? selectedClusterId
    : selectedAmenityId;

  const selectedIndex = useMemo(
    () =>
      activeItems.findIndex(
        (item) => item.id === selectedId
      ),
    [activeItems, selectedId]
  );

  const selectedItem = useMemo(
    () =>
      activeItems.find(
        (item) => item.id === selectedId
      ) ?? null,
    [activeItems, selectedId]
  );

  const mappedCount = useMemo(
    () =>
      activeItems.filter(
        (item) =>
          item.map_x !== null &&
          item.map_y !== null
      ).length,
    [activeItems]
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

  const modeLabel =
    mode === "clusters"
      ? "Cluster"
      : "Amenity";

  function setCurrentSelectedId(id: string) {
    if (mode === "clusters") {
      setSelectedClusterId(id);
    } else {
      setSelectedAmenityId(id);
    }
  }

  function updateSelectedPosition(
    x: number,
    y: number
  ) {
    if (!selectedItem) return;

    const safeX = Math.min(
      100,
      Math.max(0, x)
    );

    const safeY = Math.min(
      100,
      Math.max(0, y)
    );

    if (mode === "clusters") {
      setClusters((current) =>
        current.map((cluster) =>
          cluster.id === selectedItem.id
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
    } else {
      setAmenities((current) =>
        current.map((amenity) =>
          amenity.id === selectedItem.id
            ? {
                ...amenity,
                map_x: Number(
                  safeX.toFixed(2)
                ),
                map_y: Number(
                  safeY.toFixed(2)
                ),
              }
            : amenity
        )
      );
    }

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
    if (!selectedItem) return;

    const target =
      event.target as HTMLElement;

    if (
      target.closest(
        "[data-calibration-marker]"
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

  function selectPreviousItem() {
    if (activeItems.length === 0) return;

    const newIndex =
      selectedIndex <= 0
        ? activeItems.length - 1
        : selectedIndex - 1;

    setCurrentSelectedId(
      activeItems[newIndex].id
    );

    setMessage("");
  }

  function selectNextItem() {
    if (activeItems.length === 0) return;

    const newIndex =
      selectedIndex >=
      activeItems.length - 1
        ? 0
        : selectedIndex + 1;

    setCurrentSelectedId(
      activeItems[newIndex].id
    );

    setMessage("");
  }

  function changeMode(
    nextMode: CalibrationMode
  ) {
    setMode(nextMode);
    setMessage("");
    setDragging(false);
  }

  async function savePosition(
    moveNext = false
  ) {
    if (
      !selectedItem ||
      selectedItem.map_x === null ||
      selectedItem.map_y === null
    ) {
      setMessage(
        `Place the ${modeLabel.toLowerCase()} on the map first.`
      );

      return;
    }

    setSaving(true);
    setMessage("");

    const itemName = selectedItem.name;

    const { error } = await supabase
      .from(
        mode === "clusters"
          ? "clusters"
          : "amenities"
      )
      .update({
        map_x: selectedItem.map_x,
        map_y: selectedItem.map_y,
      })
      .eq("id", selectedItem.id);

    setSaving(false);

    if (error) {
      console.error(
        `${modeLabel} map position save error:`,
        error
      );

      setMessage(
        `Could not save the ${modeLabel.toLowerCase()} position.`
      );

      return;
    }

    if (moveNext) {
      setMessage(`${itemName} saved.`);

      const newIndex =
        selectedIndex >=
        activeItems.length - 1
          ? 0
          : selectedIndex + 1;

      setCurrentSelectedId(
        activeItems[newIndex].id
      );

      return;
    }

    setMessage(
      `${itemName} saved successfully.`
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
              while positioning clusters and amenities.
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
      <section className="grid gap-6 px-6 py-8 md:px-10 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">
              Calibration
            </p>

            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
              {activeItems.length
                ? selectedIndex + 1
                : 0}{" "}
              / {activeItems.length}
            </span>
          </div>

          {/* CALIBRATION MODE */}
          <div className="mt-5">
            <p className="text-sm font-medium">
              Calibrate
            </p>

            <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() =>
                  changeMode("clusters")
                }
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  mode === "clusters"
                    ? "bg-black text-white shadow"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                Clusters
              </button>

              <button
                type="button"
                onClick={() =>
                  changeMode("amenities")
                }
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  mode === "amenities"
                    ? "bg-black text-white shadow"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                Amenities
              </button>
            </div>
          </div>

          {/* PROGRESS */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>
                {modeLabel} positions
              </span>

              <span>
                {mappedCount}/
                {activeItems.length}
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-black transition-all"
                style={{
                  width: `${
                    activeItems.length
                      ? (mappedCount /
                          activeItems.length) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <label className="mt-7 block text-sm font-medium">
            Select {modeLabel.toLowerCase()}
          </label>

          {activeItems.length ? (
            <select
              value={selectedId}
              onChange={(event) => {
                setCurrentSelectedId(
                  event.target.value
                );
                setMessage("");
              }}
              className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3"
            >
              {activeItems.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {mode === "amenities" &&
                  "category" in item &&
                  item.category
                    ? `${item.name} — ${item.category}`
                    : item.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="mt-2 rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-500">
              No {mode} found for DAMAC Hills 2.
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={
                selectPreviousItem
              }
              disabled={!activeItems.length}
              className="rounded-2xl border border-neutral-300 px-4 py-3 text-sm font-medium disabled:opacity-40"
            >
              ← Previous
            </button>

            <button
              type="button"
              onClick={
                selectNextItem
              }
              disabled={!activeItems.length}
              className="rounded-2xl border border-neutral-300 px-4 py-3 text-sm font-medium disabled:opacity-40"
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
              Selected {modeLabel.toLowerCase()}
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {selectedItem?.name ??
                "None"}
            </p>

            {mode === "amenities" &&
              selectedItem &&
              "category" in selectedItem && (
                <p className="mt-1 text-xs text-neutral-500">
                  {selectedItem.category ||
                    "Uncategorized amenity"}
                </p>
              )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs text-neutral-400">
                  X
                </p>

                <p className="mt-1 font-semibold">
                  {selectedItem?.map_x ??
                    "—"}
                  %
                </p>
              </div>

              <div className="rounded-xl bg-white p-3">
                <p className="text-xs text-neutral-400">
                  Y
                </p>

                <p className="mt-1 font-semibold">
                  {selectedItem?.map_y ??
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
            disabled={
              saving ||
              !selectedItem
            }
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
            disabled={
              saving ||
              !selectedItem
            }
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
              {selectedItem ? (
                <>
                  Click anywhere to position{" "}
                  <strong>
                    {selectedItem.name}
                  </strong>
                  .
                </>
              ) : (
                `Add ${mode} before calibrating this layer.`
              )}
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

              {/* SAVED MARKERS FOR ACTIVE MODE */}
              {activeItems.map((item) => {
                if (
                  item.map_x === null ||
                  item.map_y === null
                ) {
                  return null;
                }

                const selected =
                  item.id === selectedId;

                return (
                  <div
                    key={item.id}
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${item.map_x}%`,
                      top: `${item.map_y}%`,
                    }}
                  >
                    <div
                      className={`rounded-full border-2 border-white shadow ${
                        selected
                          ? mode === "clusters"
                            ? "h-4 w-4 bg-red-600"
                            : "h-4 w-4 bg-blue-600"
                          : mode === "clusters"
                            ? "h-2.5 w-2.5 bg-black/55"
                            : "h-2.5 w-2.5 bg-blue-700/60"
                      }`}
                    />
                  </div>
                );
              })}

              {/* ACTIVE MARKER */}
              {selectedItem &&
                selectedItem.map_x !==
                  null &&
                selectedItem.map_y !==
                  null && (
                  <button
                    type="button"
                    data-calibration-marker
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
                      left: `${selectedItem.map_x}%`,
                      top: `${selectedItem.map_y}%`,
                    }}
                    aria-label={`Move ${selectedItem.name}`}
                  >
                    <div className="relative">
                      <div
                        className={`absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 ${
                          mode === "clusters"
                            ? "bg-red-500/25"
                            : "bg-blue-500/25"
                        }`}
                      />

                      <div
                        className={`relative h-6 w-6 rounded-full border-4 border-white shadow-xl ${
                          mode === "clusters"
                            ? "bg-red-600"
                            : "bg-blue-600"
                        }`}
                      />

                      <div className="pointer-events-none absolute left-1/2 top-9 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-3 py-2 text-xs font-semibold text-white shadow-xl">
                        {selectedItem.name}
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