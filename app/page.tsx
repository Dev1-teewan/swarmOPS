import LoginButton from "./_components/login-button";
import { ModeToggle } from "@/components/ui/toggle-theme";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        \
        <div className="mb-2">
          SwarmOPS,
          <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
            Your AI Agent
          </code>
          .
        </div>
        \
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <LoginButton />
          <ModeToggle />
        </div>
      </main>
    </div>
  );
}
