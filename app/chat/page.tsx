import Chat from "./_components/chat";
import PlainHeader from "../_components/header";
import NotLoggedInAlert from "./_components/no-login";

export default function SwarmBase() {
  return (
    <div className="flex h-screen">
      <PlainHeader />
      <PlainHeader /> {/* Duplicate look cooler */}
      <NotLoggedInAlert />
      <Chat />
    </div>
  );
}
