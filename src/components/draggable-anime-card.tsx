"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Anime, useAnimeStore } from "@/store/anime-store";
import { getProxiedUrl } from "@/lib/utils";

interface DraggableAnimeCardProps {
  anime: Anime;
}

export function DraggableAnimeCard({ anime }: DraggableAnimeCardProps) {
  const { language } = useAnimeStore();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `search-item-${anime.id}`,
    data: { anime },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  const displayTitle =
    language === "ja" ? anime.title_ja : anime.title_en;

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex cursor-grab items-center gap-3 rounded-md border bg-white p-2 transition-shadow hover:shadow-md"
    >
      <img
        src={getProxiedUrl(anime.imageUrl)}
        alt={displayTitle}
        width="80"
        height="120"
        className="h-[120px] w-[80px] rounded-sm object-cover"
      />
      <span className="text-sm font-medium">{displayTitle}</span>
    </li>
  );
}
