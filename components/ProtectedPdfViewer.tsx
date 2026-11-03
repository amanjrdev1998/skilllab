"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Lock,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type LoadState = "loading" | "ready" | "error";

function PdfPage({
  pdf,
  pageNumber,
  scale,
}: {
  pdf: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  scale: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) {
          page.cleanup();
          return;
        }
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: scale * dpr });
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
          canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;
          await page.render({ canvas, viewport }).promise;
        }
        page.cleanup();
      } catch {
        /* a single failed page should not break the whole document */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber, scale]);

  return (
    <div className="mx-auto w-fit select-none overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-slate-900/10">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}

export default function ProtectedPdfViewer({ courseId }: { courseId: string }) {
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.35);
  const [title, setTitle] = useState("Course PDF");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view this document.");
          setState("error");
          return;
        }

        // Course title for the header (public endpoint).
        fetch(`/api/v1/courses/${encodeURIComponent(courseId)}`, {
          cache: "no-store",
        })
          .then((r) => r.json())
          .then((body) => {
            const t = body?.data?.course?.title;
            if (!cancelled && typeof t === "string" && t) setTitle(t);
          })
          .catch(() => {});

        const response = await fetch(
          `/api/v1/courses/${encodeURIComponent(courseId)}/pdf`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message =
            body?.message ??
            (response.status === 403
              ? "You are not enrolled in this course."
              : response.status === 404
                ? "No PDF has been attached to this course yet."
                : "This document could not be loaded.");
          if (!cancelled) {
            setError(message);
            setState("error");
          }
          return;
        }

        const data = await response.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data });
        const document = await loadingTask.promise;
        if (cancelled) {
          await loadingTask.destroy();
          return;
        }
        setPdf(document);
        setNumPages(document.numPages);
        setState("ready");
      } catch {
        if (!cancelled) {
          setError("Could not load the document. Please try again.");
          setState("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courseId]);


  return (
    <div
      className="flex min-h-screen flex-col bg-slate-900"
      onContextMenu={(event) => event.preventDefault()}
    >
      {/* Header — intentionally no download / print buttons */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link
            href="/user/dashboard"
            className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400">
              <Lock className="h-3 w-3" /> Protected document
            </p>
            <h1 className="truncate text-base font-bold text-white">{title}</h1>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-white/10 p-1">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.6, +(s - 0.15).toFixed(2)))}
              disabled={state !== "ready"}
              className="rounded-md p-1.5 text-slate-200 transition hover:bg-white/10 disabled:opacity-40"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-xs font-bold text-slate-200">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(3, +(s + 0.15).toFixed(2)))}
              disabled={state !== "ready"}
              className="rounded-md p-1.5 text-slate-200 transition hover:bg-white/10 disabled:opacity-40"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {state === "loading" && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
            <p className="mt-4 font-semibold text-slate-200">
              Loading your document…
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Fetching securely — this may take a moment.
            </p>
          </div>
        )}

        {state === "error" && (
          <div className="mx-auto mt-16 max-w-md rounded-2xl border border-white/10 bg-slate-950 p-8 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-amber-400" />
            <h2 className="mt-4 text-lg font-bold text-white">
              Document unavailable
            </h2>
            <p className="mt-2 text-sm text-slate-400">{error}</p>
            <Link
              href="/user/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
            >
              <ArrowLeft className="h-4 w-4" /> Back to my courses
            </Link>
          </div>
        )}

        {state === "ready" && pdf && (
          <div className="flex flex-col gap-5">
            <p className="text-center text-xs text-slate-500">
              {numPages} {numPages === 1 ? "page" : "pages"} · downloading and
              printing are disabled for this document
            </p>
            {Array.from({ length: numPages }, (_, i) => (
              <PdfPage
                key={`${i}-${scale}`}
                pdf={pdf}
                pageNumber={i + 1}
                scale={scale}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
