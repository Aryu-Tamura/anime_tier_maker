"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Anime, useAnimeStore } from "@/store/anime-store";
import { getProxiedUrl } from "@/lib/utils";

interface SortableAnimeCardProps {
  anime: Anime;
}

export function SortableAnimeCard({ anime }: SortableAnimeCardProps) {
  const { language } = useAnimeStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `tier-item-${anime.id}`,
    data: { anime, fromTier: true },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const displayTitle =
    language === "ja" ? anime.title_ja : anime.title_en;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="h-[104px] w-[70px] cursor-grab touch-none overflow-hidden rounded-md border-2 border-transparent bg-neutral-900 shadow-md"
    >
      <img
        src={getProxiedUrl(anime.imageUrl)}
        alt={displayTitle}
        title={displayTitle}
        width="70"
        height="104"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
