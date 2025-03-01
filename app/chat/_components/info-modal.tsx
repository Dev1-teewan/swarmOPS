import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Bot, Shield, Zap, Coins, ArrowRight, WalletCards } from "lucide-react";

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InfoModal({ open, onOpenChange }: InfoModalProps) {
  const features = [
    {
      icon: Bot,
      title: "AI Swarm Intelligence",
      description:
        "Multiple AI agents collaborate autonomously as a swarm to execute your trading strategy with optimal performance and minimal footprint.",
    },
    {
      icon: Shield,
      title: "Privacy-Preserving Architecture",
      description:
        "Multi-wallet design distributes your transactions across several addresses, keeping your trading activities confidential on-chain.",
    },
    {
      icon: Zap,
      title: "High-Speed Execution",
      description:
        "Leverage Ethereum L2 solutions for fast transaction processing and minimal gas fees across decentralized markets.",
    },
    {
      icon: WalletCards,
      title: "MEV Protection",
      description:
        "Distribute large trades across multiple wallets to prevent front-running and sandwich attacks from predatory bots and validators.",
    },
  ];

  const steps = [
    "Connect your Ethereum wallet securely",
    "Create your personalized AI agent swarm",
    "Set your privacy preferences and risk tolerance",
    "Fund your swarm's wallet network",
    "Let the AI optimize your trading strategy",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-[#ddf813]/50 text-white backdrop-blur-lg max-w-4xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-3xl font-bold text-[#ddf813]">
            Welcome to SwarmOPS
          </DialogTitle>
          <DialogDescription className="text-white/80 text-lg font-medium">
            Privacy-focused, AI-powered trading on Ethereum
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-8">
          <p className="text-lg text-white/80">
            SwarmOPS deploys a network of autonomous AI agents on Ethereum, each with its own
            wallet, executing your trading strategy while preserving your privacy and
            protecting you from MEV attacks.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="space-y-3 p-5 rounded-lg border border-[#ddf813]/20 bg-zinc-800/80 hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-[#ddf813]/10">
                      <Icon className="w-5 h-5 text-[#ddf813]" />
                    </div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="space-y-4 p-5 rounded-lg border border-[#ddf813]/20 bg-zinc-800/80">
            <h3 className="text-xl font-semibold text-[#ddf813] flex items-center gap-2">
              <span>Getting Started</span>
            </h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-white/80 group"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ddf813]/10 text-[#ddf813] flex items-center justify-center mt-0.5 group-hover:bg-[#ddf813]/20 transition-colors">
                    {index + 1}
                  </div>
                  <span className="text-base">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}