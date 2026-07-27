import { config } from "@/lib/config";
import MusicToggle from "@/components/MusicToggle";

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner glass">
        <MusicToggle label={config.names.couple} />
      </div>
    </nav>
  );
}
