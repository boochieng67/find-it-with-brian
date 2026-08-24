import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MasterplanExplorer from "./MasterplanExplorer";

export default async function DamacHills2Page() {
  const supabase = await createClient();

  const { data: clusters, error } = await supabase
    .from("clusters")
    .select(`
      id,
      name,
      slug,
      map_x,
      map_y,
      brian_score,
      short_description,
      display_order,
      communities!inner (
        slug
      )
    `)
    .eq("communities.slug", "damac-hills-2")
    .eq("published", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("DAMAC Hills 2 clusters error:", error);
  }

  /*
   * MASTERPLAN SETTINGS
   *
   * The public explorer now reads the live masterplan
   * selected from the admin calibration manager.
   */
  const {
    data: masterplanSettings,
    error: masterplanError,
  } = await supabase
    .from("masterplan_settings")
    .select(`
      live_image_url,
      live_storage_path,
      communities!inner (
        slug
      )
    `)
    .eq(
      "communities.slug",
      "damac-hills-2"
    )
    .maybeSingle();

  if (masterplanError) {
    console.error(
      "DAMAC Hills 2 masterplan settings error:",
      masterplanError
    );
  }

  /*
   * FALLBACK
   *
   * If there is no uploaded live image yet,
   * continue using the existing local 3.png.
   */
  const liveMasterplanImage =
    masterplanSettings?.live_image_url ||
    "/images/masterplan/3.png";

  const mappedClusters =
    clusters?.filter(
      (cluster) =>
        cluster.map_x !== null &&
        cluster.map_y !== null
    ) ?? [];

  return (
    <main className="min-h-screen bg-[#f4f1ea] text-[#171717]">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-5 md:px-10 lg:px-16">
        <Link href="/" className="group">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-neutral-500">
            Find It With Brian
          </p>

          <p className="mt-1 text-sm font-medium">
            ← Back Home
          </p>
        </Link>

        <button className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800">
          Talk to Brian
        </button>
      </header>

      {/* INTRO */}
      <section className="px-6 pb-12 pt-14 md:px-10 lg:px-16">
        <div className="max-w-5xl">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-neutral-500">
            Community Explorer
          </p>

          <h1 className="mt-4 max-w-5xl text-5xl font-semibold leading-[0.98] tracking-tight md:text-7xl lg:text-8xl">
            Explore DAMAC Hills 2.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-600">
            Explore the community visually and open any cluster to view local
            insight, properties, layouts and location information.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm">
              {clusters?.length ?? 0} clusters
            </div>

            <div className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm">
              {mappedClusters.length} mapped
            </div>

            <div className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm">
              Interactive masterplan
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORER */}
      <section className="px-6 pb-24 md:px-10 lg:px-16">
        {error ? (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-800">
            We could not load the DAMAC Hills 2 community data.
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.4fr)]">
            {/* INTERACTIVE MASTERPLAN */}
            <MasterplanExplorer
              imageUrl={liveMasterplanImage}
              clusters={mappedClusters}
            />

            {/* CLUSTER PANEL */}
            <aside className="flex max-h-[810px] flex-col overflow-hidden rounded-[2rem] bg-[#171717] text-white">
              <div className="border-b border-white/10 p-7 md:p-8">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/40">
                  DAMAC Hills 2
                </p>

                <div className="mt-3 flex items-end justify-between gap-4">
                  <h2 className="text-3xl font-semibold">
                    Clusters
                  </h2>

                  <span className="text-sm text-white/40">
                    {clusters?.length ?? 0}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-white/55">
                  Choose a cluster to see local insight, properties and
                  community information.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {clusters?.map(
                  (cluster, index) => (
                    <Link
                      key={cluster.id}
                      href={`/damac-hills-2/clusters/${cluster.slug}`}
                      className="group flex items-center gap-4 rounded-2xl px-4 py-4 transition hover:bg-white/10"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-xs text-white/40 transition group-hover:border-white/30 group-hover:text-white">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {cluster.name}
                        </p>

                        <p className="mt-1 text-xs text-white/40">
                          {cluster.brian_score
                            ? `Brian Score ${cluster.brian_score}/10`
                            : "Explore cluster"}
                        </p>
                      </div>

                      <span className="text-white/30 transition group-hover:translate-x-1 group-hover:text-white">
                        →
                      </span>
                    </Link>
                  )
                )}
              </div>

              <div className="border-t border-white/10 p-6">
                <div className="rounded-2xl bg-white/5 p-5">
                  <p className="text-sm font-medium">
                    Not sure where to start?
                  </p>

                  <p className="mt-2 text-xs leading-5 text-white/50">
                    Tell Brian your budget, bedroom requirement and priorities
                    and get a shortlist.
                  </p>

                  <button className="mt-4 rounded-full bg-white px-5 py-3 text-xs font-semibold text-black">
                    Ask Brian
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>

      {/* EXPLANATION */}
      <section className="border-t border-neutral-200 px-6 py-20 md:px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-neutral-500">
              Understand the community
            </p>

            <h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
              See where each cluster sits before you start viewing.
            </h2>
          </div>

          <div className="max-w-xl">
            <p className="text-lg leading-8 text-neutral-600">
              DAMAC Hills 2 contains different residential clusters with
              different positions, surroundings, layouts and property options.
              Use the masterplan to understand the community visually before
              comparing individual homes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}