export default function Loading() {
  return (
    <div className="mx-auto min-h-[60vh] w-full max-w-6xl px-4 py-16 sm:px-6" role="status" aria-label="Cargando">
      <div className="animate-pulse">
        <div className="h-9 w-64 max-w-full rounded-lg bg-white/10" />
        <div className="mt-4 h-4 w-96 max-w-full rounded bg-white/5" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-36 rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-36 rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-36 rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-36 rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-36 rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-36 rounded-2xl border border-white/10 bg-white/5" />
        </div>
      </div>
    </div>
  );
}
