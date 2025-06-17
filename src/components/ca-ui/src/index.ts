import { CAProvider } from "./caProvider";
import { useSendTransaction } from "./hooks/useSendTransaction";
import {
  useBalance,
  useBalances,
  useBalanceModal,
  useUnifiedBalance,
} from "./hooks/useUnifiedBalance";
import { useWriteContract } from "./hooks/useWriteContract";
import { useCAFn } from "./hooks/useCA";
import { CAUnifiedBalanceContext } from "./context";
import type { UseBalanceReturnValue } from "./hooks/useUnifiedBalance";
import { Network, CA, type RFF } from "@arcana/ca-sdk";
import { useGetMyIntents } from "./hooks/useGetMyIntents";

const getSupportedChains = CA.getSupportedChains;

export {
  RFF,
  Network,
  useSendTransaction,
  useWriteContract,
  useBalance,
  useGetMyIntents,
  useBalances,
  useBalanceModal,
  useCAFn,
  useUnifiedBalance,
  CAProvider,
  CAUnifiedBalanceContext,
  getSupportedChains,
};

export type { UseBalanceReturnValue as UseBalanceValue };
