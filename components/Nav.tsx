import { content } from "@/lib/content";
import MusicToggle from "@/components/MusicToggle";

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner glass">
        <MusicToggle label={content.couple} />
      </div>
    </nav>
  );
}
