import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@clerk/react";
import { io } from "socket.io-client";
import api, { authHeaders } from "../lib/api";
import { playPop } from "../lib/utils";
import { useTheme } from "./ThemeContext";

const ChatContext = createContext(null);

// Same-origin by default: local dev rides Vite's /socket.io proxy, in
// production the backend serves this page itself. VITE_SOCKET_URL overrides.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

/**
 * Owns everything chat-related: the current user profile, sidebar lists,
 * the open conversation, sending messages and the Socket.IO connection
 * (`getOnlineUsers` + `newMessage` events, matching the backend).
 *
 * Only real backend data is ever shown — if the API fails, an error banner
 * with a Retry action is surfaced instead of placeholder content.
 */
export function ChatProvider({ children }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { sound } = useTheme();

  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [retryToken, setRetryToken] = useState(0);
  // Unread badge per conversation: { [userId]: count } — seeded from the
  // conversations endpoint, bumped on incoming messages, cleared on open.
  const [unreadCounts, setUnreadCounts] = useState({});

  // Refs so long-lived effects (socket callbacks) always see fresh values.
  const usersRef = useRef(users);
  const selectedRef = useRef(selectedId);
  const soundRef = useRef(sound);
  const meRef = useRef(me);
  const getTokenRef = useRef(getToken);

  useEffect(() => {
    usersRef.current = users;
    selectedRef.current = selectedId;
    soundRef.current = sound;
    meRef.current = me;
    getTokenRef.current = getToken;
  }, [users, selectedId, sound, me, getToken]);

  /** Move (or create) a conversation so the newest chat is on top. */
  const touchConversation = useCallback((otherId) => {
    setConversations((prev) => {
      const index = prev.findIndex((u) => String(u._id) === String(otherId));
      if (index === -1) {
        const found = usersRef.current.find((u) => String(u._id) === String(otherId));
        return found ? [found, ...prev] : prev;
      }
      if (index === 0) return prev;
      const next = [...prev];
      const [entry] = next.splice(index, 1);
      next.unshift(entry);
      return next;
    });
  }, []);

  const retryBootstrap = useCallback(() => setRetryToken((t) => t + 1), []);

  /** Clear a conversation's unread badge and persist readAt on the server. */
  const clearUnread = useCallback(async (userId) => {
    const key = String(userId);
    setUnreadCounts((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    try {
      const token = await getTokenRef.current();
      await api.put(`/api/message/read/${key}`, null, {
        headers: authHeaders(token),
      });
    } catch (err) {
      console.error("[MessageX] Failed to mark conversation read:", err?.message || err);
    }
  }, []);

  // ---------------------------------------------------------- bootstrap
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let stale = false;
    (async () => {
      setBootstrapping(true);
      setApiError("");
      try {
        const token = await getTokenRef.current();
        const headers = authHeaders(token);

        const { data: meData } = await api.get("/api/auth/check", { headers });
        const [usersRes, conversationsRes] = await Promise.all([
          api.get("/api/message/users", { headers }),
          api.get("/api/message/conversations", { headers }),
        ]);

        if (stale) return;
        setMe(meData);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        const convs = Array.isArray(conversationsRes.data) ? conversationsRes.data : [];
        setConversations(convs);
        setUnreadCounts(
          Object.fromEntries(
            convs
              .filter((c) => c.unreadCount > 0)
              .map((c) => [String(c._id), c.unreadCount]),
          ),
        );
      } catch (err) {
        if (stale) return;
        console.error("[MessageX] Failed to load chat data:", err?.message || err);
        const serverMsg = err?.response?.data?.message;
        setMe(null);
        setUsers([]);
        setConversations([]);
        setUnreadCounts({});
        setApiError(
          serverMsg ||
            (import.meta.env.DEV
              ? "Can't reach the MessageX API — is the backend running on port 4000?"
              : "Can't reach the MessageX API — the server may still be waking up (cold start) or is offline."),
        );
      } finally {
        if (!stale) setBootstrapping(false);
      }
    })();

    return () => {
      stale = true;
    };
  }, [isLoaded, isSignedIn, retryToken]);

  // ------------------------------------------------------------- socket
  useEffect(() => {
    if (!isSignedIn || !me?._id) return;

    const socket = io(SOCKET_URL, {
      query: { userId: String(me._id) },
      transports: ["websocket", "polling"],
    });

    socket.on("getOnlineUsers", (ids) => setOnlineUsers(Array.isArray(ids) ? ids : []));

    socket.on("newMessage", (msg) => {
      if (!msg) return;
      const myId = String(meRef.current?._id);
      const fromMe = String(msg.senderId) === myId;
      const fromSelected = String(msg.senderId) === String(selectedRef.current);

      if (fromSelected && !fromMe) {
        setMessages((prev) =>
          prev.some((m) => String(m._id) === String(msg._id)) ? prev : [...prev, msg],
        );
        // Chat is open — persist readAt for the new message.
        clearUnread(msg.senderId);
      } else if (!fromMe) {
        // Chat not open — bump the unread badge in the sidebar.
        const key = String(msg.senderId);
        setUnreadCounts((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
      }
      if (!fromMe) {
        touchConversation(msg.senderId);
        if (soundRef.current) playPop();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isSignedIn, me?._id, touchConversation, clearUnread]);

  // ------------------------------------------------------------- actions
  const openChat = useCallback(async (id) => {
    setSelectedId(id);
    clearUnread(id);
    setMessagesLoading(true);
    try {
      const token = await getTokenRef.current();
      const { data } = await api.get(`/api/message/${id}`, {
        headers: authHeaders(token),
      });
      setMessages(Array.isArray(data) ? data : []);
      setApiError("");
    } catch (err) {
      console.error("[MessageX] Failed to load messages:", err?.message || err);
      setMessages([]);
      setApiError(err?.response?.data?.message || "Couldn't load this conversation.");
    } finally {
      setMessagesLoading(false);
    }
  }, [clearUnread]);

  const closeChat = useCallback(() => {
    setSelectedId(null);
    setMessages([]);
  }, []);

  /**
   * Delete a chat FROM MY VIEW ONLY — the other user keeps every message.
   * Optimistically drops it from the sidebar, then persists via the API.
   */
  const deleteConversation = useCallback(
    async (id) => {
      const key = String(id);
      setConversations((prev) => prev.filter((u) => String(u._id) !== key));
      setUnreadCounts((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
      if (String(selectedRef.current) === key) closeChat();

      try {
        const token = await getTokenRef.current();
        await api.delete(`/api/message/conversation/${key}`, {
          headers: authHeaders(token),
        });
        setApiError("");
      } catch (err) {
        console.error("[MessageX] Failed to delete conversation:", err?.message || err);
        setApiError(
          err?.response?.data?.message || "Couldn't delete this conversation.",
        );
      }
    },
    [closeChat],
  );

  const sendMessage = useCallback(
    async ({ text = "", file = null } = {}) => {
      const targetId = selectedRef.current;
      if (!targetId) return false;

      const trimmed = text.trim();
      const tempId = `temp-${Date.now()}`;
      const optimistic = {
        _id: tempId,
        senderId: meRef.current?._id,
        receiverId: targetId,
        text: trimmed,
        media: file
          ? {
              url: URL.createObjectURL(file),
              resourceType: file.type.startsWith("video") ? "video" : "image",
              mimeType: file.type,
            }
          : null,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      setMessages((prev) => [...prev, optimistic]);

      try {
        const formData = new FormData();
        if (trimmed) formData.append("text", trimmed);
        if (file) formData.append("media", file);

        const token = await getTokenRef.current();
        const { data } = await api.post(`/api/message/send/${targetId}`, formData, {
          headers: authHeaders(token),
        });

        setMessages((prev) => prev.map((m) => (m._id === tempId ? { ...data } : m)));
        setApiError("");
        touchConversation(targetId);
      } catch (err) {
        console.error("[MessageX] Failed to send message:", err?.message || err);
        // Never pretend a message was sent: drop the optimistic bubble.
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
        setApiError(
          err?.response?.data?.message ||
            "Message couldn't be sent — check your connection and try again.",
        );
      }
      return true;
    },
    [touchConversation],
  );

  const isOnline = useCallback(
    (id) => onlineUsers.includes(String(id)),
    [onlineUsers],
  );

  const value = useMemo(
    () => ({
      me,
      users,
      conversations,
      messages,
      selectedId,
      onlineUsers,
      bootstrapping,
      messagesLoading,
      apiError,
      unreadCounts,
      retryBootstrap,
      isOnline,
      openChat,
      closeChat,
      deleteConversation,
      sendMessage,
    }),
    [
      me,
      users,
      conversations,
      messages,
      selectedId,
      onlineUsers,
      bootstrapping,
      messagesLoading,
      apiError,
      unreadCounts,
      retryBootstrap,
      isOnline,
      openChat,
      closeChat,
      deleteConversation,
      sendMessage,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook
export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}
