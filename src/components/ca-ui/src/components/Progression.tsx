import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import Loader from "./shared/Loader";
import { VIDEO_LINKS, IMAGE_LINKS } from "../utils/assetList";
import { getTextFromStep } from "../utils/getTextFromSteps";
import { Checkbox, CheckboxControl, CheckboxLabel } from "@ark-ui/react";
import type { ProgressStep } from "@arcana/ca-sdk";
import { MainContainerBase } from "./shared/Container";

const MainContainer = styled(MainContainerBase)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
`;

const Video = styled.video`
  margin: 0 auto;
  height: 8rem;
  position: relative;
  animation: fadeIn 0.5s;
`;

const BigLoaderWrap = styled.div`
  width: 5rem;
  animation: fadeIn 0.5s;
  margin: 1rem auto;
`;

const LoaderWrap = styled.div`
  width: 2rem;
  animation: fadeIn 0.5s;
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

const StyledCheckboxLabel = styled(CheckboxLabel)<{ disabled: boolean }>`
  text-align: start;
  font-family: "Nohemi", sans-serif;
  font-weight: 500;
  font-size: 1.25rem;
  color: ${({ theme, disabled }) =>
    disabled ? "#829299" : theme.primaryColor};
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

const LinkContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
  /* transition: all 0.3s; */
`;

const StyledLink = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: "Inter", sans-serif;
  font-size: 1.25rem;
  font-weight: 500;
  color: ${({ theme }) => theme.secondaryColor};
  text-decoration: none;

  &:hover,
  &:active {
    text-decoration: none;
  }
`;

const stepList = [
  "INTENT_SUBMITTED",
  "INTENT_COLLECTION_COMPLETE",
  "INTENT_DEPOSITS_CONFIRMED",
  "INTENT_FULFILLED",
];

const Progress: React.FC<{
  intentSteps: Array<ProgressStep & { done: boolean }>;
  $display: boolean;
  close: () => void;
}> = ({ intentSteps, $display, close }) => {
  const steps = intentSteps.filter((s) => stepList.includes(s.type));
  const incompleteStep = steps.findIndex((s) => s.done === false);
  const currentStep = incompleteStep === -1 ? steps.length : incompleteStep + 1;
  const inProgressState = incompleteStep === -1 ? "success" : "inprogress";
  const explorerURL =
    // @ts-ignore
    steps.find((s) => {
      return s.type === "INTENT_SUBMITTED" && s.done === true;
      // @ts-ignore
    })?.data.explorerURL ?? "";

  useEffect(() => {
    if (inProgressState === "success" && $display) {
      window.setTimeout(() => {
        close();
      }, 1000);
    }
  }, [inProgressState]);

  return (
    <MainContainer $display={$display}>
      {inProgressState === "success" ? (
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

      <Container>
        {steps.map((step, index: number) => (
          <Checkbox.Root
            value={step.type}
            checked={step.done || false}
            disabled={
              index !== 0 && !step.done && !intentSteps[index - 1]?.done
            }
            key={index}
          >
            <StyledCheckbox>
              <StyledCheckboxLabel
                disabled={
                  inProgressState != "success" &&
                  !step.done &&
                  index > incompleteStep
                }
              >
                {getTextFromStep(step.type, step.done || false)}
              </StyledCheckboxLabel>

              <StyledCheckboxControl checked={step.done || false}>
                {step.done === false ? (
                  index == currentStep - 1 ? (
                    <LoaderWrap>
                      <Loader $width="4px" />
                    </LoaderWrap>
                  ) : (
                    "-"
                  )
                ) : step.done === true ? (
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
        ))}
        {explorerURL && (
          <LinkContainer>
            <StyledLink href={explorerURL} target="_blank">
              <img
                src={IMAGE_LINKS["link"]}
                alt="Link"
                width={20}
                height={20}
              />
              <span>View Intent</span>
            </StyledLink>
          </LinkContainer>
        )}
      </Container>
    </MainContainer>
  );
};

export default Progress;
