import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { MenuLogo } from "./menu/MenuLogo";
import { MenuNavigation } from "./menu/MenuNavigation";

export function SideMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-rose/10">
          <Menu className="h-5 w-5 text-burgundy" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-white/95 backdrop-blur-sm">
        <MenuLogo />
        <MenuNavigation onLinkClick={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}