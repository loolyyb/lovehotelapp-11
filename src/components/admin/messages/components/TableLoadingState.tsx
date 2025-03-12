
import { motion } from "framer-motion";
import { TableRow, TableCell } from "@/components/ui/table";

export function TableLoadingState() {
  return (
    <TableRow>
      <TableCell
        colSpan={7}
        className="text-center font-montserrat text-[#f3ebad]/50"
      >
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Chargement...
        </motion.div>
      </TableCell>
    </TableRow>
  );
}
