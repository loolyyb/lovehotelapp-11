import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
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
  const buttonClassName = variant === "default" 
    ? "bg-burgundy hover:bg-burgundy/90" 
    : "border-burgundy text-burgundy hover:bg-burgundy/10";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          className={buttonClassName}
          variant={variant}
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
  );
}