
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DateSeparatorProps {
  date: Date;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="text-[10px] italic text-[#f3ebad]/60 px-3">
        {format(date, "d MMMM yyyy", { locale: fr })}
      </div>
    </div>
  );
}
