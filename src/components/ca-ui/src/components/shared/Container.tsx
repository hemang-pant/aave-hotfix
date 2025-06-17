import styled from "styled-components";

const MainContainer = styled.div<{ $display: boolean }>`
  display: block;
  overflow: hidden;
  visibility: ${({ $display }) => ($display ? "visible" : "hidden")};
  height: ${({ $display }) => ($display ? "auto" : "0")};
  transition: height 300ms ease;
`;

export { MainContainer as MainContainerBase };
