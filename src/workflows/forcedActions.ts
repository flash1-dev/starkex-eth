import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import { Core__factory } from '../contracts';
import { ForcedTradeRequest, ForcedWithdrawalRequest } from '../types';
import { Flash1Configuration } from '../config';

export async function forcedTrade(
  signer: Signer,
  request: ForcedTradeRequest,
  config: Flash1Configuration,
): Promise<TransactionResponse> {
  const contract = Core__factory.connect(
    config.ethConfiguration.coreContractAddress,
    signer,
  );

  const populatedTransaction =
    await contract.populateTransaction.forcedTradeRequest(
      request.starkKeyA,
      request.starkKeyB,
      request.vaultIdA,
      request.vaultIdB,
      request.collateralAssetId,
      request.syntheticAssetId,
      request.amountCollateral,
      request.amountSynthetic,
      request.aIsBuyingSynthetic,
      request.submissionExpirationTime,
      request.nonce,
      request.signature,
      request.premiumCost,
    );

  return signer.sendTransaction(populatedTransaction);
}

export async function forcedWithdrawal(
  signer: Signer,
  request: ForcedWithdrawalRequest,
  config: Flash1Configuration,
): Promise<TransactionResponse> {
  const contract = Core__factory.connect(
    config.ethConfiguration.coreContractAddress,
    signer,
  );

  const populatedTransaction =
    await contract.populateTransaction.forcedWithdrawalRequest(
      request.starkKey,
      request.vaultId,
      request.quantizedAmount,
      request.premiumCost,
    );

  return signer.sendTransaction(populatedTransaction);
}
