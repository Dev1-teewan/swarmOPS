import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bot, Shield, Zap, Coins, ArrowRight } from "lucide-react";

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InfoModal({ open, onOpenChange }: InfoModalProps) {
  const features = [
    {
      icon: Bot,
      title: "Decentralized Intelligence",
      description:
        "AI agents collaborate as a swarm, making dynamic and autonomous decisions for optimal performance.",
    },
    {
      icon: Shield,
      title: "On-Chain Privacy",
      description:
        "Multi-wallet architecture keeps your transaction activities confidential while leveraging Solana's power.",
    },
    {
      icon: Zap,
      title: "Efficient Execution",
      description:
        "Low-latency, high-speed operations powered by Solana's infrastructure for maximum efficiency.",
    },
    {
      icon: Coins,
      title: "Automated Profit Generation",
      description:
        "Agents execute strategic transactions across multiple wallets to maximize earnings potential.",
    },
  ];

  const steps = [
    "Connect your Solana wallet",
    "Create a new AI agent swarm",
    "Configure privacy and risk levels",
    "Fund your swarm wallets",
    "Let AI optimize your operations",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#001510]/95 border-[#00FF9D]/20 text-white backdrop-blur-lg max-w-4xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-semibold text-[#00FF9D]">
            Welcome To AI Agent Swarm
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-8">
          <p className="text-lg text-white/80">
            AI Agent Swarm enables a decentralized network of autonomous AI
            agents on Solana, each equipped with a unique wallet to execute
            transactions securely and efficiently.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="space-y-2 p-4 rounded-lg border border-[#00FF9D]/20 bg-black/20"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-[#00FF9D]" />
                    <h3 className="font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#00FF9D]">
              Getting Started
            </h3>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-white/80"
                >
                  <ArrowRight className="w-4 h-4 text-[#00FF9D]" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
