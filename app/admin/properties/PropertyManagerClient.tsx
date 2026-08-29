"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Cluster = {
  id: string;
  name: string;
  slug: string;
};

type Property = {
  id: string;
  community_id: string;
  cluster_id: string | null;
  layout_id: string | null;
  reference: string | null;
  title: string;
  slug: string;
  transaction_type: string;
  property_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  built_up_area_sqft: number | null;
  plot_area_sqft: number | null;
  price: number;
  status: string;
  occupancy_status: string | null;
  latitude: number | null;
  longitude: number | null;
  short_description: string | null;
  description: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
  furnishing_status: string | null;
  view_type: string | null;
  parking_spaces: number | null;
  availability_date: string | null;
  contact_whatsapp: string | null;
  map_x: number | null;
  map_y: number | null;
};

type Props = {
  communityId: string;
  communityName: string;
  initialClusters: Cluster[];
  initialProperties: Property[];
};

type FormState = {
  reference: string;
  title: string;
  cluster_id: string;
  transaction_type: string;
  property_type: string;
  bedrooms: string;
  bathrooms: string;
  built_up_area_sqft: string;
  plot_area_sqft: string;
  price: string;
  status: string;
  occupancy_status: string;
  furnishing_status: string;
  view_type: string;
  parking_spaces: string;
  availability_date: string;
  contact_whatsapp: string;
  short_description: string;
  description: string;
  featured: boolean;
  published: boolean;
};

const emptyForm: FormState = {
  reference: "",
  title: "",
  cluster_id: "",
  transaction_type: "sale",
  property_type: "townhouse",
  bedrooms: "",
  bathrooms: "",
  built_up_area_sqft: "",
  plot_area_sqft: "",
  price: "",
  status: "available",
  occupancy_status: "",
  furnishing_status: "",
  view_type: "",
  parking_spaces: "",
  availability_date: "",
  contact_whatsapp: "",
  short_description: "",
  description: "",
  featured: false,
  published: false,
};

function toNullableNumber(value: string) {
  if (!value.trim()) return null;

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function createSlug(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${base || "property"}-${Date.now()}`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function PropertyManagerClient({
  communityId,
  communityName,
  initialClusters,
  initialProperties,
}: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [properties, setProperties] =
    useState<Property[]>(initialProperties);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMessage(null);
    setError(null);
  };

  const startEditing = (property: Property) => {
    setEditingId(property.id);

    setForm({
      reference: property.reference ?? "",
      title: property.title,
      cluster_id: property.cluster_id ?? "",
      transaction_type: property.transaction_type,
      property_type: property.property_type,
      bedrooms:
        property.bedrooms !== null ? String(property.bedrooms) : "",
      bathrooms:
        property.bathrooms !== null ? String(property.bathrooms) : "",
      built_up_area_sqft:
        property.built_up_area_sqft !== null
          ? String(property.built_up_area_sqft)
          : "",
      plot_area_sqft:
        property.plot_area_sqft !== null
          ? String(property.plot_area_sqft)
          : "",
      price: String(property.price),
      status: property.status,
      occupancy_status: property.occupancy_status ?? "",
      furnishing_status: property.furnishing_status ?? "",
      view_type: property.view_type ?? "",
      parking_spaces:
        property.parking_spaces !== null
          ? String(property.parking_spaces)
          : "",
      availability_date: property.availability_date ?? "",
      contact_whatsapp: property.contact_whatsapp ?? "",
      short_description: property.short_description ?? "",
      description: property.description ?? "",
      featured: property.featured,
      published: property.published,
    });

    setMessage(null);
    setError(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      if (!form.title.trim()) {
        throw new Error("Property title is required.");
      }

      if (!form.price.trim() || Number(form.price) <= 0) {
        throw new Error("Enter a valid property price.");
      }

      const payload = {
        community_id: communityId,
        cluster_id: form.cluster_id || null,
        reference: form.reference.trim() || null,
        title: form.title.trim(),
        transaction_type: form.transaction_type,
        property_type: form.property_type,
        bedrooms: toNullableNumber(form.bedrooms),
        bathrooms: toNullableNumber(form.bathrooms),
        built_up_area_sqft: toNullableNumber(form.built_up_area_sqft),
        plot_area_sqft: toNullableNumber(form.plot_area_sqft),
        price: Number(form.price),
        status: form.status,
        occupancy_status: form.occupancy_status || null,
        furnishing_status: form.furnishing_status || null,
        view_type: form.view_type.trim() || null,
        parking_spaces: toNullableNumber(form.parking_spaces),
        availability_date: form.availability_date || null,
        contact_whatsapp: form.contact_whatsapp.trim() || null,
        short_description: form.short_description.trim() || null,
        description: form.description.trim() || null,
        featured: form.featured,
        published: form.published,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { data, error: updateError } = await supabase
          .from("properties")
          .update(payload)
          .eq("id", editingId)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        setProperties((current) =>
          current.map((property) =>
            property.id === editingId ? data : property,
          ),
        );

        setMessage("Property updated successfully.");
      } else {
        const { data, error: insertError } = await supabase
          .from("properties")
          .insert({
            ...payload,
            slug: createSlug(form.title),
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        setProperties((current) => [data, ...current]);

        setMessage("Property created successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);

      router.refresh();
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while saving the property.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (property: Property) => {
    const confirmed = window.confirm(
      `Delete "${property.title}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(property.id);
    setMessage(null);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("properties")
        .delete()
        .eq("id", property.id);

      if (deleteError) {
        throw deleteError;
      }

      setProperties((current) =>
        current.filter((item) => item.id !== property.id),
      );

      if (editingId === property.id) {
        resetForm();
      }

      setMessage("Property deleted successfully.");

      router.refresh();
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not delete the property.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-400">
              Admin
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Property Manager
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage listings for {communityName}.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Total properties
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {properties.length}
            </p>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-black/20 md:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingId ? "Edit property" : "Add property"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {editingId
                    ? "Update the selected property listing."
                    : "Create a new DAMAC Hills 2 listing."}
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel edit
                </button>
              )}
            </div>

            {message && (
              <div className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Property title" required>
                  <input
                    value={form.title}
                    onChange={(event) =>
                      updateField("title", event.target.value)
                    }
                    required
                    className={inputClass}
                    placeholder="3BR Townhouse in Vardon"
                  />
                </Field>

                <Field label="Reference">
                  <input
                    value={form.reference}
                    onChange={(event) =>
                      updateField("reference", event.target.value)
                    }
                    className={inputClass}
                    placeholder="FWB-001"
                  />
                </Field>

                <Field label="Cluster">
                  <select
                    value={form.cluster_id}
                    onChange={(event) =>
                      updateField("cluster_id", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">No cluster selected</option>

                    {initialClusters.map((cluster) => (
                      <option key={cluster.id} value={cluster.id}>
                        {cluster.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Transaction">
                  <select
                    value={form.transaction_type}
                    onChange={(event) =>
                      updateField(
                        "transaction_type",
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </Field>

                <Field label="Property type">
                  <select
                    value={form.property_type}
                    onChange={(event) =>
                      updateField("property_type", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="townhouse">Townhouse</option>
                    <option value="villa">Villa</option>
                    <option value="apartment">Apartment</option>
                    <option value="standalone_villa">
                      Standalone Villa
                    </option>
                    <option value="land">Land</option>
                  </select>
                </Field>

                <Field label="Price (AED)" required>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={(event) =>
                      updateField("price", event.target.value)
                    }
                    required
                    className={inputClass}
                    placeholder="1500000"
                  />
                </Field>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Property specifications
                </h3>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Bedrooms">
                    <input
                      type="number"
                      min="0"
                      value={form.bedrooms}
                      onChange={(event) =>
                        updateField("bedrooms", event.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Bathrooms">
                    <input
                      type="number"
                      min="0"
                      value={form.bathrooms}
                      onChange={(event) =>
                        updateField("bathrooms", event.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Parking spaces">
                    <input
                      type="number"
                      min="0"
                      value={form.parking_spaces}
                      onChange={(event) =>
                        updateField(
                          "parking_spaces",
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Built-up area (sq ft)">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.built_up_area_sqft}
                      onChange={(event) =>
                        updateField(
                          "built_up_area_sqft",
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Plot area (sq ft)">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.plot_area_sqft}
                      onChange={(event) =>
                        updateField(
                          "plot_area_sqft",
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Furnishing">
                    <select
                      value={form.furnishing_status}
                      onChange={(event) =>
                        updateField(
                          "furnishing_status",
                          event.target.value,
                        )
                      }
                      className={inputClass}
                    >
                      <option value="">Not specified</option>
                      <option value="unfurnished">Unfurnished</option>
                      <option value="semi_furnished">
                        Semi Furnished
                      </option>
                      <option value="furnished">Furnished</option>
                    </select>
                  </Field>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="View">
                  <input
                    value={form.view_type}
                    onChange={(event) =>
                      updateField("view_type", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Park view, corner, single row..."
                  />
                </Field>

                <Field label="Occupancy">
                  <select
                    value={form.occupancy_status}
                    onChange={(event) =>
                      updateField(
                        "occupancy_status",
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  >
                    <option value="">Not specified</option>
                    <option value="vacant">Vacant</option>
                    <option value="owner_occupied">
                      Owner Occupied
                    </option>
                    <option value="tenanted">Tenanted</option>
                  </select>
                </Field>

                <Field label="Listing status">
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateField("status", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                    <option value="off_market">Off Market</option>
                  </select>
                </Field>

                <Field label="Available from">
                  <input
                    type="date"
                    value={form.availability_date}
                    onChange={(event) =>
                      updateField(
                        "availability_date",
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="WhatsApp">
                  <input
                    value={form.contact_whatsapp}
                    onChange={(event) =>
                      updateField(
                        "contact_whatsapp",
                        event.target.value,
                      )
                    }
                    className={inputClass}
                    placeholder="+971..."
                  />
                </Field>
              </div>

              <Field label="Short description">
                <textarea
                  value={form.short_description}
                  onChange={(event) =>
                    updateField(
                      "short_description",
                      event.target.value,
                    )
                  }
                  rows={3}
                  className={inputClass}
                  placeholder="Short summary used on property cards."
                />
              </Field>

              <Field label="Full description">
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  rows={7}
                  className={inputClass}
                  placeholder="Full property description..."
                />
              </Field>

              <div className="flex flex-wrap gap-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <label className="flex cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) =>
                      updateField("featured", event.target.checked)
                    }
                    className="h-4 w-4"
                  />
                  Featured property
                </label>

                <label className="flex cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(event) =>
                      updateField("published", event.target.checked)
                    }
                    className="h-4 w-4"
                  />
                  Published
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-emerald-500 px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Property"
                    : "Create Property"}
              </button>
            </form>
          </section>

          <aside>
            <div className="sticky top-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">
                  Existing properties
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Draft and published listings.
                </p>
              </div>

              {properties.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 px-5 py-10 text-center text-sm text-slate-500">
                  No properties added yet.
                </div>
              ) : (
                <div className="max-h-[75vh] space-y-3 overflow-y-auto pr-1">
                  {properties.map((property) => {
                    const cluster = initialClusters.find(
                      (item) => item.id === property.cluster_id,
                    );

                    return (
                      <article
                        key={property.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${
                                  property.published
                                    ? "bg-emerald-500/15 text-emerald-300"
                                    : "bg-amber-500/15 text-amber-300"
                                }`}
                              >
                                {property.published
                                  ? "Published"
                                  : "Draft"}
                              </span>

                              {property.featured && (
                                <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-violet-300">
                                  Featured
                                </span>
                              )}
                            </div>

                            <h3 className="truncate font-medium text-white">
                              {property.title}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {cluster?.name ?? "No cluster"} ·{" "}
                              {property.transaction_type === "rent"
                                ? "Rent"
                                : "Sale"}
                            </p>

                            <p className="mt-3 font-semibold text-emerald-400">
                              {formatPrice(property.price)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(property)}
                            className="flex-1 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={deletingId === property.id}
                            onClick={() => handleDelete(property)}
                            className="rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                          >
                            {deletingId === property.id
                              ? "..."
                              : "Delete"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
        {required && (
          <span className="ml-1 text-emerald-400">*</span>
        )}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500";