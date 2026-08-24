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

<section className="px-6 pb-10 pt-8 md:px-10 lg:px-16">
  <div className="overflow-hidden rounded-[2rem] bg-neutral-900">
    <div className="relative min-h-[68vh]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: cluster.hero_image_url
            ? `url(${cluster.hero_image_url})`
            : "linear-gradient(135deg, #2d2d2d, #111111)",
        }}
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative flex min-h-[68vh] items-end px-6 py-10 text-white md:px-10 md:py-14 lg:px-14">
        <div className="max-w-4xl">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-white/70">
            DAMAC Hills 2
          </p>

          <h1 className="mt-4 text-6xl font-semibold tracking-tight md:text-8xl">
            {cluster.name}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
            {cluster.short_description ??
              `Explore properties, layouts, lifestyle and local insight in ${cluster.name}, DAMAC Hills 2.`}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button className="rounded-full bg-white px-7 py-4 text-sm font-medium text-black">
              View Properties
            </button>

            <button className="rounded-full border border-white/30 bg-white/10 px-7 py-4 text-sm font-medium text-white backdrop-blur">
              Ask Brian About {cluster.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="px-6 py-16 md:px-10 lg:px-16">
  <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
    <div>
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-neutral-500">
        About {cluster.name}
      </p>

      <h2 className="mt-4 text-4xl font-semibold tracking-tight">
        Living in {cluster.name}
      </h2>

      <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-600">
        {cluster.description ??
          `${cluster.name} is one of the residential clusters within DAMAC Hills 2. More detailed local insight will be added as we continue building the community guide.`}
      </p>
    </div>

    <div className="rounded-3xl bg-white p-7">
      <p className="text-sm text-neutral-500">Brian Score</p>

      <p className="mt-3 text-5xl font-semibold">
        {cluster.brian_score ? cluster.brian_score : "—"}
      </p>

      <p className="mt-2 text-sm text-neutral-500">
        Local specialist assessment
      </p>
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