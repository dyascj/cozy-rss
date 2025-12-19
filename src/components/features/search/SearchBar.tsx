"use client";

import { useRef, useEffect, useState } from "react";
import { useSearchStore } from "@/stores/searchStore";
import { cn } from "@/utils/cn";
import { DoodleSearch, DoodleClose, DoodleGlobe, DoodleFolderOpen } from "@/components/ui/DoodleIcon";

interface SearchBarProps {
  className?: string;
  autoFocus?: boolean;
  resultCount?: number;
}

const DEBOUNCE_MS = 200;

export function SearchBar({ className, autoFocus, resultCount }: SearchBarProps) {
  const { query, setQuery, searchScope, setSearchScope, clearSearch, isSearchActive } =
    useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localQuery, setLocalQuery] = useState(query);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local query with store query when store changes externally
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Debounced search
  const handleInputChange = (value: string) => {
    setLocalQuery(value);

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounced update
    debounceRef.current = setTimeout(() => {
      setQuery(value);
    }, DEBOUNCE_MS);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    setLocalQuery("");
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    clearSearch();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setLocalQuery("");
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      clearSearch();
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <DoodleSearch size="sm" />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search articles..."
          className="w-full pl-9 pr-8 py-2 text-sm bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent placeholder:text-muted-foreground"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted transition-colors"
          >
            <span className="text-muted-foreground">
              <DoodleClose size="xs" />
            </span>
          </button>
        )}
      </div>

      {/* Scope toggle */}
      <div className="flex items-center gap-0.5 bg-muted/50 rounded-md p-0.5">
        <button
          onClick={() => setSearchScope("all")}
          className={cn(
            "p-1.5 rounded transition-colors flex items-center gap-1 text-xs",
            searchScope === "all"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Search all articles"
        >
          <DoodleGlobe size="xs" />
          <span className="hidden sm:inline">All</span>
        </button>
        <button
          onClick={() => setSearchScope("current")}
          className={cn(
            "p-1.5 rounded transition-colors flex items-center gap-1 text-xs",
            searchScope === "current"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Search current view"
        >
          <DoodleFolderOpen size="xs" />
          <span className="hidden sm:inline">Current</span>
        </button>
      </div>

      {/* Result count */}
      {isSearchActive && query && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {resultCount === 0 ? "No results" : `${resultCount} found`}
        </span>
      )}
    </div>
  );
}
