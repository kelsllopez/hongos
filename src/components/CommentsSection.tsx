"use client";

import { useEffect, useState, useCallback } from "react";
import { Comment } from "@/lib/types";

export function CommentsSection({ mushroomId = null }: { mushroomId?: string | null }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; message: string } | null>(null);

  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const load = useCallback(() => {
    const url = mushroomId ? `/api/comments?mushroomId=${mushroomId}` : "/api/comments";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []));
  }, [mushroomId]);

  const loadCaptcha = useCallback(() => {
    fetch("/api/captcha")
      .then((r) => r.json())
      .then((d) => {
        setCaptchaQuestion(d.question);
        setCaptchaToken(d.token);
        setCaptchaAnswer("");
      });
  }, []);

  useEffect(() => {
    load();
    loadCaptcha();
  }, [load, loadCaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setFeedback(null);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, text, mushroomId, captchaToken, captchaAnswer }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (data.ok) {
      setText("");
      setFeedback({ type: "ok", message: "¡Gracias! Tu comentario ya está publicado." });
      load();
      loadCaptcha();
    } else {
      setFeedback({
        type: "error",
        message: data.message || data.error || "Tu comentario no pudo publicarse.",
      });
      // Si falló por el captcha (o por cualquier motivo), pedimos uno nuevo
      // para que no se pueda reintentar adivinando la misma pregunta.
      loadCaptcha();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-display font-semibold text-xl">Comentarios</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Tu nombre (opcional)"
          className="rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "rgba(54,74,53,0.25)", background: "var(--bone)" }}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe tu comentario..."
          rows={3}
          required
          className="rounded-lg border px-3 py-2 text-sm resize-none"
          style={{ borderColor: "rgba(54,74,53,0.25)", background: "var(--bone)" }}
        />

        {captchaQuestion && (
          <div className="flex items-center gap-2">
            <label className="text-sm shrink-0" style={{ color: "var(--humus)" }}>
              {captchaQuestion}
            </label>
            <input
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              placeholder="Tu respuesta"
              required
              inputMode="numeric"
              className="rounded-lg border px-3 py-1.5 text-sm w-24"
              style={{ borderColor: "rgba(54,74,53,0.25)", background: "var(--bone)" }}
            />
            <span className="text-xs" style={{ color: "var(--humus)" }}>
              (para confirmar que eres una persona)
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="self-start px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "var(--terracotta)" }}
        >
          {submitting ? "Enviando..." : "Comentar"}
        </button>
        {feedback && (
          <p
            className="text-sm"
            style={{ color: feedback.type === "ok" ? "var(--moss-dark)" : "var(--amanita)" }}
          >
            {feedback.message}
          </p>
        )}
      </form>

      <div className="flex flex-col gap-3">
        {comments.map((c) => (
          <div
            key={c.id}
            className="p-3 rounded-xl"
            style={{ background: "var(--bone)", border: "1px solid rgba(54,74,53,0.1)" }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{c.author}</p>
              <p className="text-xs" style={{ color: "var(--humus)" }}>
                {new Date(c.createdAt).toLocaleDateString("es-CL", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
            <p className="text-sm" style={{ color: "var(--ink)" }}>{c.text}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm" style={{ color: "var(--humus)" }}>
            Sé la primera persona en comentar 🍄
          </p>
        )}
      </div>
    </div>
  );
}
