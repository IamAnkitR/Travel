"use client";

import { X } from "lucide-react";

export default function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full ${wide ? "max-w-[640px]" : "max-w-[480px]"} bg-white rounded-[20px] shadow-2xl my-8`}>
        <div className="flex items-center justify-between px-6 h-14 border-b border-stone-200">
          <h2 className="font-semibold text-[15px]">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
