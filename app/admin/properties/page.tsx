import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PropertyManagerClient from "./PropertyManagerClient";

export default async function AdminPropertiesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: community, error: communityError } = await supabase
    .from("communities")
    .select("id, name, slug")
    .eq("slug", "damac-hills-2")
    .single();

  if (communityError || !community) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-semibold">Property Manager</h1>
          <p className="mt-4 text-red-400">
            DAMAC Hills 2 community could not be loaded.
          </p>
        </div>
      </main>
    );
  }

  const [{ data: clusters, error: clustersError }, { data: properties, error: propertiesError }] =
    await Promise.all([
      supabase
        .from("clusters")
        .select("id, name, slug")
        .eq("community_id", community.id)
        .order("name", { ascending: true }),

      supabase
        .from("properties")
        .select(`
          id,
          community_id,
          cluster_id,
          layout_id,
          reference,
          title,
          slug,
          transaction_type,
          property_type,
          bedrooms,
          bathrooms,
          built_up_area_sqft,
          plot_area_sqft,
          price,
          status,
          occupancy_status,
          latitude,
          longitude,
          short_description,
          description,
          featured,
          published,
          created_at,
          updated_at,
          furnishing_status,
          view_type,
          parking_spaces,
          availability_date,
          contact_whatsapp,
          map_x,
          map_y
        `)
        .eq("community_id", community.id)
        .order("created_at", { ascending: false }),
    ]);

  if (clustersError) {
    console.error("Clusters error:", clustersError);
  }

  if (propertiesError) {
    console.error("Properties error:", propertiesError);
  }

  return (
    <PropertyManagerClient
      communityId={community.id}
      communityName={community.name}
      initialClusters={clusters ?? []}
      initialProperties={properties ?? []}
    />
  );
}