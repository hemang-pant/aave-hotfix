import React from "react";
import styled from "styled-components";

const LoaderC = styled.div<{ $width: string }>`
  aspect-ratio: 1;
  border-radius: 50%;
  background: ${({ theme, $width }) => {
    return `radial-gradient(farthest-side, ${theme.primaryColor} 94%, #0000) top/${$width} ${$width} no-repeat, conic-gradient(#0000 30%, ${theme.primaryColor});`;
  }}
  -webkit-mask: ${({ $width }) =>
    `radial-gradient(farthest-side, #0000 calc(100% - ${$width}), #000 0);`} 
  animation: l13 1s infinite linear;

  @keyframes l13 {
  100% {
    transform: rotate(1turn);
  }
}
`;

const Loader = ({ $width }: { $width: string }) => {
  return <LoaderC $width={$width} />;
};

export default Loader;
