import { create } from "zustand";
import axios from "axios";
import { arrayMove } from "@dnd-kit/sortable";

// --- TYPE DEFINITIONS ---

interface JikanAnimeResource {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  images: {
    jpg: {
      image_url: string;
    };
  };
  year: number | null;
  genres: { mal_id: number; name: string }[];
  studios: { mal_id: number; name: string }[];
}

export interface Anime {
  id: number;
  title: string; // Default title
  title_en: string;
  title_ja: string;
  imageUrl: string;
  year: number | null;
  genres: string[];
  studios: string[];
}

export interface Tier {
  id: string;
  title: string;
  color: string;
  items: Anime[];
}

interface AnimeState {
  searchedAnime: Anime[];
  tiers: Tier[];
  isLoading: boolean;
  error: string | null;
  language: "ja" | "en";
  fetchAnime: (query: string) => Promise<void>;
  addAnimeToTier: (anime: Anime, tierId: string) => void;
  moveAnimeBetweenTiers: (
    animeId: number,
    sourceTierId: string,
    destTierId: string,
    destIndex: number
  ) => void;
  sortAnimeInTier: (tierId: string, oldIndex: number, newIndex: number) => void;
  setTiers: (tiers: Tier[]) => void; // Action to load tiers
  setLanguage: (lang: "ja" | "en") => void;
  returnAnimeToSearch: (anime: Anime, sourceTierId: string) => void;
  // TODO: Add actions for tier customization (add, remove, rename, etc.)
}

// --- INITIAL STATE ---

const JIKAN_API_URL = "https://api.jikan.moe/v4/anime";
const initialTiers: Tier[] = [
  { id: "S", title: "S", color: "#FF7F7F", items: [] },
  { id: "A", title: "A", color: "#FFBF7F", items: [] },
  { id: "B", title: "B", color: "#FFFF7F", items: [] },
  { id: "C", title: "C", color: "#7FFF7F", items: [] },
  { id: "D", title: "D", color: "#7FFFFF", items: [] },
  { id: "UNRANKED", title: "Unwatched", color: "#BFBFBF", items: [] },
];

// --- ZUSTAND STORE ---

export const useAnimeStore = create<AnimeState>((set, get) => ({
  searchedAnime: [],
  tiers: initialTiers,
  isLoading: false,
  error: null,
  language: "en",

  fetchAnime: async (query: string) => {
    set({ isLoading: true, error: null });
    // Prevent fetching if anime is already in a tier
    const allItemsInTiers = get().tiers.flatMap((t) => t.items);

    try {
      const response = await axios.get<{ data: JikanAnimeResource[] }>(
        JIKAN_API_URL,
        { params: { q: query, limit: 20 } }
      );

      const formattedData: Anime[] = response.data.data
        .map((item) => ({
          id: item.mal_id,
          title: item.title,
          title_en: item.title_english ?? item.title,
          title_ja: item.title_japanese ?? item.title,
          imageUrl: item.images.jpg.image_url,
          year: item.year,
          genres: item.genres.map((g) => g.name),
          studios: item.studios.map((s) => s.name),
        }))
        .filter(
          (anime, index, self) =>
            self.findIndex((a) => a.id === anime.id) === index
        ) // Deduplicate based on id
        .filter(
          (anime) => !allItemsInTiers.some((item) => item.id === anime.id)
        ); // Filter out existing anime

      set({ searchedAnime: formattedData, isLoading: false });
    } catch (err) {
      let errorMessage = "Failed to fetch anime data.";
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        errorMessage = "Rate limit reached. Please wait a moment.";
      }
      set({ error: errorMessage, isLoading: false });
    }
  },

  addAnimeToTier: (anime, tierId) => {
    set((state) => ({
      // Add the new anime to the destination tier
      tiers: state.tiers.map((tier) =>
        tier.id === tierId ? { ...tier, items: [...tier.items, anime] } : tier
      ),
      // Remove the added anime from the search results
      searchedAnime: state.searchedAnime.filter((a) => a.id !== anime.id),
    }));
  },

  moveAnimeBetweenTiers: (animeId, sourceTierId, destTierId, destIndex) => {
    set((state) => {
      const sourceTier = state.tiers.find((t) => t.id === sourceTierId);
      const animeToMove = sourceTier?.items.find((item) => item.id === animeId);

      if (!animeToMove) return state;

      const newTiers = state.tiers.map((tier) => {
        // Remove from source tier
        if (tier.id === sourceTierId) {
          return {
            ...tier,
            items: tier.items.filter((item) => item.id !== animeId),
          };
        }
        // Add to destination tier at the correct index
        if (tier.id === destTierId) {
          const newItems = [...tier.items];
          newItems.splice(destIndex, 0, animeToMove);
          return { ...tier, items: newItems };
        }
        return tier;
      });

      return { tiers: newTiers };
    });
  },

  sortAnimeInTier: (tierId, oldIndex, newIndex) => {
    set((state) => ({
      tiers: state.tiers.map((tier) =>
        tier.id === tierId
          ? { ...tier, items: arrayMove(tier.items, oldIndex, newIndex) }
          : tier
      ),
    }));
  },

  setTiers: (tiers: Tier[]) => {
    set({ tiers });
  },

  setLanguage: (lang: "ja" | "en") => {
    set({ language: lang });
  },

  returnAnimeToSearch: (anime: Anime, sourceTierId: string) => {
    set((state) => ({
      tiers: state.tiers.map((tier) =>
        tier.id === sourceTierId
          ? { ...tier, items: tier.items.filter((item) => item.id !== anime.id) }
          : tier
      ),
      searchedAnime: [...state.searchedAnime, anime].sort((a, b) => a.title.localeCompare(b.title)), // Add back to search and sort alphabetically
    }));
  },
}));
