import { createClient } from "@/lib/supabase/server";
import MapCalibrationClient from "./MapCalibrationClient";

export default async function MapCalibrationPage() {
  const supabase = await createClient();

  const { data: community } = await supabase
    .from("communities")
    .select("id, name, slug")
    .eq("slug", "damac-hills-2")
    .single();

  if (!community) {
    return (
      <main className="p-10">
        <p>DAMAC Hills 2 community could not be found.</p>
      </main>
    );
  }

  const { data: clusters, error: clustersError } = await supabase
    .from("clusters")
    .select(`
      id,
      name,
      slug,
      map_x,
      map_y,
      display_order
    `)
    .eq("community_id", community.id)
    .order("display_order", { ascending: true });

  if (clustersError) {
    console.error("Calibration clusters error:", clustersError);
  }

  const { data: amenities, error: amenitiesError } = await supabase
    .from("amenities")
    .select(`
      id,
      name,
      slug,
      category,
      icon,
      map_x,
      map_y,
      featured,
      published
    `)
    .eq("community_id", community.id)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (amenitiesError) {
    console.error("Calibration amenities error:", amenitiesError);
  }

  const { data: masterplanSettings, error: settingsError } =
    await supabase
      .from("masterplan_settings")
      .select(`
        id,
        community_id,
        live_image_url,
        live_storage_path,
        reference_image_url,
        reference_storage_path
      `)
      .eq("community_id", community.id)
      .single();

  if (settingsError) {
    console.error(
      "Masterplan settings error:",
      settingsError
    );
  }

  return (
    <MapCalibrationClient
      communityId={community.id}
      initialClusters={clusters ?? []}
      initialAmenities={amenities ?? []}
      initialSettings={{
        id: masterplanSettings?.id ?? null,
        live_image_url:
          masterplanSettings?.live_image_url ?? null,
        live_storage_path:
          masterplanSettings?.live_storage_path ?? null,
        reference_image_url:
          masterplanSettings?.reference_image_url ?? null,
        reference_storage_path:
          masterplanSettings?.reference_storage_path ?? null,
      }}
    />
  );
}
