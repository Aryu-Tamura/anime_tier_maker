"use client";

import { useAnimeStore } from "@/store/anime-store";
import { DroppableTierRow } from "./droppable-tier-row";
import { forwardRef } from "react";

const TierListCanvas = forwardRef<HTMLDivElement>((props, ref) => {
  const { tiers } = useAnimeStore();

  return (
    <div ref={ref} className="w-full space-y-1 rounded-lg bg-neutral-900 p-1">
      {tiers.map((tier) => (
        <DroppableTierRow key={tier.id} tier={tier} />
      ))}
    </div>
  );
});

TierListCanvas.displayName = "TierListCanvas";

export default TierListCanvas;
