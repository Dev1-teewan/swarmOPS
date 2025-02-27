import Swap from "./tool-ui/swap/Swap";
import CreateSwarm from "./tool-ui/swarm/create-swarm";
import { useChatStore } from "@/app/_store/useChatStore";
import { CREATE_SWARM_NAME, PORTFOLIO_NAME, SWAP_NAME } from "@/ai-swarm/action-names";
import SwarmPortfolioView from "./tool-ui/portfolio/portfolio";

interface ToolUIProps {
  toolCallId: string;
  tool: string;
  args?: unknown;
}

export const ToolUI = ({ toolCallId, tool }: ToolUIProps) => {
  const { addToolResult, setResponseLoading } = useChatStore();

  switch (tool) {
    case CREATE_SWARM_NAME:
      return (
        <CreateSwarm
          onSubmit={(swarmData) => console.log(swarmData)}
          addToolResult={addToolResult}
          toolCallId={toolCallId}
          setResponseLoading={setResponseLoading}
        />
      );
    case SWAP_NAME:
      return (
        <Swap
          initialInputToken={null}
          initialOutputToken={null}
          inputLabel="Selling"
          outputLabel="Buying"
          initialInputAmount="0"
          swapText="Swap"
          swappingText="Swapping..."
          addToolResult={addToolResult}
          toolCallId={toolCallId}
          setResponseLoading={setResponseLoading}
        />
      );
    case PORTFOLIO_NAME:
      return (
        <SwarmPortfolioView
          addToolResult={addToolResult}
          toolCallId={toolCallId}
          onCancel={() => addToolResult({
            toolCallId,
            result: {},
          })}
          setResponseLoading={setResponseLoading}
        />
      )
    default:
      return <div></div>;
  }
};
