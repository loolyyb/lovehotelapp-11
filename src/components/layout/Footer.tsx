import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentVersion } from "@/utils/versionControl";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [version, setVersion] = useState("1.0.20");

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const currentVersion = await getCurrentVersion();
        console.log("Current version fetched:", currentVersion); // Debug log
        setVersion(currentVersion);
      } catch (error) {
        console.error("Error fetching version:", error);
      }
    };
    fetchVersion();
  }, []);

  return (
    <footer className="w-full py-4 px-6 mt-auto border-t bg-white/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-burgundy fill-current" />
        </div>
        <div className="font-playfair">
          LooLyyb Dating v{version}
        </div>
        <div className="flex items-center gap-1">
          <span>&copy;</span>
          <span>{currentYear}</span>
        </div>
      </div>
    </footer>
  );
};