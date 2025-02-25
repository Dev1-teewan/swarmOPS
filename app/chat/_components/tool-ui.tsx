import { CREATE_SWARM_NAME } from "@/ai-swarm/action-names";

interface ToolUIProps {
  tool: string;
}

export const ToolUI = ({ tool }: ToolUIProps) => {
  console.log(tool, "here");
  switch (tool) {
    case CREATE_SWARM_NAME:
      return <div>Swarm Creation</div>;
    default:
      return <div></div>;
  }
};
