
import { AlertTriangle } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";

export function TableErrorState() {
  return (
    <TableRow>
      <TableCell
        colSpan={7}
        className="text-center font-montserrat text-[#f3ebad]/50 py-12"
      >
        <div className="flex flex-col items-center justify-center">
          <AlertTriangle className="h-12 w-12 mb-4 text-amber-500" />
          <p className="text-lg mb-2 text-[#f3ebad]">Erreur de chargement</p>
          <p className="text-sm text-[#f3ebad]/40">
            Impossible de récupérer les messages
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}
