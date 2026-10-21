import { avatarColor, cn, getInitials } from "../lib/utils";

/** Avatar with optional presence dot. Falls back to colored initials. */
export default function Avatar({ user, size = 40, online, showStatus = true, className = "" }) {
  const name = user?.fullName || "";
  const fontSize = Math.max(10, Math.round(size * 0.38));

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      {user?.profilePic ? (
        <img
          src={user.profilePic}
          alt={name}
          className="h-full w-full rounded-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="grid h-full w-full place-items-center rounded-full font-semibold text-white"
          style={{ background: avatarColor(name), fontSize }}
          aria-hidden="true"
        >
          {getInitials(name)}
        </div>
      )}

      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2",
            online ? "bg-emerald-500" : "bg-zinc-500",
          )}
          style={{ borderColor: "var(--panel)" }}
        />
      )}
    </div>
  );
}
