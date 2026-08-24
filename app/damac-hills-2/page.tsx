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
            Move through the community cluster by cluster and discover where
            each neighbourhood sits within DAMAC Hills 2.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm">
              {clusters?.length ?? 0} clusters
            </div>

            <div className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm">
              {mappedClusters.length} mapped
            </div>

            <div className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm">
              Interactive explorer
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
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.45fr)]">
            {/* MASTERPLAN */}
            <div className="overflow-hidden rounded-[2rem] bg-[#d9d5ca] p-3 shadow-sm md:p-5">
              <div className="relative min-h-[760px] overflow-hidden rounded-[1.6rem] bg-[#d7d4c9]">
                {/* BACKGROUND */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.75),rgba(255,255,255,0)_48%)]" />

                {/* MASTERPLAN SVG */}
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 1000 760"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  {/* GREEN LANDSCAPE */}
                  <path
                    d="M55 170 C160 85, 290 120, 350 180 C430 255, 520 165, 620 175 C730 190, 790 130, 950 170 L960 520 C845 555, 770 525, 680 555 C565 600, 475 525, 360 565 C255 600, 155 565, 50 610 Z"
                    fill="#bfc9aa"
                    opacity="0.78"
                  />

                  {/* CENTRAL LANDSCAPE */}
                  <path
                    d="M225 250 C325 185, 425 205, 505 265 C585 325, 660 280, 770 305 C835 320, 875 390, 835 450 C795 515, 690 500, 615 485 C520 465, 455 515, 355 500 C255 485, 170 420, 175 345 C178 300, 195 270, 225 250 Z"
                    fill="#aebd96"
                    opacity="0.72"
                  />

                  {/* WATER */}
                  <path
                    d="M400 324 C445 288, 510 290, 553 321 C590 348, 588 397, 550 424 C505 455, 437 448, 398 413 C365 382, 365 352, 400 324 Z"
                    fill="#a8c9cf"
                    opacity="0.92"
                  />

                  {/* MAJOR ROAD 1 */}
                  <path
                    d="M-40 128 C145 130, 310 90, 500 115 C700 140, 835 95, 1040 135"
                    stroke="#f6f3eb"
                    strokeWidth="28"
                    fill="none"
                    opacity="0.96"
                  />

                  <path
                    d="M-40 128 C145 130, 310 90, 500 115 C700 140, 835 95, 1040 135"
                    stroke="#b9b5ac"
                    strokeWidth="2"
                    fill="none"
                  />

                  {/* MAJOR ROAD 2 */}
                  <path
                    d="M-35 640 C170 605, 315 670, 500 628 C680 588, 845 655, 1040 615"
                    stroke="#f6f3eb"
                    strokeWidth="30"
                    fill="none"
                  />

                  <path
                    d="M-35 640 C170 605, 315 670, 500 628 C680 588, 845 655, 1040 615"
                    stroke="#b9b5ac"
                    strokeWidth="2"
                    fill="none"
                  />

                  {/* INNER ROAD */}
                  <path
                    d="M185 180 C330 240, 305 345, 420 405 C535 465, 655 420, 790 525"
                    stroke="#eeeae1"
                    strokeWidth="18"
                    fill="none"
                    opacity="0.95"
                  />

                  <path
                    d="M760 175 C680 260, 720 350, 610 425 C520 485, 420 555, 310 625"
                    stroke="#eeeae1"
                    strokeWidth="15"
                    fill="none"
                    opacity="0.95"
                  />

                  {/* SMALLER ROADS */}
                  <path
                    d="M145 260 C260 315, 345 300, 420 365"
                    stroke="#eeeae1"
                    strokeWidth="10"
                    fill="none"
                  />

                  <path
                    d="M590 215 C615 295, 590 350, 675 415"
                    stroke="#eeeae1"
                    strokeWidth="10"
                    fill="none"
                  />
                </svg>

                {/* ROAD LABELS */}
                <div className="pointer-events-none absolute left-1/2 top-[6%] z-10 -translate-x-1/2 rounded-full bg-white/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-600 backdrop-blur">
                  Dubai – Al Ain Road
                </div>

                <div className="pointer-events-none absolute bottom-[6%] left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-600 backdrop-blur">
                  Al Qudra Direction
                </div>

                {/* COMMUNITY ZONES */}
                <div className="pointer-events-none absolute left-[47%] top-[45%] z-10 -translate-x-1/2 text-center">
                  <div className="mx-auto h-2 w-2 rounded-full bg-[#688c92]" />

                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#49696f]">
                    Water Town
                  </p>
                </div>

                <div className="pointer-events-none absolute left-[59%] top-[57%] z-10 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#667151]">
                    Sports Town
                  </p>
                </div>

                <div className="pointer-events-none absolute left-[31%] top-[48%] z-10 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#667151]">
                    Down Town
                  </p>
                </div>

                {/* BRAND */}
                <div className="pointer-events-none absolute left-8 top-8 z-10">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
                    Find It With Brian
                  </p>

                  <p className="mt-2 text-xl font-semibold">
                    DAMAC Hills 2
                  </p>
                </div>

                {/* CLUSTER MARKERS */}
                {mappedClusters.map((cluster) => (
                  <Link
                    key={cluster.id}
                    href={`/damac-hills-2/clusters/${cluster.slug}`}
                    className="group absolute z-30 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${cluster.map_x}%`,
                      top: `${cluster.map_y}%`,
                    }}
                  >
                    <div className="relative flex items-center justify-center">
                      {/* HOVER RING */}
                      <div className="absolute h-8 w-8 scale-0 rounded-full border border-black/20 transition duration-300 group-hover:scale-100" />

                      {/* MARKER */}
                      <div className="relative h-3.5 w-3.5 rounded-full border-[3px] border-white bg-black shadow-md transition duration-300 group-hover:scale-125" />

                      {/* LABEL */}
                      <div className="pointer-events-none absolute left-1/2 top-6 z-50 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-black px-3 py-2 text-xs font-medium text-white shadow-xl group-hover:block">
                        {cluster.name}

                        {cluster.brian_score && (
                          <span className="ml-2 text-white/60">
                            {cluster.brian_score}/10
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}

                {/* MAP INSTRUCTION */}
                <div className="absolute bottom-7 left-7 z-20 rounded-2xl bg-black/85 px-4 py-3 text-white shadow-xl backdrop-blur">
                  <p className="text-xs font-medium">
                    Select a cluster
                  </p>

                  <p className="mt-1 text-[11px] text-white/60">
                    Hover or tap a marker to explore
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <aside className="flex max-h-[810px] flex-col overflow-hidden rounded-[2rem] bg-[#171717] text-white">
              <div className="border-b border-white/10 p-7 md:p-8">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/40">
                  Explore
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
                  Choose a cluster to view local insight, properties, layouts
                  and community information.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {clusters?.map((cluster, index) => (
                  <Link
                    key={cluster.id}
                    href={`/damac-hills-2/clusters/${cluster.slug}`}
                    className="group flex items-center gap-4 rounded-2xl px-4 py-4 transition hover:bg-white/10"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-xs text-white/40 transition group-hover:border-white/30 group-hover:text-white">
                      {String(index + 1).padStart(2, "0")}
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
                ))}
              </div>

              <div className="border-t border-white/10 p-6">
                <div className="rounded-2xl bg-white/5 p-5">
                  <p className="text-sm font-medium">
                    Not sure which cluster?
                  </p>

                  <p className="mt-2 text-xs leading-5 text-white/50">
                    Tell Brian your budget, bedrooms and priorities and get a
                    shortlist.
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

      {/* BELOW MAP */}
      <section className="border-t border-neutral-200 px-6 py-20 md:px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-neutral-500">
              Understand the community
            </p>

            <h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
              More than a list of properties.
            </h2>
          </div>

          <div className="max-w-xl">
            <p className="text-lg leading-8 text-neutral-600">
              DAMAC Hills 2 is made up of different clusters with different
              positions, surroundings, layouts and property options. The goal
              of this explorer is to help you understand those differences
              before you start viewing homes.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-3 text-sm font-semibold"
            >
              Back to Find It With Brian
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}