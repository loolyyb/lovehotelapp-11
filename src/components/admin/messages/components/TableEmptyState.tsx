
import { MessageSquare } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";

export function TableEmptyState() {
  return (
    <TableRow>
      <TableCell
        colSpan={7}
        className="text-center font-montserrat text-[#f3ebad]/50 py-12"
      >
        <div className="flex flex-col items-center justify-center">
          <MessageSquare className="h-12 w-12 mb-4 text-[#f3ebad]/30" />
          <p className="text-lg mb-2">Aucun message trouvé</p>
          <p className="text-sm text-[#f3ebad]/40">
            Aucun message ne correspond à vos critères actuels
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}
