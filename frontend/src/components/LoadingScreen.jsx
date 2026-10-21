import { APP_NAME } from "../lib/constants";
import Logo from "./Logo";

/** Full-screen splash shown while Clerk / the app boots (Loading UI.png). */
export default function LoadingScreen() {
  return (
    <div className="grid h-full w-full place-items-center bg-app text-ink">
      <div className="flex flex-col items-center gap-3">
        <Logo size={46} />
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted border-t-transparent" />
          Loading {APP_NAME}
        </div>
      </div>
    </div>
  );
}
