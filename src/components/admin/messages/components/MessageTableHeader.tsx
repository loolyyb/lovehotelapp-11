
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

export function MessageTableHeader() {
  return (
    <TableHeader>
      <TableRow className="border-b border-[#f3ebad]/10">
        <TableHead className="text-[#f3ebad]/70 font-montserrat">Date</TableHead>
        <TableHead className="text-[#f3ebad]/70 font-montserrat">De</TableHead>
        <TableHead className="text-[#f3ebad]/70 font-montserrat">À</TableHead>
        <TableHead className="text-[#f3ebad]/70 font-montserrat">Message</TableHead>
        <TableHead className="text-[#f3ebad]/70 font-montserrat">État</TableHead>
        <TableHead className="text-[#f3ebad]/70 font-montserrat">Alerte</TableHead>
        <TableHead className="text-[#f3ebad]/70 font-montserrat">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
