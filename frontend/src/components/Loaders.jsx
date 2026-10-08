export function ListingCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] animate-pulse bg-campus-ink/5" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-campus-ink/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-campus-ink/10" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-campus-ink/10" />
      </div>
    </div>
  );
}

export function EmptyState({ icon = '🗂️', title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-campus-ink/15 bg-white/50 py-16 text-center">
      <div className="mb-3 text-4xl">{icon}</div>
      <h3 className="h-display text-lg text-campus-ink">{title}</h3>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-campus-ink/50">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
// export function EmptyState({ icon = '🗂️', title, subtitle, action }) {
//   const Icon = icon;

//   return (
//     <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-campus-ink/15 bg-white/50 py-16 text-center">
//       <div className="mb-3 text-4xl">
//         {typeof icon === 'string' ? icon : <Icon />}
//       </div>

//       <h3 className="h-display text-lg text-campus-ink">{title}</h3>
//       {subtitle && <p className="mt-1 max-w-sm text-sm text-campus-ink/50">{subtitle}</p>}
//       {action && <div className="mt-4">{action}</div>}
//     </div>
//   );
// }