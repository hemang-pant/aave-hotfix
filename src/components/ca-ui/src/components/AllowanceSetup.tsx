import React from "react";
import styled from "styled-components";
import Loader from "./shared/Loader";
import { MainContainerBase } from "./shared/Container";
import { VIDEO_LINKS, IMAGE_LINKS } from "../utils/assetList";
import { Checkbox, CheckboxControl, CheckboxLabel } from "@ark-ui/react";
import { useTheme } from "./ThemeProvider";
import type { onAllowanceHookSource } from "@arcana/ca-sdk";

const MainContainer = styled(MainContainerBase)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
`;

const Video = styled.video`
  height: 8rem;
  position: relative;
  animation: fadeIn 0.5s;
  margin: 0 auto;
`;

const BigLoaderWrap = styled.div`
  width: 5rem;
  margin: 1rem auto;
`;

const LoaderWrap = styled.div`
  width: 2rem;
  animation: fadeIn 0.5s;
`;

const SectionTitle = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  justify-content: start;
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${({ isDarkMode, theme }) =>
    isDarkMode ? theme.primaryTitleColor : theme.primaryTitleColor};
`;

const StyledCheckbox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  /* transition: all 0.3s; */
  border-radius: 12px;
  margin: 6px 0px;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  background: ${({ theme }) => theme.cardDetailsBackGround};
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 10px;
  border: ${({ theme }) => `1px solid ${theme.backgroundColor}`};
  max-height: 200px;
  overflow: auto;
`;

const StyledCheckboxLabel = styled(CheckboxLabel)<{ disabled: boolean }>`
  text-align: start;
  font-family: "Nohemi", sans-serif;
  font-weight: 500;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.primaryColor};
  opacity: ${({ disabled }) => (disabled ? "40%" : "100%")};
`;

const StyledCheckboxControl = styled(CheckboxControl)<{ checked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  /* transition: all 0.3s; */
`;

const SectionWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 6px 0px;
  margin-top: 2rem;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const RelativeContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const Logo = styled.img`
  height: 28px;
  width: 28px;
  border-radius: 50%;
  background: #ffffff;
`;

const ChainLogo = styled.img`
  position: absolute;
  bottom: -4px;
  right: -4px;
  z-index: 50;
  height: 14px;
  width: 14px;
  border-radius: 50%;
  border: 1px solid #ffffff;
`;

const TokenDetails = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const TokenName = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.primaryColor};
`;

const ChainName = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  font-weight: 400;
  color: ${({ theme }) => theme.secondaryTitleColor};
`;

const AllowanceSetup: React.FC<{
  sources: Array<onAllowanceHookSource & { done: boolean }>;
  $display: boolean;
}> = ({ sources, $display }) => {
  const { isDarkMode } = useTheme();

  const incompleteStep = sources.findIndex((s) => s.done === false);
  const currentStep =
    incompleteStep === -1 ? sources.length : incompleteStep + 1;
  const state = incompleteStep === -1 ? "success" : "inprogress";

  return (
    <MainContainer $display={$display}>
      {state === "success" ? (
        <Video
          src={VIDEO_LINKS["success"]}
          autoPlay
          muted
          onContextMenu={(e) => e.preventDefault()}
        />
      ) : (
        <BigLoaderWrap>
          <Loader $width="13px" />
        </BigLoaderWrap>
      )}

      <SectionWrap>
        <SectionTitle isDarkMode={isDarkMode}>SETUP ALLOWANCES</SectionTitle>
      </SectionWrap>
      <Card>
        {sources.map((src, index: number) => (
          <Container key={index}>
            <Checkbox.Root value={src.chain.name} checked={src.done}>
              <StyledCheckbox>
                <StyledCheckboxLabel disabled={index >= currentStep}>
                  <FlexContainer>
                    <RelativeContainer>
                      <Logo src={src.token.logo} alt="Token Logo" />
                      <ChainLogo src={src.chain.logo} alt="Chain Logo" />
                    </RelativeContainer>
                    <TokenDetails>
                      <TokenName>{src.token.symbol}</TokenName>
                      <ChainName>{src.chain.name}</ChainName>
                    </TokenDetails>
                  </FlexContainer>
                </StyledCheckboxLabel>

                <StyledCheckboxControl checked={src.done || false}>
                  {src.done === false ? (
                    index == currentStep - 1 ? (
                      <LoaderWrap>
                        <Loader $width="4px" />
                      </LoaderWrap>
                    ) : (
                      "-"
                    )
                  ) : src.done === true ? (
                    <img
                      src={IMAGE_LINKS["success"]}
                      alt="Success"
                      width={20}
                      height={20}
                    />
                  ) : (
                    <img
                      src={IMAGE_LINKS["error"]}
                      alt="Error"
                      width={20}
                      height={20}
                    />
                  )}
                </StyledCheckboxControl>
              </StyledCheckbox>
            </Checkbox.Root>
          </Container>
        ))}
      </Card>
    </MainContainer>
  );
};

export default AllowanceSetup;
