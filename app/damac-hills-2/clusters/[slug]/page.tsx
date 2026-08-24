import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ClusterPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ClusterPage({
  params,
}: ClusterPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: cluster, error } = await supabase
    .from("clusters")
    .select(`
      id,
      name,
      slug,
      short_description,
      description,
      brian_score,
      family_score,
      investment_score,
      accessibility_score,
      amenities_score,
      privacy_score,
      communities!inner (
        name,
        slug
      )
    `)
    .eq("slug", slug)
    .eq("communities.slug", "damac-hills-2")
    .eq("published", true)
    .single();

  if (error || !cluster) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#171717]">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <a href="/" className="text-sm font-medium">
          ← Find It With Brian
        </a>

        <button className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white">
          Talk to Brian
        </button>
      </header>

      <section className="px-6 py-20 md:px-10 lg:px-16">
        <div className="max-w-5xl">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-neutral-500">
            DAMAC Hills 2
          </p>

          <h1 className="mt-5 text-6xl font-semibold tracking-tight md:text-8xl">
            {cluster.name}
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-600">
            {cluster.short_description ??
              `Explore properties, layouts, lifestyle and local insight in ${cluster.name}, DAMAC Hills 2.`}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button className="rounded-full bg-black px-7 py-4 text-sm font-medium text-white">
              View Properties
            </button>

            <button className="rounded-full border border-neutral-300 bg-white px-7 py-4 text-sm font-medium">
              Ask Brian About {cluster.name}
            </button>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 px-6 py-16 md:px-10 lg:px-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-7">
            <p className="text-sm text-neutral-500">Cluster</p>
            <h2 className="mt-3 text-2xl font-semibold">{cluster.name}</h2>
          </div>

          <div className="rounded-3xl bg-white p-7">
            <p className="text-sm text-neutral-500">Community</p>
            <h2 className="mt-3 text-2xl font-semibold">DAMAC Hills 2</h2>
          </div>

          <div className="rounded-3xl bg-black p-7 text-white">
            <p className="text-sm text-neutral-400">Brian Score</p>
            <h2 className="mt-3 text-2xl font-semibold">
              {cluster.brian_score
                ? `${cluster.brian_score}/10`
                : "Coming Soon"}
            </h2>
          </div>
        </div>
      </section>
      <section className="border-t border-neutral-200 px-6 py-16 md:px-10 lg:px-16">
  <div className="max-w-5xl">
    <p className="text-sm font-medium uppercase tracking-[0.25em] text-neutral-500">
      Brian's Local Assessment
    </p>

    <h2 className="mt-4 text-4xl font-semibold tracking-tight">
      How {cluster.name} compares
    </h2>

    <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[
        ["Family Living", cluster.family_score],
        ["Investment", cluster.investment_score],
        ["Accessibility", cluster.accessibility_score],
        ["Amenities", cluster.amenities_score],
        ["Privacy", cluster.privacy_score],
      ].map(([label, score]) => (
        <div key={label} className="rounded-3xl bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="text-neutral-600">{label}</p>

            <p className="font-semibold">
              {score ? `${score}/10` : "—"}
            </p>
          </div>
        </div>
      ))}
    </div>

    <p className="mt-6 max-w-2xl text-sm leading-6 text-neutral-500">
      These scores represent Brian's local assessment and are intended as
      guidance rather than official market ratings.
    </p>
  </div>
</section>
    </main>
  );
}