import { useState } from "react";
import { UserButton } from "@clerk/react";
import { useChat } from "../context/ChatContext";
import { APP_NAME } from "../lib/constants";
import { cn } from "../lib/utils";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { MessageIcon, SearchIcon, UsersIcon } from "./icons";

function ListRow({ user, active, online, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 border-b border-line/70 px-3 py-2.5 text-left transition hover:bg-surface/60",
        active && "bg-accent-soft hover:bg-accent-soft",
      )}
    >
      <Avatar user={user} online={online} />
      <span className="min-w-0 truncate text-sm font-semibold text-ink">
        {user.fullName}
      </span>
    </button>
  );
}

function EmptyList({ children }) {
  return (
    <p className="px-4 py-10 text-center text-sm text-muted">{children}</p>
  );
}

/** Left column: brand + Clerk avatar menu, search, Chats/Users tabs, lists. */
export default function Sidebar({ className = "" }) {
  const {
    conversations,
    users,
    selectedId,
    openChat,
    isOnline,
    bootstrapping,
    apiError,
    retryBootstrap,
  } = useChat();
  const [tab, setTab] = useState("chats");
  const [query, setQuery] = useState("");

  const source = tab === "chats" ? conversations : users;
  const filtered = query.trim()
    ? source.filter((u) => u.fullName.toLowerCase().includes(query.trim().toLowerCase()))
    : source;

  const handleSelect = (id) => openChat(id);

  return (
    <aside
      className={cn(
        "h-full w-full flex-col border-r border-line bg-panel md:flex md:w-[300px] md:shrink-0",
        className,
      )}
    >
      {/* Brand + account */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-line px-3">
        <Logo size={30} />
        <span className="text-base font-bold tracking-tight text-ink">{APP_NAME}</span>
        <div className="ml-auto">
          <UserButton />
        </div>
      </div>

      {/* Search */}
      <div className="relative shrink-0 px-3 py-2.5">
        <SearchIcon className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          aria-label="Search chats and users"
          className="h-10 w-full rounded-xl border border-line bg-input pl-9 pr-3 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Tabs */}
      <div className="grid shrink-0 grid-cols-2 border-b border-line">
        <button
          type="button"
          onClick={() => setTab("chats")}
          className={cn(
            "flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium transition",
            tab === "chats" ? "text-ink" : "text-muted hover:text-ink",
          )}
        >
          <MessageIcon className="h-4 w-4" />
          Chats
        </button>
        <button
          type="button"
          onClick={() => setTab("users")}
          className={cn(
            "flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium transition",
            tab === "users" ? "text-ink" : "text-muted hover:text-ink",
          )}
        >
          <UsersIcon className="h-4 w-4" />
          Users
        </button>
      </div>

      {/* API error banner (real backend failure — no demo data fallback) */}
      {apiError && !bootstrapping && (
        <div className="shrink-0 border-b border-line bg-red-500/10 px-3 py-2.5">
          <p className="text-xs leading-relaxed text-red-500 dark:text-red-400">
            {apiError}
          </p>
          <button
            type="button"
            onClick={retryBootstrap}
            className="mt-1.5 text-xs font-semibold text-accent hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {bootstrapping ? (
          <div className="grid place-items-center py-10">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyList>
            {query.trim()
              ? "No matches found."
              : tab === "chats"
                ? "No conversations yet — start one from the Users tab."
                : "No users yet."}
          </EmptyList>
        ) : (
          filtered.map((user) => (
            <ListRow
              key={user._id}
              user={user}
              active={String(user._id) === String(selectedId)}
              online={isOnline(user._id)}
              onClick={() => handleSelect(user._id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
