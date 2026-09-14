/**
 * Gradient class names are stored as data in the database and injected at
 * runtime, so Tailwind's source scanner (which only picks up literal class
 * strings in source files) would otherwise tree-shake them away. Listing
 * every token here — never rendered — keeps them in the compiled CSS.
 */
export const TAILWIND_SAFELIST = `
  from-amber-900 from-blue-600 from-blue-800 from-blue-900 from-emerald-700 from-emerald-800
  from-emerald-900 from-green-700 from-green-800 from-green-900 from-orange-700 from-orange-900
  from-rose-800 from-slate-700 from-slate-800 from-slate-900 from-stone-700 from-zinc-100
  from-zinc-200 from-zinc-700
  via-amber-600 via-cyan-700 via-emerald-700 via-emerald-800 via-green-700 via-green-800
  via-green-900 via-lime-800 via-orange-700 via-orange-800 via-slate-200 via-slate-600
  via-slate-800 via-stone-600 via-stone-700
  to-amber-600 to-amber-900 to-blue-300 to-cyan-700 to-emerald-800 to-emerald-900 to-green-900
  to-lime-700 to-orange-800 to-red-800 to-red-900 to-slate-400 to-slate-800 to-slate-900
  to-stone-600 to-stone-700 to-stone-800 to-teal-700 to-teal-900 to-yellow-800 to-zinc-700
  to-zinc-800
`;
