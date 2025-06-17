import {
  Config,
  ResolvedRegister,
  UseSendTransactionParameters,
  UseSendTransactionReturnType,
  useSendTransaction as internalUseSendTransaction,
} from "wagmi";
import { useCA } from "./useCA";
import { useContext } from "react";
import { CAErrorContext } from "../context";
import { BaseError, SendTransactionErrorType } from "viem";

function useSendTransaction<
  config extends Config = ResolvedRegister["config"],
  context = unknown
>(
  parameters: UseSendTransactionParameters<config, context> = {}
): UseSendTransactionReturnType<config, context> {
  const r = internalUseSendTransaction(parameters);
  const { ca, ready } = useCA();
  const { setError } = useContext(CAErrorContext);

  const originalSendTx = r.sendTransaction;
  const originalSendTxAsync = r.sendTransactionAsync;

  const sendTransactionAsync = async (
    variables: Parameters<UseSendTransactionReturnType["sendTransaction"]>[0],
    options?: Parameters<typeof r.sendTransaction>[1]
  ): Promise<`0x${string}`> => {
    if (ca && ready) {
      try {
        await ca.handleEVMTx(
          {
            method: "eth_sendTransaction",
            params: [
              {
                to: variables.to ? variables.to : undefined,
                data: variables.data ? variables.data : undefined,
                value: variables.value
                  ? `0x${variables.value.toString(16)}`
                  : undefined,
              },
            ],
          },
          {
            skipTx: true,
            bridge: false,
            gas: BigInt(0),
          }
        );
        return await originalSendTxAsync(
          variables as Parameters<typeof r.sendTransaction>[0],
          options
        );
      } catch (e) {
        if (e instanceof BaseError) {
          setError(e.shortMessage);
        } else if (e instanceof Error) {
          setError(e.message);
        }
        if (options?.onError) {
          options.onError(
            e as SendTransactionErrorType,
            r.variables as Parameters<typeof r.sendTransaction>[0],
            r.context
          );
        }
        throw e;
      }
    } else {
      return await originalSendTxAsync(
        variables as Parameters<typeof r.sendTransaction>[0],
        options
      );
    }
  };

  const sendTransaction = (
    variables: Parameters<UseSendTransactionReturnType["sendTransaction"]>[0],
    options?: Parameters<typeof r.sendTransaction>[1]
  ) => {
    if (ca && ready) {
      ca.handleEVMTx(
        {
          method: "eth_sendTransaction",
          params: [
            {
              to: variables.to ? variables.to : undefined,
              data: variables.data ? variables.data : undefined,
              value: variables.value
                ? `0x${variables.value.toString(16)}`
                : undefined,
            },
          ],
        },
        {
          skipTx: true,
          bridge: false,
          gas: BigInt(0),
        }
      )
        .then(() => {
          return originalSendTx(
            variables as Parameters<typeof r.sendTransaction>[0],
            options
          );
        })
        .catch((e) => {
          if (e instanceof BaseError) {
            setError(e.shortMessage);
          } else if (e instanceof Error) {
            setError(e.message);
          }
          if (options?.onError) {
            options.onError(
              e,
              r.variables as Parameters<typeof r.sendTransaction>[0],
              r.context
            );
          }
        });
      return;
    } else {
      return originalSendTx(
        variables as Parameters<typeof r.sendTransaction>[0],
        options
      );
    }
  };
  r.sendTransaction = sendTransaction;
  r.sendTransactionAsync = sendTransactionAsync;
  return r;
}

export { useSendTransaction };
