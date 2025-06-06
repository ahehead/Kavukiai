
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Tooltip, TooltipContent, TooltipTrigger } from "renderer/components/ui/tooltip";
import { Drag } from "rete-react-plugin";


export function withTooltip(
  trigger: React.ReactElement,
  tooltipText?: string
) {
  return tooltipText ? (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent className="prose prose-sm">
        <Drag.NoDrag>
          <Markdown remarkPlugins={[remarkGfm]}>{tooltipText}</Markdown>
        </Drag.NoDrag>
      </TooltipContent>
    </Tooltip>
  ) : (
    trigger
  );
};
