
import { LucideIcon } from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  memberOnly?: boolean;
  tooltipText: string;
}

export interface FeatureCategory {
  title: string;
  features: Feature[];
}
