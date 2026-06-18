"use client";

import { useCallback, useRef, useState } from "react";
import AnimeSearchSidebar from "@/components/anime-search-sidebar";
import TierListCanvas from "@/components/tier-list-canvas";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Anime, Tier, useAnimeStore } from "@/store/anime-store";
import Image from "next/image";
import { getProxiedUrl } from "@/lib/utils";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download, Save, FolderOpen } from "lucide-react";
import AuthButton from "@/components/auth-button";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type SavedList = {
  id: string;
  title: string;
  data: Tier[];
  created_at: string;
};

export default function Home() {
  const [activeAnime, setActiveAnime] = useState<Anime | null>(null);
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [isLoadDialogOpen, setLoadDialogOpen] = useState(false);
  const tierListRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const supabase = createClient();

  const {
    tiers,
    addAnimeToTier,
    moveAnimeBetweenTiers,
    sortAnimeInTier,
    setTiers,
    language,
    setLanguage,
    returnAnimeToSearch, // Imported new action
  } = useAnimeStore();

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const handleDownload = useCallback(() => {
    if (!tierListRef.current) return;
    toPng(tierListRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `tier-list-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error("Failed to generate image", err));
  }, [tierListRef]);

  const handleSave = async () => {
    if (!user) {
      alert("You must be logged in to save a tier list.");
      return;
    }
    const title = prompt("Enter a title for your tier list:");
    if (!title) return;

    const { error } = await supabase
      .from("tier_lists")
      .insert([{ user_id: user.id, title, data: tiers }]);

    if (error) {
      alert(`Error saving: ${error.message}`);
    } else {
      alert("Tier list saved successfully!");
    }
  };

  const handleLoad = async () => {
    if (!user) {
      alert("You must be logged in to load a tier list.");
      return;
    }
    const { data, error } = await supabase
      .from("tier_lists")
      .select("id, title, data, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      alert(`Error loading lists: ${error.message}`);
    } else {
      setSavedLists(data as SavedList[]);
      setLoadDialogOpen(true);
    }
  };

  const handleSelectLoad = (data: Tier[]) => {
    setTiers(data);
    setLoadDialogOpen(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.anime) {
      setActiveAnime(event.active.data.current.anime);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveAnime(null);

    if (!over) return;

    if (
      active.id.toString().startsWith("search-item-") &&
      !over.id.toString().startsWith("search-item-")
    ) {
      const anime = active.data.current?.anime;
      const destTierId = over.data.current?.sortable?.containerId ?? over.id;

      // Prevent adding to search-dropzone (which is not a valid tier)
      if (destTierId === "search-dropzone") {
        return;
      }

      if (anime) {
        addAnimeToTier(anime, destTierId.toString());
      }
      return;
    }

    // Handle moving anime from a tier
    if (active.id.toString().startsWith("tier-item-")) {
      const sourceTierId = active.data.current?.sortable.containerId;
      const destTierId = over.data.current?.sortable?.containerId ?? over.id;
      const animeId = active.data.current?.anime.id;
      const animeToMove = active.data.current?.anime; // Get the full anime object
      const oldIndex = active.data.current?.sortable.index;

      // If dropped onto the search dropzone
      if (destTierId === "search-dropzone" && animeToMove && sourceTierId) {
        returnAnimeToSearch(animeToMove, sourceTierId);
        return;
      }

      // Existing logic for moving within tiers or to another tier
      if (sourceTierId === destTierId) {
        if (over.id === active.id) return;
        const newIndex = over.data.current?.sortable.index;
        if (oldIndex !== undefined && newIndex !== undefined) {
          sortAnimeInTier(sourceTierId, oldIndex, newIndex);
        }
      } else {
        const newIndex = over.data.current?.sortable?.index ?? 0;
        if (animeId !== undefined && sourceTierId) {
          moveAnimeBetweenTiers(animeId, sourceTierId, destTierId, newIndex);
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <main className="flex h-screen flex-col overflow-hidden bg-background">
        <header className="flex flex-none items-center justify-between border-b p-4 shadow-sm">
          <h1 className="text-2xl font-bold">Anime Tier Maker</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setLanguage(language === "ja" ? "en" : "ja")}
            >
              Language: {language === "ja" ? "JA" : "EN"}
            </Button>
            {user && (
              <>
                <Button variant="outline" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button variant="outline" onClick={handleLoad}>
                  <FolderOpen className="mr-2 h-4 w-4" /> Load
                </Button>
              </>
            )}
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download PNG
            </Button>
            <AuthButton />
          </div>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden p-4 md:flex-row md:gap-4">
          {/* Tier List Section - Scrollable */}
          <div className="flex-1 overflow-y-auto rounded-lg border bg-neutral-100/50 p-2 shadow-inner">
            <TierListCanvas ref={tierListRef} />
          </div>

          {/* Search Sidebar Section - Scrollable */}
          <div className="h-full w-full overflow-hidden md:w-[350px]">
            <AnimeSearchSidebar />
          </div>
        </div>
      </main>

      <DragOverlay>
        {activeAnime ? (
          <div className="flex cursor-grabbing items-center gap-3 rounded-md border bg-white p-2 shadow-lg">
            <img
              src={getProxiedUrl(activeAnime.imageUrl)}
              alt={language === "ja" ? activeAnime.title_ja : activeAnime.title_en}
              width="80"
              height="120"
              className="h-[120px] w-[80px] rounded-sm object-cover"
            />
            <span className="text-sm font-medium">
              {language === "ja" ? activeAnime.title_ja : activeAnime.title_en}
            </span>
          </div>
        ) : null}
      </DragOverlay>

      <Dialog open={isLoadDialogOpen} onOpenChange={setLoadDialogOpen}>
         {/* ... (Dialog content remains same) */}
          <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Tier List</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {savedLists.length > 0 ? (
              savedLists.map((list) => (
                <div key={list.id} className="flex justify-between items-center p-2 border rounded-md">
                  <div>
                    <p className="font-semibold">{list.title}</p>
                    <p className="text-sm text-gray-500">
                      Saved on: {new Date(list.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button onClick={() => handleSelectLoad(list.data)}>Load</Button>
                </div>
              ))
            ) : (
              <p>No saved lists found.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}

