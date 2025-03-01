import React, { ReactNode, useState } from "react";
import type { FundCardPropsReact } from "@coinbase/onchainkit/fund";
import {
  FundCardAmountInput,
  FundCardAmountInputTypeSwitch,
  FundCardHeader,
  FundCardPaymentMethodDropdown,
  FundCardPresetAmountInputList,
  FundCardProvider,
  FundCardSubmitButton,
} from "@coinbase/onchainkit/fund";
import "@coinbase/onchainkit/styles.css";
import { Button } from "@/components/ui/button";

export function FundCard({
  assetSymbol,
  buttonText = "Buy",
  headerText,
  country = "US",
  subdivision,
  currency = "USD",
  presetAmountInputs,
  children = <DefaultFundCardContent />,
  onError,
  onStatus,
  onSuccess,
}: FundCardPropsReact) {
  return (
    <FundCardProvider
      asset={assetSymbol}
      headerText={headerText}
      buttonText={buttonText}
      country={country}
      subdivision={subdivision}
      currency={currency}
      onError={onError}
      onStatus={onStatus}
      onSuccess={onSuccess}
      presetAmountInputs={presetAmountInputs}
    >
      <div className="flex w-full flex-col rounded-lg">
        <FundCardContent>{children}</FundCardContent>
      </div>
    </FundCardProvider>
  );
}

function FundCardContent({ children }: { children: ReactNode }) {
  // useFundCardSetupOnrampEventListeners();
  return (
    <form className="w-full" data-testid="ockFundCardForm">
      {children}
    </form>
  );
}

function DefaultFundCardContent() {
  return (
    <>
      <FundCardHeader />
      <FundCardAmountInput />
      <FundCardAmountInputTypeSwitch />
      <FundCardPresetAmountInputList />
      <FundCardPaymentMethodDropdown />
      <FundCardSubmitButton />
    </>
  );
}

interface FundCardContainerProps {
  addToolResult: (result: {
    toolCallId: string;
    result: { message: string };
  }) => void;
  toolCallId: string;
}

const FundCardContainer: React.FC<FundCardContainerProps> = ({
  addToolResult,
  toolCallId,
}) => {

  const onCancel = () => {
    addToolResult({
      toolCallId,
      result: {
        message: "Funding cancelled",
      },
    });
  };

  return (
    <div className="flex flex-col gap-2 p-4 border border-[#ddf813] rounded-lg mt-4 mb-4 bg-zinc-900 text-white">
      <FundCard
        assetSymbol="ETH"
        country="US"
        currency="USD"
        presetAmountInputs={["10", "20", "50"]}
      />
      <Button variant="ghost" className="w-full h-12" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
};

export default FundCardContainer;
