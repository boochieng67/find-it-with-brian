import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data: clusters, error } = await supabase
    .from("clusters")
    .select(`
      id,
      name,
      slug,
      display_order,
      brian_score,
      communities!inner (
        slug
      )
    `)
    .eq("communities.slug", "damac-hills-2")
    .eq("published", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Clusters loading error:", error);
  }

  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#171717]">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-5 md:px-10 lg:px-16">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
            Find It With Brian
          </p>

          <h1 className="text-lg font-semibold">
            DAMAC Hills 2 Property Specialist
          </h1>
        </div>

        <button className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white">
          Talk to Brian
        </button>
      </header>

      {/* HERO */}
      <section className="flex min-h-[78vh] items-center px-6 py-16 md:px-10 lg:px-16">
        <div className="max-w-5xl">
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-neutral-500">
            Explore DAMAC Hills 2
          </p>

          <h2 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            Find the right cluster.
            <br />
            Find the right home.
          </h2>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-600">
            Explore DAMAC Hills 2 by cluster, property type, layout, lifestyle,
            budget and location — with local guidance from Brian.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/damac-hills-2"
              className="rounded-full bg-black px-7 py-4 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Explore DAMAC Hills 2
            </Link>

            <button className="rounded-full border border-neutral-300 bg-white px-7 py-4 text-sm font-medium transition hover:border-black">
              View Properties
            </button>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="border-t border-neutral-200 px-6 py-16 md:px-10 lg:px-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Link
            href="/damac-hills-2"
            className="group rounded-3xl bg-white p-7 transition hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm text-neutral-500">Explore</p>

              <span className="text-neutral-400 transition group-hover:translate-x-1">
                →
              </span>
            </div>

            <h3 className="mt-3 text-2xl font-semibold">
              {clusters?.length ?? 0} Clusters
            </h3>

            <p className="mt-3 text-neutral-600">
              Discover the established residential clusters that make up DAMAC
              Hills 2.
            </p>
          </Link>

          <div className="rounded-3xl bg-white p-7">
            <p className="text-sm text-neutral-500">Compare</p>

            <h3 className="mt-3 text-2xl font-semibold">
              Find Your Best Match
            </h3>

            <p className="mt-3 text-neutral-600">
              Compare clusters based on budget, lifestyle, accessibility,
              amenities and property type.
            </p>
          </div>

          <div className="rounded-3xl bg-black p-7 text-white">
            <p className="text-sm text-neutral-400">Local Guidance</p>

            <h3 className="mt-3 text-2xl font-semibold">Ask Brian</h3>

            <p className="mt-3 text-neutral-300">
              Get help narrowing down the right cluster and available
              properties inside DAMAC Hills 2.
            </p>
          </div>
        </div>
      </section>

      {/* CLUSTER PREVIEW */}
      <section className="border-t border-neutral-200 px-6 py-20 md:px-10 lg:px-16">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-neutral-500">
              Explore the community
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              DAMAC Hills 2 clusters
            </h2>

            <p className="mt-5 text-lg leading-8 text-neutral-600">
              Start with a cluster and explore its homes, layouts, location,
              amenities and local insight.
            </p>
          </div>

          <Link
            href="/damac-hills-2"
            className="inline-flex items-center gap-2 text-sm font-medium"
          >
            Open Community Explorer
            <span>→</span>
          </Link>
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800">
            We could not load the clusters from Supabase.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {clusters?.map((cluster) => (
              <Link
                key={cluster.id}
                href={`/damac-hills-2/clusters/${cluster.slug}`}
                className="group flex min-h-48 flex-col justify-between rounded-3xl bg-white p-6 transition hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                    Cluster
                  </span>

                  <span className="text-neutral-400 transition group-hover:translate-x-1 group-hover:text-black">
                    →
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold">{cluster.name}</h3>

                  <p className="mt-2 text-sm text-neutral-500">
                    {cluster.brian_score
                      ? `Brian Score ${cluster.brian_score}/10`
                      : "Explore properties, layouts and local insight."}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* BOTTOM CTA */}
      <section className="px-6 pb-20 md:px-10 lg:px-16">
        <div className="rounded-[2rem] bg-black px-7 py-12 text-white md:px-12 md:py-16">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-neutral-400">
            Not sure where to start?
          </p>

          <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
                Tell Brian what you&apos;re looking for.
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-300">
                Budget, bedrooms, investment goals or lifestyle — we&apos;ll
                eventually use this to match you with the most suitable DAMAC
                Hills 2 clusters.
              </p>
            </div>

            <button className="shrink-0 rounded-full bg-white px-7 py-4 text-sm font-medium text-black">
              Ask Brian
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}