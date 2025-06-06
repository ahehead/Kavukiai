
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollArea } from "renderer/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "renderer/components/ui/tooltip";
import { Drag } from "rete-react-plugin";


export function withTooltip(
  trigger: React.ReactElement,
  isTypeLabel: boolean,
  tooltipText?: string
) {
  return tooltipText ? (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent className={isTypeLabel ? "" : "prose not-prose-p:py-0"} variant={isTypeLabel ? "header" : "default"}>
        <Drag.NoDrag>
          <ScrollArea className="max-h-[90px] max-w-[300px]">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, ...props }) {
                  // コードブロック
                  return (
                    <pre className="not-prose">
                      <code {...props} />
                    </pre>
                  );
                },
              }}
            >
              {tooltipText}
            </Markdown>
          </ScrollArea>
        </Drag.NoDrag>
      </TooltipContent>
    </Tooltip>
  ) : (
    trigger
  );
};
