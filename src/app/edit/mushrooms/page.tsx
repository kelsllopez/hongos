"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Mushroom, InfoTableRow, AccordionSection } from "@/lib/types";
import { LoginGate } from "@/components/LoginGate";
import { GalleryEditor } from "@/components/GalleryEditor";
import { InfoTableEditor } from "@/components/InfoTableEditor";
import { SectionsEditor } from "@/components/SectionsEditor";

const EDIBLE_OPTIONS: { value: Mushroom["edible"]; label: string }[] = [
  { value: "comestible", label: "Comestible" },
  { value: "no-comestible", label: "No comestible" },
  { value: "toxico", label: "Tóxico" },
  { value: "desconocido", label: "Sin clasificar" },
];

type FormState = {
  name: string;
  scientificName: string;
  description: string;
  imageUrl: string;
  images: string[];
  edible: Mushroom["edible"];
  habitat: string;
  season: string;
  infoTable: InfoTableRow[];
  sections: AccordionSection[];
};

const EMPTY_FORM: FormState = {
  name: "",
  scientificName: "",
  description: "",
  imageUrl: "",
  images: [],
  edible: "desconocido",
  habitat: "",
  season: "",
  infoTable: [],
  sections: [],
};

export default function MushroomsAdminPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [usersExist, setUsersExist] = useState(true);

  const [mushrooms, setMushrooms] = useState<Mushroom[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) => {
        setAuthed(d.authenticated);
        setUsersExist(d.usersExist);
        setCheckingAuth(false);
      });
  }, []);

  const loadMushrooms = useCallback(() => {
    fetch("/api/mushrooms")
      .then((r) => r.json())
      .then((d) => setMushrooms(d.mushrooms || []));
  }, []);

  useEffect(() => {
    if (!authed) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial tras autenticarse
    loadMushrooms();
  }, [authed, loadMushrooms]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (m: Mushroom) => {
    setForm({
      name: m.name,
      scientificName: m.scientificName || "",
      description: m.description,
      imageUrl: m.imageUrl || "",
      images: m.images && m.images.length > 0 ? m.images : m.imageUrl ? [m.imageUrl] : [],
      edible: m.edible || "desconocido",
      habitat: m.habitat || "",
      season: m.season || "",
      infoTable: m.infoTable || [],
      sections: m.sections || [],
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleUpload = async (file: File): Promise<string> => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (res.ok) {
      return data.url;
    }
    alert(data.error || "Error al subir imagen");
    return "";
  };

  const handleGalleryChange = (images: string[]) => {
    setForm((f) => {
      // si la portada actual ya no está en la galería, elige la primera disponible
      const cover = images.includes(f.imageUrl) ? f.imageUrl : images[0] || "";
      return { ...f, images, imageUrl: cover };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      await fetch(`/api/mushrooms/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/mushrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    resetForm();
    loadMushrooms();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este hongo? También se quitará de cualquier tarjeta en tu sitio.")) return;
    await fetch(`/api/mushrooms/${id}`, { method: "DELETE" });
    loadMushrooms();
  };

  if (checkingAuth) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!authed) return <LoginGate usersExist={usersExist} onSuccess={() => window.location.reload()} />;

  return (
    <div className="min-h-screen paper-texture" style={{ background: "var(--spore-cream)" }}>
      <header
        className="flex items-center justify-between px-5 py-3 border-b sticky top-0 z-10"
        style={{ borderColor: "rgba(54,74,53,0.15)", background: "var(--bone)" }}
      >
        <span className="font-display font-bold text-lg">🍄 Mis hongos</span>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/edit" className="px-3 py-1.5 rounded-lg hover:bg-black/5 font-medium" style={{ color: "var(--moss-dark)" }}>
            ← Volver al editor
          </Link>
          <Link href="/" className="px-3 py-1.5 rounded-lg hover:bg-black/5 font-medium" style={{ color: "var(--moss-dark)" }}>
            Ver sitio
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <p style={{ color: "var(--humus)" }}>
            Agrega cada hongo que quieras compartir. Cada uno se vuelve su propia página, con
            galería de fotos, tabla de datos y secciones desplegables si quieres.
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="shrink-0 ml-4 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--terracotta)" }}
          >
            + Nuevo hongo
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 p-5 rounded-2xl flex flex-col gap-5"
            style={{ background: "var(--bone)", border: "1px solid rgba(54,74,53,0.15)" }}
          >
            <h2 className="font-display font-semibold text-lg">
              {editingId ? "Editar hongo" : "Nuevo hongo"}
            </h2>

            {/* --- Datos básicos --- */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nombre común">
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    className="input"
                    placeholder="Ej: Níscalo"
                  />
                </Field>
                <Field label="Nombre científico (opcional)">
                  <input
                    value={form.scientificName}
                    onChange={(e) => setForm((f) => ({ ...f, scientificName: e.target.value }))}
                    className="input"
                    placeholder="Ej: Lactarius deliciosus"
                  />
                </Field>
              </div>

              <Field label="Descripción">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="input resize-none"
                  placeholder="Cuenta cómo es, dónde lo encontraste, qué te gusta de él..."
                />
              </Field>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Clasificación">
                  <select
                    value={form.edible}
                    onChange={(e) => setForm((f) => ({ ...f, edible: e.target.value as Mushroom["edible"] }))}
                    className="input"
                  >
                    {EDIBLE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Hábitat (opcional)">
                  <input
                    value={form.habitat}
                    onChange={(e) => setForm((f) => ({ ...f, habitat: e.target.value }))}
                    className="input"
                    placeholder="Ej: bosque de pino"
                  />
                </Field>
                <Field label="Temporada (opcional)">
                  <input
                    value={form.season}
                    onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))}
                    className="input"
                    placeholder="Ej: otoño"
                  />
                </Field>
              </div>
            </div>

            {/* --- Galería de fotos --- */}
            <CollapsibleField label="📷 Fotos" defaultOpen>
              <GalleryEditor
                images={form.images}
                coverUrl={form.imageUrl}
                onChange={handleGalleryChange}
                onSetCover={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                onUpload={handleUpload}
                uploading={uploading}
              />
            </CollapsibleField>

            {/* --- Tabla de datos libre --- */}
            <CollapsibleField label="📊 Tabla de información (opcional)">
              <p className="text-xs mb-2" style={{ color: "var(--humus)" }}>
                Agrega cualquier dato que quieras, en el orden que quieras: tamaño, color, olor,
                textura... lo que se te ocurra.
              </p>
              <InfoTableEditor
                rows={form.infoTable}
                onChange={(infoTable) => setForm((f) => ({ ...f, infoTable }))}
              />
            </CollapsibleField>

            {/* --- Secciones desplegables --- */}
            <CollapsibleField label="📝 Secciones desplegables (opcional)">
              <p className="text-xs mb-2" style={{ color: "var(--humus)" }}>
                Agrega bloques extra de texto que el visitante puede abrir y cerrar, por ejemplo
                &ldquo;Cómo cocinarlo&rdquo; o &ldquo;Curiosidades&rdquo;.
              </p>
              <SectionsEditor
                sections={form.sections}
                onChange={(sections) => setForm((f) => ({ ...f, sections }))}
              />
            </CollapsibleField>

            <div className="flex gap-2 mt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: "var(--moss-dark)" }}
              >
                {editingId ? "Guardar cambios" : "Agregar hongo"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-black/5"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {mushrooms.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{ background: "var(--bone)", border: "1px solid rgba(54,74,53,0.12)" }}
            >
              <div className="h-36 w-full" style={{ background: "rgba(54,74,53,0.08)" }}>
                {m.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-3 flex flex-col gap-1 flex-1">
                <h3 className="font-display font-semibold">{m.name}</h3>
                {m.scientificName && (
                  <p className="text-xs italic" style={{ color: "var(--moss)" }}>{m.scientificName}</p>
                )}
                <p className="text-xs flex-1" style={{ color: "var(--humus)" }}>{m.description}</p>
                <div className="flex gap-2 mt-2">
                  <Link
                    href={`/hongo/${m.id}`}
                    target="_blank"
                    className="flex-1 text-xs font-semibold py-1.5 rounded-lg text-center hover:bg-black/5"
                    style={{ border: "1px solid rgba(54,74,53,0.2)", color: "var(--moss-dark)" }}
                  >
                    Ver post
                  </Link>
                  <button
                    onClick={() => startEdit(m)}
                    className="flex-1 text-xs font-semibold py-1.5 rounded-lg hover:bg-black/5"
                    style={{ border: "1px solid rgba(54,74,53,0.2)" }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="flex-1 text-xs font-semibold py-1.5 rounded-lg text-white"
                    style={{ background: "var(--amanita)" }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {mushrooms.length === 0 && !showForm && (
          <p className="text-center py-10" style={{ color: "var(--humus)" }}>
            Todavía no hay hongos. Crea el primero con el botón de arriba 🍄
          </p>
        )}
      </main>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(54, 74, 53, 0.25);
          background: var(--spore-cream);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--moss)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function CollapsibleField({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-xl"
      style={{ background: "var(--spore-cream)", border: "1px solid rgba(54,74,53,0.12)" }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold"
        style={{ color: "var(--ink)" }}
      >
        <span>{label}</span>
        <span style={{ color: "var(--moss)" }}>{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}
