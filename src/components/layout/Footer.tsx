
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentVersion } from "@/utils/versionControl";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [version, setVersion] = useState("1.0.0");

  useEffect(() => {
    const fetchVersion = async () => {
      const currentVersion = await getCurrentVersion();
      setVersion(currentVersion);
    };
    fetchVersion();
  }, []);

  return <footer className="w-full py-4 px-6 mt-auto bg-[#40192C] border-[0.5px] border-[#f3ebad]/30 backdrop-blur-sm hover:shadow-lg transition-all duration-300 text-[#f3ebad]">
      <div className="max-w-6xl mx-auto flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 fill-[#CE0067]" />
        </div>
        <div className="font-playfair">
          Love Hôtel v{version}
        </div>
        <div className="flex items-center gap-1">
          <span>&copy;</span>
          <span>{currentYear}</span>
        </div>
      </div>
    </footer>;
};
