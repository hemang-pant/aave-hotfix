import React from "react";
import styled from "styled-components";
import { VIDEO_LINKS } from "../utils/assetList";
import { MainContainerBase } from "./shared/Container";

const MainContainer = styled(MainContainerBase)``;

const Title = styled.h2`
  font-family: "Nohami", sans-serif;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 10px;
  color: ${({ theme }) => theme.primaryColor};
  text-align: center;
`;

const Button = styled.button`
  margin-top: 20px;
  padding: 15px 20px;
  width: 100%;
  background: ${({ theme }) => theme.primaryColor};
  color: ${({ theme }) => theme.buttonTextColor};
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 0.3s ease;
`;

const Description = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  font-weight: 400;
  margin: 0 0 10px;
  color: ${({ theme }) => theme.primaryTitleColor};
  text-align: center;
`;

const Video = styled.video`
  margin: 0 auto;
  height: 8rem;
  position: relative;
  animation: fadeIn 0.5s;
`;

const ErrorBox: React.FC<{
  message: string;
  close: () => void;
  $display: boolean;
}> = ({ message, close, $display }) => {
  return (
    <MainContainer $display={$display}>
      <Video
        src={VIDEO_LINKS["error"]}
        autoPlay
        muted
        onContextMenu={(e) => e.preventDefault()}
      />

      <Title>Oops!</Title>
      <Description>{message}</Description>
      <Button onClick={close}>Close</Button>
    </MainContainer>
  );
};

export default ErrorBox;
