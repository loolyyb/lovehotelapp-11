import { useEffect, useState } from "react";
import { getCurrentVersion } from "@/utils/versionControl";

export function Footer() {
  const [version, setVersion] = useState("1.0.20");

  useEffect(() => {
    getCurrentVersion().then(setVersion);
  }, []);

  return (
    <footer className="py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by{" "}
          <a
            href="https://loveh.app"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Love Hotel
          </a>
          . v{version}
        </p>
      </div>
    </footer>
  );
}