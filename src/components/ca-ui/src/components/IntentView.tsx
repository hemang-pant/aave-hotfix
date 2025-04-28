import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Accordion } from "@ark-ui/react";
import { getCoinbasePrices } from "../utils/coinbase";
import AppTooltip from "./shared/Tooltip";
import { MainContainerBase } from "./shared/Container";
import { IMAGE_LINKS } from "../utils/assetList";
import { getReadableNumber } from "../utils/commonFunction";
import type { Intent } from "@arcana/ca-sdk";
import Decimal from "decimal.js";

const MainContainer = styled(MainContainerBase)``;
const Root = styled(Accordion.Root)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
`;

const AccordionWrapper = styled(Accordion.Item)`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const ItemIndicator = styled(Accordion.ItemIndicator)`
  width: 15px;
  margin-top: 2px;
  cursor: pointer;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HeaderRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const TooltipMessage = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  font-weight: 400;
  color: ${({ theme }) => theme.secondaryTitleColor};
`;

const TotalFees = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.primaryColor};
`;

const TotalAtDestination = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.primaryTitleColor};
`;

const TotalFeesValue = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.primaryColor};
`;

const TotalAtDestinationValue = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.primaryTitleColor};
`;

const ViewBreakupButton = styled(Accordion.ItemTrigger)`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-family: "Inter", sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.secondaryColor};
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  outline: none;

  &:focus {
    outline: none;
  }
`;

const AccordionContent = styled(Accordion.ItemContent)`
  padding-top: 0.75rem;
`;

const FeeDetails = styled.div`
  background: ${({ theme }) => theme.cardDetailsBackGround};
  border: ${({ theme }) => `1px solid ${theme.backgroundColor}`};
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FeeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

const Label = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  color: ${({ theme }) => theme.secondaryTitleColor};
`;

const Value = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.primaryColor};
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Title = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  font-weight: 400;
  color: ${({ theme }) => theme.secondaryTitleColor};
`;

const ChainDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Chain = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.primaryColor};
`;

const Card = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.cardBackGround};
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px; /* Space between items */
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

const DestinationChainLogo = styled.img`
  height: 22px;
  width: 22px;
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
  gap: 4px;
  align-items: center;
`;

const InfoImg = styled.img`
  filter: ${({ theme }) => theme.infoImg};
`;

const TokenName = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  color: ${({ theme }) => theme.primaryColor};
`;

const AllowanceAmount = styled.div`
  text-align: right;
  font-family: "Inter", sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.primaryColor};
`;

const ButtonWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

const Button = styled.button<{ variant?: "primary" | "secondary" }>`
  margin-top: 20px;
  padding: 15px 20px;
  width: 100%;
  background: ${({ theme, variant }) =>
    variant === "secondary" ? `transparent` : theme.primaryColor};
  color: ${({ theme, variant }) =>
    variant === "secondary" ? theme.primaryColor : theme.buttonTextColor};
  border: ${({ theme }) => `2px solid ${theme.primaryColor}`};
  border-radius: 25px;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 0.3s ease;
  text-transform: uppercase;
  &:hover {
    background: ${({ theme }) => theme.primaryColor};
    color: ${({ theme }) => theme.buttonTextColor};
  }

  &:disabled {
    cursor: wait;
    opacity: 0.6;
  }
`;

const IntentView: React.FC<{
  intent?: Intent;
  deny: () => void;
  allow: () => void;
  intentRefreshing: boolean;
  $display: boolean;
}> = ({ allow, deny, intent, intentRefreshing, $display }) => {
  const [rates, setRates] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchRates = async () => {
      const fetchedRates = await getCoinbasePrices();
      setRates(fetchedRates);
    };

    fetchRates();

    const interval = setInterval(() => {
      fetchRates();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  if (!intent) {
    return <></>;
  }

  return (
    <MainContainer $display={$display}>
      <Content>
        <Title>Destination</Title>
        <ChainDetails>
          <DestinationChainLogo
            src={intent.destination.chainLogo}
            alt="Chain Logo"
          />
          <Chain>{intent.destination.chainName}</Chain>
        </ChainDetails>
      </Content>
      <Root defaultValue={["sources"]} collapsible>
        <AccordionWrapper key={"sources"} value="sources">
          <Header>
            <HeaderLeft>
              <TooltipMessage>Spend</TooltipMessage>
              <AppTooltip message="Total Spend">
                <InfoImg
                  src={IMAGE_LINKS["info"]}
                  alt="Info"
                  height={18}
                  width={18}
                />
              </AppTooltip>
            </HeaderLeft>
            <HeaderRight>
              <TotalFees>
                {getReadableNumber(
                  new Decimal(intent.sourcesTotal)
                    .sub(intent.fees.total)
                    .toString()
                )}{" "}
                {intent?.token?.symbol}
              </TotalFees>
              {rates?.[intent?.token?.symbol] && (
                <TotalAtDestination>
                  ~
                  {(
                    Number(intent?.sourcesTotal) /
                    Number(rates[intent?.token?.symbol])
                  ).toFixed(2)}{" "}
                  USD
                </TotalAtDestination>
              )}
              <ViewBreakupButton>
                <span>View Sources</span>
                <ItemIndicator>
                  <img
                    src={IMAGE_LINKS["caret"]}
                    alt="Arrow"
                    height={12}
                    width={12}
                  />
                </ItemIndicator>
              </ViewBreakupButton>
            </HeaderRight>
          </Header>
          <AccordionContent>
            <FeeDetails>
              {intent.sources.map((source) => (
                <Card key={source.chainID}>
                  <FlexContainer>
                    <RelativeContainer>
                      <Logo src={intent.token.logo} alt="Token Logo" />
                      <ChainLogo src={source.chainLogo} alt="Chain Logo" />
                    </RelativeContainer>
                    <TokenDetails>
                      <TokenName>{source.chainName}</TokenName>
                    </TokenDetails>
                  </FlexContainer>
                  <AllowanceAmount>
                    {getReadableNumber(source.amount)} {intent.token.symbol}
                  </AllowanceAmount>
                </Card>
              ))}
            </FeeDetails>
          </AccordionContent>
        </AccordionWrapper>
        <AccordionWrapper key={"fees"} value="fees">
          <Header>
            <HeaderLeft>
              <TooltipMessage>Total Fees</TooltipMessage>
              <AppTooltip message="Total Fees">
                <InfoImg
                  src={IMAGE_LINKS["info"]}
                  alt="Info"
                  height={18}
                  width={18}
                />
              </AppTooltip>
            </HeaderLeft>
            <HeaderRight>
              <TotalFees>
                {getReadableNumber(intent.fees.total)} {intent?.token?.symbol}
              </TotalFees>
              {rates?.[intent?.token?.symbol] && (
                <TotalAtDestination>
                  ~
                  {(
                    Number(intent.fees.total) /
                    Number(rates[intent.token.symbol])
                  ).toFixed(2)}{" "}
                  USD
                </TotalAtDestination>
              )}
              <ViewBreakupButton>
                <span>View Breakup</span>
                <ItemIndicator>
                  <img
                    src={IMAGE_LINKS["caret"]}
                    alt="Arrow"
                    height={12}
                    width={12}
                  />
                </ItemIndicator>
              </ViewBreakupButton>
            </HeaderRight>
          </Header>
          <AccordionContent>
            <FeeDetails>
              <FeeRow>
                <HeaderLeft>
                  <Label>CA Gas Fees: </Label>
                  <AppTooltip message="Gas Fees">
                    <InfoImg
                      src={IMAGE_LINKS["info"]}
                      alt="Info"
                      height={14}
                      width={14}
                    />
                  </AppTooltip>
                </HeaderLeft>
                <HeaderRight>
                  <Value>
                    {getReadableNumber(intent.fees.caGas)}{" "}
                    {intent?.token?.symbol}
                  </Value>
                </HeaderRight>
              </FeeRow>
              <FeeRow>
                <HeaderLeft>
                  <Label>Solver Fees:</Label>
                  <AppTooltip message="Solver Fees">
                    <InfoImg
                      src={IMAGE_LINKS["info"]}
                      alt="Info"
                      height={14}
                      width={14}
                    />
                  </AppTooltip>
                </HeaderLeft>
                <HeaderRight>
                  <Value>
                    {getReadableNumber(intent.fees.solver)}{" "}
                    {intent?.token?.symbol}
                  </Value>
                </HeaderRight>
              </FeeRow>
              <FeeRow>
                <HeaderLeft>
                  <Label>Protocol Fees:</Label>
                  <AppTooltip message="Protocol Fees">
                    <InfoImg
                      src={IMAGE_LINKS["info"]}
                      alt="Info"
                      height={14}
                      width={14}
                    />
                  </AppTooltip>
                </HeaderLeft>
                <HeaderRight>
                  <Value>
                    {getReadableNumber(intent.fees.protocol)}{" "}
                    {intent?.token?.symbol}
                  </Value>
                </HeaderRight>
              </FeeRow>
              <FeeRow>
                <HeaderLeft>
                  <Label>Gas Supplied:</Label>
                  <AppTooltip message="Extra gas supplied">
                    <InfoImg
                      src={IMAGE_LINKS["info"]}
                      alt="Info"
                      height={14}
                      width={14}
                    />
                  </AppTooltip>
                </HeaderLeft>
                <HeaderRight>
                  <Value>
                    {" "}
                    {getReadableNumber(intent.fees.gasSupplied) +
                      " " +
                      intent?.token?.symbol}
                  </Value>
                </HeaderRight>
              </FeeRow>
            </FeeDetails>
          </AccordionContent>
        </AccordionWrapper>
      </Root>

      <Header>
        <HeaderLeft>
          <TooltipMessage>Total</TooltipMessage>
          <AppTooltip message="Total Spend + Fees">
            <InfoImg
              src={IMAGE_LINKS["info"]}
              alt="Info"
              height={18}
              width={18}
            />
          </AppTooltip>
        </HeaderLeft>
        <HeaderRight>
          <TotalFeesValue>
            {getReadableNumber(intent.sourcesTotal)} {intent?.token?.symbol}
          </TotalFeesValue>

          {rates?.[intent?.token?.symbol] && (
            <TotalAtDestinationValue>
              ~
              {(
                Number(intent?.sourcesTotal) /
                Number(rates[intent?.token?.symbol])
              ).toFixed(2)}{" "}
              USD
            </TotalAtDestinationValue>
          )}
        </HeaderRight>
      </Header>

      <ButtonWrap>
        <Button onClick={() => deny()} variant="secondary">
          Cancel
        </Button>
        <Button
          onClick={() => allow()}
          disabled={intentRefreshing}
          variant="primary"
        >
          {intentRefreshing ? "Refreshing" : "Confirm"}
        </Button>
      </ButtonWrap>
    </MainContainer>
  );
};

export default IntentView;
