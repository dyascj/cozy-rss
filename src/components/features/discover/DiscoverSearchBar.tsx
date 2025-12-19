"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDiscoverStore } from "@/stores/discoverStore";
import { DoodleSearch, DoodleClose, DoodleLoader } from "@/components/ui/DoodleIcon";
import { cn } from "@/utils/cn";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export function DiscoverSearchBar() {
  const {
    searchQuery,
    setSearchQuery,
    setSearchResults,
    isSearching,
    setIsSearching,
    clearSearch,
  } = useDiscoverStore();

  const [inputValue, setInputValue] = useState(searchQuery);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync input value when searchQuery changes externally (e.g., when cleared)
  useEffect(() => {
    if (searchQuery === "" && inputValue !== "") {
      setInputValue("");
    }
  }, [searchQuery]);

  const performSearch = useCallback(
    async (query: string) => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setSearchError(null);

      if (query.length < MIN_QUERY_LENGTH) {
        setSearchQuery("");
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsSearching(true);
      setSearchQuery(query);

      try {
        const response = await fetch(
          `/api/discover/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();
        setSearchResults(data.results);
        setSearchError(null);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Search error:", error);
        setSearchResults([]);
        setSearchError("Search failed. Please try again.");
      } finally {
        setIsSearching(false);
      }
    },
    [setSearchQuery, setSearchResults, setIsSearching]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce the search
      debounceTimerRef.current = setTimeout(() => {
        performSearch(value);
      }, DEBOUNCE_MS);
    },
    [performSearch]
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    setSearchError(null);
    clearSearch();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [clearSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {isSearching ? (
            <span className="text-muted-foreground animate-spin">
              <DoodleLoader size="sm" />
            </span>
          ) : (
            <span className="text-muted-foreground">
              <DoodleSearch size="sm" />
            </span>
          )}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search feeds by name or topic..."
          className={cn(
            "w-full pl-10 pr-10 py-2.5 rounded-xl",
            "bg-cream-100 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700",
            "text-sm text-charcoal-900 dark:text-cream-100 placeholder:text-taupe-400",
            "focus:outline-none focus:ring-2 focus:ring-sage-500/50 focus:border-sage-400 dark:focus:border-sage-600",
            "transition-all",
            searchError && "border-red-500/50"
          )}
          aria-invalid={!!searchError}
          aria-describedby={searchError ? "search-error" : undefined}
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:text-foreground"
            aria-label="Clear search"
          >
            <DoodleClose size="sm" />
          </button>
        )}
      </div>
      {searchError && (
        <p id="search-error" className="text-xs text-red-500" role="alert">
          {searchError}
        </p>
      )}
    </div>
  );
}
