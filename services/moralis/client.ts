import Moralis from 'moralis';

let moralisInstance: typeof Moralis | null = null;

export const getMoralis = async () => {
  if (!process.env.NEXT_PUBLIC_MORALIS_KEY) {
    throw new Error("NEXT_PUBLIC_MORALIS_KEY is required");
  }

  if (!moralisInstance) {
    await Moralis.start({ apiKey: process.env.NEXT_PUBLIC_MORALIS_KEY });
    moralisInstance = Moralis;
  }

  return moralisInstance;
}