
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfileActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "outline";
  tooltipText: string;
  disabledTooltipText: string;
}

export function ProfileActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  variant = "default",
  tooltipText,
  disabledTooltipText,
}: ProfileActionButtonProps) {
  const buttonClassName = "bg-[#CE0067] hover:bg-[#CE0067]/80 text-white shadow-md";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            className={`${buttonClassName} font-medium px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105`}
            disabled={disabled}
          >
            <Icon className="mr-2 h-5 w-5" />
            {label}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{disabled ? disabledTooltipText : tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
