"use client";

import { useCallback } from "react";
import { useToast } from "@/components/ToastProvider";

export function useLeadAction() {
  const { showToast } = useToast();

  return useCallback(
    async (businessSlug: string, channel: "WhatsApp" | "Call") => {
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessSlug, channel }),
        });
      } finally {
        showToast("Lead generated! Business will contact you.");
      }
    },
    [showToast]
  );
}
