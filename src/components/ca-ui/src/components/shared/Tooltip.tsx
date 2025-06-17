import React from "react";
import { Tooltip } from "@ark-ui/react";
import styled from "styled-components";

const TooltipTrigger = styled(Tooltip.Trigger)`
  display: inline-flex;
`;

const TooltipContent = styled(Tooltip.Content)<{ $width: string }>`
  font-family: "Inter", sans-serif;
  font-weight: 400;
  font-size: 0.875rem;
  background-color: white;
  color: black;
  border-radius: 4px;
  padding: 8px 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 2147483647;
  max-width: ${({ $width }) => $width};
`;

const TooltipArrow = styled(Tooltip.Arrow)`
  fill: white;
`;

const AppTooltip: React.FC<{
  message: string;
  $full?: boolean;
  children: React.ReactNode;
}> = ({ $full, message, children }) => {
  const $width = $full ? "100%" : "250px";
  return (
    <Tooltip.Root openDelay={1000} interactive={true}>
      <TooltipTrigger asChild>
        <div>{children}</div>
      </TooltipTrigger>
      <Tooltip.Positioner>
        <TooltipContent $width={$width}>
          {message}
          <TooltipArrow />
        </TooltipContent>
      </Tooltip.Positioner>
    </Tooltip.Root>
  );
};

export default AppTooltip;
