
import { useState, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Hook for managing pagination and search for the messages list
 */
export function useMessagesPagination() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    setCurrentPage,
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm: handleSearchChange,
    clearSearch
  };
}
