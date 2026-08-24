import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

  console.log(
    "Explorer map clusters:",
    clusters?.map((cluster) => ({
      name: cluster.name,
      map_x: cluster.map_x,
      map_y: cluster.map_y,
    }))
  );

  const mappedClusters =
    clusters?.filter(
      (cluster) =>
        cluster.map_x !== null &&
        cluster.map_y !== null
    ) ?? [];

  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#171717]">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-5 md:px-10 lg:px-16">
        <Link href="/" className="text-sm font-medium">
          ← Find It With Brian
        </Link>

        <button className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white">
          Talk to Brian
        </button>
      </header>

      {/* INTRO */}
      <section className="px-6 pb-12 pt-14 md:px-10 lg:px-16">
        <div className="max-w-5xl">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-neutral-500">
            Community Explorer
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-7xl">
            Explore DAMAC Hills 2
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
            Discover DAMAC Hills 2 cluster by cluster. Compare locations,
            lifestyle, property options and Brian&apos;s local insight.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-full bg-white px-4 py-2 text-sm">
              {clusters?.length ?? 0} clusters loaded
            </div>

            <div className="rounded-full bg-white px-4 py-2 text-sm">
              {mappedClusters.length} mapped
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORER */}
      <section className="px-6 pb-20 md:px-10 lg:px-16">
        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800">
            We could not load the DAMAC Hills 2 clusters from Supabase.
          </div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
            {/* MAP */}
            <div className="overflow-hidden rounded-[2rem] bg-[#ded9ce] p-4 md:p-8">
              <div className="relative min-h-[700px] overflow-hidden rounded-[1.5rem] bg-[#cac4b7]">
                {/* MAP PLACEHOLDER */}
                <div className="absolute inset-0">
                  <div className="absolute inset-x-0 top-0 h-24 border-b border-black/10 bg-black/[0.03]" />

                  <div className="absolute inset-x-0 bottom-0 h-24 border-t border-black/10 bg-black/[0.03]" />

                  <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white/20" />
                </div>

                {/* CENTER LABEL */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 text-center">
                  <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-600">
                    Interactive Masterplan
                  </p>

                  <h2 className="mt-4 text-4xl font-semibold text-neutral-700">
                    DAMAC Hills 2
                  </h2>

                  <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-neutral-600">
                    Temporary map layer while we verify the cluster positions.
                  </p>
                </div>

                {/* CLUSTER MARKERS */}
                {mappedClusters.map((cluster) => (
                  <Link
                    key={cluster.id}
                    href={`/damac-hills-2/clusters/${cluster.slug}`}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${cluster.map_x}%`,
                      top: `${cluster.map_y}%`,
                    }}
                  >
                    <div className="group relative">
                      <div className="rounded-full border-2 border-white bg-red-600 px-3 py-2 text-xs font-bold text-white shadow-xl transition hover:scale-110 hover:bg-black">
                        {cluster.name}
                      </div>
                    </div>
                  </Link>
                ))}

                {/* DEBUG MESSAGE */}
                {mappedClusters.length === 0 && (
                  <div className="absolute bottom-6 left-6 right-6 z-30 rounded-2xl bg-red-600 p-4 text-sm font-medium text-white">
                    No cluster coordinates reached the map.
                  </div>
                )}
              </div>
            </div>

            {/* CLUSTER LIST */}
            <aside className="rounded-[2rem] bg-white p-6 md:p-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-neutral-500">
                    Community
                  </p>

                  <h2 className="mt-2 text-3xl font-semibold">
                    {clusters?.length ?? 0} Clusters
                  </h2>
                </div>

                <span className="text-sm text-neutral-400">
                  Explore
                </span>
              </div>

              <div className="mt-8 max-h-[700px] space-y-2 overflow-y-auto pr-2">
                {clusters?.map((cluster) => (
                  <Link
                    key={cluster.id}
                    href={`/damac-hills-2/clusters/${cluster.slug}`}
                    className="group flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-4 transition hover:border-black hover:bg-neutral-50"
                  >
                    <div>
                      <p className="font-medium">
                        {cluster.name}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {cluster.brian_score
                          ? `Brian Score ${cluster.brian_score}/10`
                          : cluster.map_x !== null &&
                              cluster.map_y !== null
                            ? "Mapped"
                            : "Not mapped"}
                      </p>
                    </div>

                    <span className="text-neutral-400 transition group-hover:translate-x-1 group-hover:text-black">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}