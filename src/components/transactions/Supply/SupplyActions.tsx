import { gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { TransactionResponse } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits } from 'ethers/lib/utils';
import React, { useEffect, useState } from 'react';
import { SignedParams, useApprovalTx } from 'src/hooks/useApprovalTx';
import { usePoolApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useShallow } from 'zustand/shallow';
import Decimal from 'decimal.js';
import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from '../utils';
import { useUnifiedBalance, useCAFn } from 'src/components/ca-ui/src';

export interface SupplyActionProps extends BoxProps {
  amountToSupply: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  poolAddress: string;
  symbol: string;
  blocked: boolean;
  decimals: number;
  isWrappedBaseAsset: boolean;
}
let supplyVal = 0;
export const getSupplyVal = () => {
  return supplyVal;
}

export const SupplyActions = React.memo(
  ({
    amountToSupply,
    poolAddress,
    isWrongNetwork,
    sx,
    symbol,
    blocked,
    decimals,
    isWrappedBaseAsset,
    ...props
  }: SupplyActionProps) => {
    const [
      tryPermit,
      supply,
      supplyWithPermit,
      walletApprovalMethodPreference,
      estimateGasLimit,
      addTransaction,
      currentMarketData,
    ] = useRootStore(
      useShallow((state) => [
        state.tryPermit,
        state.supply,
        state.supplyWithPermit,
        state.walletApprovalMethodPreference,
        state.estimateGasLimit,
        state.addTransaction,
        state.currentMarketData,
      ])
    );
    const {
      approvalTxState,
      mainTxState,
      loadingTxns,
      setLoadingTxns,
      setApprovalTxState,
      setMainTxState,
      setGasLimit,
      setTxError,
    } = useModalContext();
    const permitAvailable = tryPermit({ reserveAddress: poolAddress, isWrappedBaseAsset });
    const { sendTx } = useWeb3Context();
    const queryClient = useQueryClient();
    const caBalances = useUnifiedBalance().balances;

    const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();
    supplyVal = Number(amountToSupply);


    const { bridge } = useCAFn()
    const {
      data: approvedAmount,
      refetch: fetchApprovedAmount,
      isRefetching: fetchingApprovedAmount,
      isFetchedAfterMount,
    } = usePoolApprovedAmount(currentMarketData, poolAddress);

    setLoadingTxns(fetchingApprovedAmount);

    const requiresApproval =
      Number(amountToSupply) !== 0 &&
      checkRequiresApproval({
        approvedAmount: approvedAmount?.amount || '0',
        amount: amountToSupply,
        signedAmount: signatureParams ? signatureParams.amount : '0',
      });

    if (requiresApproval && approvalTxState?.success) {
      // There was a successful approval tx, but the approval amount is not enough.
      // Clear the state to prompt for another approval.
      setApprovalTxState({});
    }

    const usePermit = permitAvailable && walletApprovalMethodPreference === ApprovalMethod.PERMIT;

    const { approval } = useApprovalTx({
      usePermit,
      approvedAmount,
      requiresApproval,
      assetAddress: poolAddress,
      symbol,
      decimals,
      signatureAmount: amountToSupply,
      onApprovalTxConfirmed: fetchApprovedAmount,
      onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
    });

    useEffect(() => {
      if (!isFetchedAfterMount) {
        fetchApprovedAmount();
      }
    }, [fetchApprovedAmount, isFetchedAfterMount]);

    // Update gas estimation
    useEffect(() => {
      let supplyGasLimit = 0;
      if (usePermit) {
        supplyGasLimit = Number(
          gasLimitRecommendations[ProtocolAction.supplyWithPermit].recommended
        );
      } else {
        supplyGasLimit = Number(gasLimitRecommendations[ProtocolAction.supply].recommended);
        if (requiresApproval && !approvalTxState.success) {
          supplyGasLimit += Number(APPROVAL_GAS_LIMIT);
        }
      }
      setGasLimit(supplyGasLimit.toString());
    }, [requiresApproval, approvalTxState, usePermit, setGasLimit]);

    const action = async () => {
      try {
        setMainTxState({ ...mainTxState, loading: true });
        let response: TransactionResponse;
        let action = ProtocolAction.default;
        if(symbol == 'USD₮0'){
          symbol = "USDT"
        }
        if(
          Number(caBalances?.find((balance) => balance.symbol === (symbol == "WETH"? "ETH": symbol))?.
          breakdown.find((breakdown) => breakdown.chain.id === currentMarketData.chainId)?.balance)
          < Number(amountToSupply)
        ){
          console.log("wallet Balance: ", caBalances?.find((balance) => balance.symbol === (symbol == "WETH"? "ETH": symbol))?.breakdown.find((breakdown) => breakdown.chain.id === currentMarketData.chainId)?.balance)
          console.log("amount to supply: ", amountToSupply)
          const decimalAmount = new Decimal(amountToSupply).sub(caBalances?.find((balance) => balance.symbol === (symbol == "WETH"? "ETH": symbol))?.breakdown.find((breakdown) => breakdown.chain.id === currentMarketData.chainId)?.balance!).add(symbol != "WETH" ? '0': '0.000001').toString();
          if(symbol == "WETH" || symbol == "weth"){symbol = "ETH"}
          await bridge(
            {
              amount: decimalAmount,
              token: ['USDC', 'USDT', 'ETH', 'usdc', 'usdt', 'eth'].find((token) => token === symbol) as 'USDC' | 'USDT' | 'ETH' | 'usdc' | 'usdt' | 'eth',
              chain: currentMarketData.chainId,
            }
          )
        }
        // determine if approval is signature or transaction
        // checking user preference is not sufficient because permit may be available but the user has an existing approval
        if (usePermit && signatureParams) {
          action = ProtocolAction.supplyWithPermit;
          let signedSupplyWithPermitTxData = supplyWithPermit({
            signature: signatureParams.signature,
            amount: parseUnits(amountToSupply, decimals).toString(),
            reserve: poolAddress,
            deadline: signatureParams.deadline,
          });

          signedSupplyWithPermitTxData = await estimateGasLimit(signedSupplyWithPermitTxData);
          response = await sendTx(signedSupplyWithPermitTxData);
          await response.wait(1);
        } else {
          action = ProtocolAction.supply;
          let supplyTxData = supply({
            amount: parseUnits(amountToSupply, decimals).toString(),
            reserve: poolAddress,
          });
          supplyTxData = await estimateGasLimit(supplyTxData);
          response = await sendTx(supplyTxData);

          await response.wait(1);
        }

        setMainTxState({
          txHash: response.hash,
          loading: false,
          success: true,
        });

        addTransaction(response.hash, {
          action,
          txState: 'success',
          asset: poolAddress,
          amount: amountToSupply,
          assetName: symbol,
        });

        queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
      }
    };

    return (
      <TxActionsWrapper
        blocked={blocked}
        mainTxState={mainTxState}
        approvalTxState={approvalTxState}
        isWrongNetwork={isWrongNetwork}
        requiresAmount
        amount={amountToSupply}
        symbol={symbol}
        preparingTransactions={loadingTxns || !approvedAmount}
        actionText={<Trans>Supply {symbol}</Trans>}
        actionInProgressText={<Trans>Supplying {symbol}</Trans>}
        handleApproval={approval}
        handleAction={action}
        requiresApproval={requiresApproval}
        tryPermit={permitAvailable}
        sx={sx}
        {...props}
      />
    );
  }
);


