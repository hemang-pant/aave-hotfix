import React from "react";
import styled from "styled-components";
import { IMAGE_LINKS } from "../../utils/assetList";

const Icon = styled.svg`
  cursor: pointer;
`;

const CopySVG = ({ address }: { address: string }) => {
  const [copying, setCopying] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopying(true);
      window.setTimeout(() => {
        setCopying(false);
      }, 3000);
    } catch (e) {
      console.log("copy failed with error: ", e);
    }
  };
  return (
    <>
      {copying ? (
        <img
          src={IMAGE_LINKS["success"]}
          alt="Success"
          width={10}
          height={10}
        />
      ) : (
        <Icon
          onClick={copy}
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.33331 3.3335V2.16683C3.33331 1.70012 3.33331 1.46676 3.42414 1.2885C3.50404 1.1317 3.63152 1.00422 3.78832 0.924324C3.96658 0.833496 4.19994 0.833496 4.66665 0.833496H7.83331C8.30002 0.833496 8.53338 0.833496 8.71164 0.924324C8.86844 1.00422 8.99592 1.1317 9.07582 1.2885C9.16665 1.46676 9.16665 1.70012 9.16665 2.16683V5.3335C9.16665 5.80021 9.16665 6.03356 9.07582 6.21182C8.99592 6.36862 8.86844 6.49611 8.71164 6.576C8.53338 6.66683 8.30002 6.66683 7.83331 6.66683H6.66665M2.16665 9.16683H5.33331C5.80002 9.16683 6.03338 9.16683 6.21164 9.076C6.36844 8.99611 6.49592 8.86862 6.57582 8.71182C6.66665 8.53356 6.66665 8.30021 6.66665 7.8335V4.66683C6.66665 4.20012 6.66665 3.96676 6.57582 3.7885C6.49592 3.6317 6.36844 3.50422 6.21164 3.42432C6.03338 3.3335 5.80002 3.3335 5.33331 3.3335H2.16665C1.69994 3.3335 1.46658 3.3335 1.28832 3.42432C1.13152 3.50422 1.00404 3.6317 0.924141 3.7885C0.833313 3.96676 0.833313 4.20012 0.833313 4.66683V7.8335C0.833313 8.30021 0.833313 8.53356 0.924141 8.71182C1.00404 8.86862 1.13152 8.99611 1.28832 9.076C1.46658 9.16683 1.69994 9.16683 2.16665 9.16683Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Icon>
      )}
    </>
  );
};

export default CopySVG;
