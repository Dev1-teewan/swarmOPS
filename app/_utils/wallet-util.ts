import MetaMaskLogo from "@/app/_public/metamask.png";
import { StaticImageData } from "next/image";

const walletProviderLogos: { [key: string]: StaticImageData } = {
  metamask: MetaMaskLogo,
  // Add more wallet providers and their logos here
};

export const getWalletProviderLogo = (
  provider: string
): StaticImageData | null => {
  return walletProviderLogos[provider];
};
