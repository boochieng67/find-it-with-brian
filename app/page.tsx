export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#171717]">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
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
            <button className="rounded-full bg-black px-7 py-4 text-sm font-medium text-white">
              Explore DAMAC Hills 2
            </button>

            <button className="rounded-full border border-neutral-300 bg-white px-7 py-4 text-sm font-medium">
              View Properties
            </button>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 px-6 py-16 md:px-10 lg:px-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-7">
            <p className="text-sm text-neutral-500">Explore</p>
            <h3 className="mt-3 text-2xl font-semibold">29 Clusters</h3>
            <p className="mt-3 text-neutral-600">
              Discover Vardon, Zinnia, Basswood, Albizia and every major
              DAMAC Hills 2 cluster.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-7">
            <p className="text-sm text-neutral-500">Compare</p>
            <h3 className="mt-3 text-2xl font-semibold">Find Your Best Match</h3>
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
    </main>
  );
}