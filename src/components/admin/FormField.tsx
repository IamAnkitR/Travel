export default function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const inputClass =
  "w-full h-10 px-3 rounded-[10px] border border-stone-200 bg-white text-sm outline-none focus:border-stone-400";
export const textareaClass =
  "w-full p-3 rounded-[10px] border border-stone-200 bg-white text-sm leading-relaxed outline-none focus:border-stone-400";
