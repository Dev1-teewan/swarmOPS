import CreateSwarm from "./tool-ui/swarm/create-swarm";
import { useChatStore } from "@/app/_store/useChatStore";
import { CREATE_SWARM_NAME } from "@/ai-swarm/action-names";

interface ToolUIProps {
  toolCallId: string;
  tool: string;
}

export const ToolUI = ({ toolCallId, tool }: ToolUIProps) => {
  // console.log(tool, "here");
  const { addToolResult } = useChatStore();

  switch (tool) {
    case CREATE_SWARM_NAME:
      return (
        <CreateSwarm
          onSubmit={(swarmData) =>
            // setSwarms((prevSwarms) => [...prevSwarms, swarmData])
            console.log(swarmData)
            // Not required
          }
          addToolResult={addToolResult}
          toolCallId={toolCallId}
        />
      );
    default:
      return <div></div>;
  }
};
