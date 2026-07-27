"use client";

import { useContent } from "@/lib/tenant";
import MusicToggle from "@/components/MusicToggle";

export default function Nav() {
  const content = useContent();
  return (
    <nav className="nav">
      <div className="nav-inner glass">
        <MusicToggle label={content.couple} />
      </div>
    </nav>
  );
}
