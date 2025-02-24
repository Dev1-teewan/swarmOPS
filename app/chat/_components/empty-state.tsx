"use client";

import Image from "next/image";
import { useState } from "react";
import InputArea from "./input-area";
import { InfoModal } from "./info-modal";
import GhostsSVG from "@/app/_public/svgs/ghosts.svg";
import { Bot, Shield, Zap, Coins, Info } from "lucide-react";

export function EmptyState() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-4xl mx-auto text-center px-4">
      {/* Robot SVG with wave emoji */}
      <div className="relative w-96 h-64">
        <div className="w-full h-full">
          <Image
            src={GhostsSVG}
            alt="Empty Swarm"
            className="w-full h-full [&>g]:stroke-white"
            width={600}
            height={460}
            style={{ filter: "brightness(0.8)" }}
          />
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-3 text-white opacity-90">
        Unleash your swarm of ghost wallets
      </h1>

      <p className="text-lg text-zinc-500 mb-4">
        Execute your trades . Stay hidden. Be the ghost in Blockchain 🕵️‍♂️
      </p>

      <InputArea />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 mb-12 w-full max-w-3xl">
        {[
          {
            icon: Bot,
            title: "AI-Powered",
            description: "24/7 Automation",
          },
          {
            icon: Shield,
            title: "Private",
            description: "Enhanced Security",
          },
          {
            icon: Zap,
            title: "Fast",
            description: "Instant Execution",
          },
          {
            icon: Coins,
            title: "Profitable",
            description: "Optimized Returns",
          },
        ].map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="flex flex-col items-center p-4 rounded-lg border border-zinc-500/20 bg-black/20 backdrop-blur-sm
          hover:bg-zinc-900/90 transition-all duration-300"
            >
              <Icon className="w-6 h-6 text-emerald-400 opacity-90 mb-2" />
              <h3 className="font-medium text-white/90 mb-1">
                {feature.title}
              </h3>
              <p className="text-white/50 text-sm">{feature.description}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => setShowInfo(true)}
          className="flex items-center gap-2 text-emerald-400 hover:text-[#00FF9D]/60 transition-colors text-sm"
        >
          <Info className="w-4 h-4" />
          What is a Swarm?
        </button>
      </div>

      <InfoModal open={showInfo} onOpenChange={setShowInfo} />
    </div>
  );
}

export default EmptyState;
