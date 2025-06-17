import { useContext } from "react";
import { CAContext, CAErrorContext } from "../context";
import { ALLOWED_TOKENS } from "../utils/constants";

export const useCA = () => {
  const ca = useContext(CAContext);
  return ca;
};

export const useCAFn = () => {
  const { ca, ready } = useContext(CAContext);
  const { setError } = useContext(CAErrorContext);

  const transfer = async (params: {
    to: `0x${string}`;
    amount: string;
    token: ALLOWED_TOKENS;
    chain: number;
  }) => {
    if (!ready || !ca) {
      throw new Error("ca not ready");
    }
    try {
      let fn = await ca.transfer({
        to: params.to,
        amount: params.amount,
        chainID: params.chain,
        token: params.token,
      });
      return await fn.exec();
    } catch (e) {
      if (e instanceof Error && "message" in e) {
        setError(e.message);
      }
      throw e;
    }
  };

  const bridge = async (params: {
    amount: string;
    token: ALLOWED_TOKENS;
    chain: number;
    gas?: bigint;
  }) => {
    if (!ready || !ca) {
      throw new Error("ca not ready");
    }

    try {
      let fn = await ca.bridge({
        token: params.token,
        amount: params.amount,
        chainID: params.chain,
        gas: params.gas,
      });
      return fn.exec();
    } catch (e) {
      if (e instanceof Error && "message" in e) {
        setError(e.message);
      }
      throw e;
    }
  };

  return { bridge, transfer, ready };
};
