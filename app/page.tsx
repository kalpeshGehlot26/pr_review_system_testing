import ChatList from "@/components/ChatList";
import ConversationPanel from "@/components/ConversationPanel";
import DetailsPanel from "@/components/DetailsPanel";
import NavSidebar from "@/components/NavSidebar";

export default function Home() {
  return (
    <main
      data-testid="feature-root"
      className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-violet-100 via-indigo-50 to-purple-100 p-4"
    >
      <div
        data-testid="chat-app"
        className="flex h-full max-h-[900px] w-full max-w-[1400px] overflow-hidden rounded-3xl bg-white shadow-2xl shadow-violet-200/50"
      >
        <NavSidebar />
        <ChatList />
        <ConversationPanel />
        <DetailsPanel />
      </div>
    </main>
  );
}
