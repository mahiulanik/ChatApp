import { useMemo } from "react";
import { useChat } from "../context/ChatContext";
import ChatHeader from "../components/ChatHeader";
import EmptyChat from "../components/EmptyChat";
import MessageInput from "../components/MessageInput";
import MessageList from "../components/MessageList";
import Sidebar from "../components/Sidebar";

/**
 * The chat shell: sidebar (Chats/Users) + conversation pane.
 * On mobile the sidebar is full screen until a chat is opened.
 */
export default function Home() {
  const { conversations, users, selectedId, me } = useChat();

  const selectedUser = useMemo(() => {
    if (selectedId === null || selectedId === undefined) return null;
    return (
      conversations.find((u) => String(u._id) === String(selectedId)) ||
      users.find((u) => String(u._id) === String(selectedId)) ||
      null
    );
  }, [conversations, users, selectedId]);

  return (
    <div className="flex h-full bg-app">
      <Sidebar className={selectedUser ? "hidden md:flex" : "flex"} />

      <main
        className={
          selectedUser ? "flex h-full min-w-0 flex-1 flex-col" : "hidden min-w-0 flex-1 md:flex md:h-full md:flex-col"
        }
      >
        <ChatHeader user={selectedUser} />

        {selectedUser ? (
          <>
            <MessageList myId={me?._id} />
            <MessageInput />
          </>
        ) : (
          <EmptyChat />
        )}
      </main>
    </div>
  );
}
