"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Tier } from "@/store/anime-store";
import { SortableAnimeCard } from "./sortable-anime-card"; // This file will be created next

interface DroppableTierRowProps {
  tier: Tier;
}

export function DroppableTierRow({ tier }: DroppableTierRowProps) {
  const { setNodeRef } = useDroppable({
    id: tier.id,
  });

  return (
    <div className="flex items-stretch">
      {/* Tier Label */}
      <div
        className={`flex w-24 flex-shrink-0 flex-col items-center justify-center p-1 text-center text-black shadow-sm ${
          tier.title.length > 2
            ? "text-sm font-bold leading-tight break-words"
            : "text-3xl font-black"
        }`}
        style={{ backgroundColor: tier.color }}
      >
        {tier.title}
      </div>

      {/* Droppable and Sortable Area */}
      <SortableContext
        id={tier.id}
        items={tier.items.map((item) => `tier-item-${item.id}`)}
        strategy={verticalListSortingStrategy} // Can be changed to horizontal if needed
      >
        <div
          ref={setNodeRef}
          className="min-h-[120px] w-full flex-1 bg-neutral-800 p-2"
        >
          <div className="flex flex-wrap gap-2">
            {tier.items.map((anime) => (
              <SortableAnimeCard key={anime.id} anime={anime} />
            ))}
            {tier.items.length === 0 && (
              <div className="flex h-full min-h-[104px] w-full items-center justify-center">
                <p className="text-neutral-500">Drop anime here</p>
              </div>
            )}
          </div>
        </div>
      </SortableContext>
    </div>
  );
}
