"use client";

import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { useDebounce } from "use-debounce";
import { useAnimeStore } from "@/store/anime-store";
import { Input } from "@/components/ui/input";
import { DraggableAnimeCard } from "./draggable-anime-card";
import { useDroppable } from "@dnd-kit/core";

const AnimeSearchSidebar = () => {
  const [text, setText] = useState("");
  const [debouncedText] = useDebounce(text, 750);
  const isComposing = useRef(false);

  const { searchedAnime, isLoading, error, fetchAnime } = useAnimeStore();
  const { setNodeRef } = useDroppable({
    id: "search-dropzone",
  });

  useEffect(() => {
    if (debouncedText && !isComposing.current) {
      fetchAnime(debouncedText);
    }
  }, [debouncedText, fetchAnime]);

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = () => {
    isComposing.current = false;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposing.current) {
      fetchAnime(text);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className="flex h-full min-h-[500px] w-full flex-col gap-4 rounded-lg border bg-neutral-50 p-4"
    >
      <h2 className="text-lg font-semibold">Search Anime</h2>
      <Input
        type="text"
        placeholder="e.g. Naruto, One Piece..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
      />

      <div className="flex-1 overflow-y-auto">
        {isLoading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!isLoading && !error && (
          <ul className="space-y-2">
            {searchedAnime.map((anime) => (
              <DraggableAnimeCard key={anime.id} anime={anime} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AnimeSearchSidebar;
