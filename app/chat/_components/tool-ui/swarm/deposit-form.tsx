import React from "react";
import Image from "next/image";
import { useEffect, useReducer } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, RefreshCw, Shuffle } from "lucide-react";

export interface WalletAllocation {
  amount: number;
  percentage: string;
}

interface DepositFormProps {
  privacyLevel: string;
  formData: {
    name: string;
    strategy: string;
    riskLevel: string;
    privacyLevel: string;
  };
  onSubmit: (combinedData: {
    swarm: {
      name: string;
      strategy: string;
      riskLevel: string;
      privacyLevel: string;
    };
    deposit: { wallets: WalletAllocation[] };
  }) => void;
}

type Action =
  | { type: "SET_DEPOSIT_AMOUNT"; value: string }
  | { type: "UPDATE_PERCENTAGE"; index: number; percentage: string }
  | { type: "FINALIZE_PERCENTAGES" }
  | { type: "RESET_ALLOCATIONS" }
  | { type: "RANDOMIZE_ALLOCATIONS" }
  | { type: "ADD_WALLET" }
  | { type: "REMOVE_WALLET"; index: number }
  | { type: "INITIALIZE_WALLETS"; count: number }
  | { type: "RESET_FORM" };

interface State {
  depositAmount: number;
  inputValue: string;
  wallets: WalletAllocation[];
}

// const MINIMUM_RENT = 0.00203928;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_DEPOSIT_AMOUNT": {
      const amount = action.value === "" ? 0 : parseFloat(action.value);
      const newWallets = state.wallets.map((wallet) => ({
        ...wallet,
        amount: (amount * Number(wallet.percentage)) / 100,
      }));
      return {
        ...state,
        depositAmount: amount,
        inputValue: action.value,
        wallets: newWallets,
      };
    }

    case "UPDATE_PERCENTAGE": {
      if (action.index === 0) return state;

      const newWallets = [...state.wallets];
      newWallets[action.index].percentage = action.percentage;

      // Calculate first wallet's percentage based on others
      const totalExcludingFirst = newWallets
        .slice(1)
        .reduce((sum, w) => sum + Number(w.percentage || 0), 0);
      newWallets[0].percentage = (100 - totalExcludingFirst).toString();

      // Update amounts
      newWallets.forEach((wallet) => {
        wallet.amount = (state.depositAmount * Number(wallet.percentage)) / 100;
      });

      // Check if first wallet's percentage is negative
      if (Number(newWallets[0].percentage) < 0) {
        console.error("Total allocation exceeds 100%");
        // return state
      }

      return { ...state, wallets: newWallets };
    }

    case "FINALIZE_PERCENTAGES": {
      return {
        ...state,
        wallets: state.wallets.map((wallet) => ({
          ...wallet,
          percentage: Number(wallet.percentage).toFixed(2),
        })),
      };
    }

    case "RESET_ALLOCATIONS": {
      const equalPercentage = (100 / state.wallets.length).toFixed(2);
      const newWallets = state.wallets.map((wallet) => ({
        ...wallet,
        percentage: equalPercentage,
        amount: (state.depositAmount * Number(equalPercentage)) / 100,
      }));
      return { ...state, wallets: newWallets };
    }

    case "RANDOMIZE_ALLOCATIONS": {
      let remainingPercentage = 100;
      const newWallets = [...state.wallets];
      const minPercentage = 5; // Minimum 5% for each wallet

      // Generate random percentages that sum to 100
      for (let i = 1; i < newWallets.length; i++) {
        const maxPercentage =
          remainingPercentage - minPercentage * (newWallets.length - i);
        const randomPercentage =
          Math.random() * (maxPercentage - minPercentage) + minPercentage;
        const percentage = randomPercentage.toFixed(2);
        newWallets[i] = {
          ...newWallets[i],
          percentage,
          amount: (state.depositAmount * Number(percentage)) / 100,
        };
        remainingPercentage -= Number(percentage);
      }

      // First wallet gets the remaining percentage
      newWallets[0] = {
        ...newWallets[0],
        percentage: remainingPercentage.toFixed(2),
        amount: (state.depositAmount * remainingPercentage) / 100,
      };

      return { ...state, wallets: newWallets };
    }

    case "ADD_WALLET": {
      if (state.wallets.length >= 9) {
        // toast.error("Maximum 9 wallets allowed")
        return state;
      }
      const newWallet: WalletAllocation = {
        amount: 0,
        percentage: "0",
      };
      const newWallets = [...state.wallets, newWallet];
      // Reset to equal distribution
      const equalPercentage = (100 / newWallets.length).toFixed(2);
      newWallets.forEach((wallet) => {
        wallet.percentage = equalPercentage;
        wallet.amount = (state.depositAmount * Number(equalPercentage)) / 100;
      });
      return { ...state, wallets: newWallets };
    }

    case "REMOVE_WALLET": {
      if (state.wallets.length <= 2) {
        // toast.error("Minimum 2 wallets required")
        return state;
      }
      const newWallets = state.wallets.filter((_, i) => i !== action.index);
      // Reset to equal distribution
      const equalPercentage = (100 / newWallets.length).toFixed(2);
      newWallets.forEach((wallet) => {
        wallet.percentage = equalPercentage;
        wallet.amount = (state.depositAmount * Number(equalPercentage)) / 100;
      });
      return { ...state, wallets: newWallets };
    }

    case "INITIALIZE_WALLETS": {
      const equalPercentage = (100 / action.count).toFixed(2);
      const wallets = Array.from({ length: action.count }, () => ({
        amount: (state.depositAmount * Number(equalPercentage)) / 100,
        percentage: equalPercentage,
      }));
      return { ...state, wallets };
    }

    case "RESET_FORM": {
      return {
        depositAmount: 0,
        inputValue: "0",
        wallets: [],
      };
    }

    default:
      return state;
  }
}

export function DepositForm({
  privacyLevel,
  formData,
  onSubmit,
}: DepositFormProps) {
  const [state, dispatch] = useReducer(reducer, {
    depositAmount: 0,
    inputValue: "0",
    wallets: [],
  });

  useEffect(() => {
    const walletCount =
      privacyLevel === "LOW" ? 3 : privacyLevel === "MEDIUM" ? 6 : 9;
    dispatch({ type: "INITIALIZE_WALLETS", count: walletCount });
    console.log(privacyLevel, walletCount);
  }, [privacyLevel]);

  // const totalAllocation = state.wallets.reduce(
  //   (sum, wallet) => sum + wallet.amount + MINIMUM_RENT,
  //   0
  // );

  const [isSubmitted, setIsSubmitted] = React.useState(false);

  return (
    <div className="space-y-6 mt-4 text-sm">
      <div className="space-y-2">
        <Label className="text-base flex items-center gap-1">
          Deposit Amount
          <div className="inline-flex items-center gap-1 text-[#00FF9D]/90 ml-1">
            <span>(in</span>
            <div className="flex items-center">
              <span>ETH </span>
              <Image
                src="https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/info/logo.png"
                alt="Token icon"
                className="inline-block rounded-full"
                width={15}
                height={15}
              />
            </div>
            <span>)</span>
          </div>
        </Label>
        <Input
          type="number"
          step="0.000000001"
          min="0"
          placeholder="Enter amount"
          value={state.inputValue}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "" || /^\d*\.?\d*$/.test(value)) {
              dispatch({
                type: "SET_DEPOSIT_AMOUNT",
                value,
              });
            }
          }}
          className="bg-[#001510]/80 border-[#00FF9D]/20 text-white"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-base">Wallet Allocations</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "RESET_ALLOCATIONS" })}
              className="bg-[#001510]/80 border-[#00FF9D]/20 hover:bg-[#002018]/90"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "RANDOMIZE_ALLOCATIONS" })}
              className="bg-[#001510]/80 border-[#00FF9D]/20 hover:bg-[#002018]/90"
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "ADD_WALLET" })}
              className="bg-[#001510]/80 border-[#00FF9D]/20 hover:bg-[#002018]/90"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto pr-2">
          <table className="min-w-full bg-black/40 rounded-lg">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Ratio
                </th>
                <th className="px-6 py-3"></th>
              </tr>
              <tr>
                <td colSpan={4} className="border-b border-zinc-700"></td>
              </tr>
            </thead>
            <tbody>
              {state.wallets.map((wallet, index) => (
                <tr key={index} className="border-b border-zinc-700">
                  <td className="px-6 py-4 whitespace-nowrap text-white/60">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Input
                      value={wallet.amount}
                      disabled
                      className="bg-black/40 border-[#00FF9D]/20 text-white"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        value={wallet.percentage}
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_PERCENTAGE",
                            index,
                            percentage: e.target.value,
                          })
                        }
                        onBlur={() =>
                          dispatch({ type: "FINALIZE_PERCENTAGES" })
                        }
                        disabled={index === 0}
                        className="bg-black/40 border-[#00FF9D]/20 text-white"
                      />
                      <span className="text-[#00FF9D]">%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {index !== 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          dispatch({ type: "REMOVE_WALLET", index })
                        }
                        className="ml-2 hover:bg-red-500/20 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Button
        onClick={() => {
          const combinedData = {
            swarm: formData,
            deposit: {
              amount: state.depositAmount,
              wallets: state.wallets.map(({ amount, percentage }) => ({
                amount,
                percentage,
              })),
            },
          };
          onSubmit(combinedData);
          dispatch({ type: "RESET_FORM" });
          setIsSubmitted(true);
        }}
        disabled={isSubmitted}
        className={`w-full transition-colors duration-300 border-[#00FF9D]/20 
          ${
            isSubmitted
              ? "bg-zinc-500 text-zinc-300 cursor-not-allowed"
              : "bg-[#001510]/80 hover:bg-[#002018]/90 text-[#00FF9D]"
          }`}
      >
        {isSubmitted ? "Confirmed" : "Confirm Deposit"}
      </Button>
    </div>
  );
}
