import { StaticImageData } from "next/image";
import MetaMaskLogo from "@/app/_public/wallets/metamask.png";
import PhantomLogo from "@/app/_public/wallets/phantom.png";

const walletProviderLogos: { [key: string]: StaticImageData } = {
  metamask: MetaMaskLogo,
  phantom: PhantomLogo,
  // Add more wallet providers and their logos here
};

export const getWalletProviderLogo = (
  provider: string
): StaticImageData | null => {
  console.log("provider", provider);
  return walletProviderLogos[provider];
};
