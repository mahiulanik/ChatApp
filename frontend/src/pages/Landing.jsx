import { useClerk } from "@clerk/react";
import AppActions from "../components/AppActions";
import Logo from "../components/Logo";
import { ArrowRightIcon, ShieldIcon } from "../components/icons";
import { APP_NAME } from "../lib/constants";

/** Public sign-in gateway (Landing Page.png). */
export default function Landing() {
  const { openSignIn } = useClerk();

  return (
    <div className="flex h-full flex-col bg-app text-ink">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-panel px-3 sm:px-4">
        <div className="flex items-center gap-2.5">
          <Logo size={30} />
          <div className="leading-tight">
            <div className="text-[15px] font-bold tracking-tight">{APP_NAME}</div>
            <div className="text-[11px] text-muted">Private session</div>
          </div>
        </div>
        <AppActions />
      </header>

      <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-2">
        {/* Left: pitch + rocket */}
        <section className="relative flex flex-col border-b border-line px-6 py-8 sm:px-10 lg:border-b-0 lg:border-r">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.35em] text-muted">
            Secure gateway
          </p>
          <h1 className="mt-3 font-mono text-3xl font-bold uppercase tracking-wide sm:text-4xl">
            Open {APP_NAME}
          </h1>
          <p className="mt-3 max-w-xl font-mono text-[13px] leading-relaxed text-muted">
            Chats, photos, and reactions stay in sync—sign in on the right to continue.
          </p>

          <div className="relative mt-8 flex min-h-[300px] flex-1 items-center justify-center">
            <div className="grid-bg absolute inset-0" aria-hidden="true" />
            <div
              className="absolute h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(20,110,255,0.35),transparent_65%)] blur-2xl"
              aria-hidden="true"
            />
            <span className="rocket relative" role="img" aria-label="Rocket">
              🚀
            </span>
          </div>

          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-faint">
            End-to-end session · Encrypted in transit
          </p>
        </section>

        {/* Right: secure entry card */}
        <section className="flex items-center justify-center px-6 py-12">
          <div className="animate-pop w-full max-w-[440px] rounded-[28px] border border-line bg-surface p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl border border-line bg-input">
                <Logo size={40} />
              </div>

              <div className="mt-5 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                <span aria-hidden="true">✦</span>
                Secure entry
              </div>

              <button
                type="button"
                onClick={() => openSignIn({ mode: "modal" })}
                className="mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-accent text-base font-semibold text-accent-ink shadow-[0_14px_34px_-12px_var(--accent)] transition hover:bg-accent-hover"
              >
                Continue
                <ArrowRightIcon className="h-5 w-5" />
              </button>

              <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted">
                <ShieldIcon className="h-4 w-4 text-emerald-500" />
                Protected session · TLS encryption
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
