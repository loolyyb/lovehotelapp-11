
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface MessagesPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export function MessagesPagination({ 
  currentPage, 
  totalPages, 
  setCurrentPage 
}: MessagesPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 pb-2">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className={`text-[#f3ebad] hover:text-[#f3ebad]/80 ${
                currentPage === 1 ? 'pointer-events-none opacity-50' : ''
              }`}
            />
          </PaginationItem>
          
          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i + 1}>
              <PaginationLink
                onClick={() => setCurrentPage(i + 1)}
                isActive={currentPage === i + 1}
                className={`text-[#f3ebad] hover:text-[#f3ebad]/80 ${
                  currentPage === i + 1 ? 'bg-[#f3ebad]/20' : ''
                }`}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              className={`text-[#f3ebad] hover:text-[#f3ebad]/80 ${
                currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
