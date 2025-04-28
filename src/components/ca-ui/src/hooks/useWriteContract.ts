import {
  Config,
  ResolvedRegister,
  useWriteContract as internalUseWriteContract,
  UseWriteContractParameters,
  UseWriteContractReturnType,
} from "wagmi";
import { encodeFunctionData } from "viem";
import { useCA } from "./useCA";
import { useContext } from "react";
import { CAErrorContext } from "../context";

function useWriteContract<
  config extends Config = ResolvedRegister["config"],
  context = unknown
>(
  parameters: UseWriteContractParameters<config, context> = {}
): UseWriteContractReturnType<config, context> {
  const wcr = internalUseWriteContract(parameters);
  const { ca, ready } = useCA();
  const { setError } = useContext(CAErrorContext);

  const originalWriteContract = wcr.writeContract;
  const originalWriteContractAsync = wcr.writeContractAsync;

  const writeContractAsync: typeof originalWriteContractAsync = async (
    variables,
    options?
  ): Promise<`0x${string}`> => {
    if (ca && ready) {
      const data = encodeFunctionData(
        variables as Parameters<typeof originalWriteContractAsync>[0]
      );
      try {
        await ca.preprocess({
          to: variables.address,
          data: data,
          value:
            typeof variables.value === "bigint"
              ? `0x${variables.value.toString(16)}`
              : undefined,
        });
        return await originalWriteContractAsync(variables, options);
      } catch (e: any) {
        setError(e.message);
        if (options?.onError) {
          options.onError(
            e,
            variables as Parameters<typeof options.onError>[1],
            wcr.context
          );
        }
        throw e;
      }
    } else {
      return await originalWriteContractAsync(variables, options);
    }
  };

  const writeContract: typeof originalWriteContract = (variables, options?) => {
    if (ca && ready) {
      const data = encodeFunctionData(
        variables as Parameters<typeof originalWriteContract>[0]
      );

      ca.preprocess({
        to: variables.address,
        data: data,
        value:
          typeof variables.value === "bigint"
            ? `0x${variables.value.toString(16)}`
            : undefined,
      })
        .then(() => {
          return originalWriteContract(variables, options);
        })
        .catch((e) => {
          setError(e.message);
          if (options?.onError) {
            options.onError(
              e,
              variables as Parameters<typeof options.onError>[1],
              wcr.context
            );
          }
        });
      return;
    } else {
      return originalWriteContract(variables, options);
    }
  };

  wcr.writeContract = writeContract;
  wcr.writeContractAsync = writeContractAsync;
  return wcr;
}

export { useWriteContract };
