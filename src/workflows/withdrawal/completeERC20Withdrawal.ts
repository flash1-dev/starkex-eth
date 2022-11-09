import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import { Flash1Configuration } from '../../config';
import { Core, Core__factory } from '../../contracts';

async function executeWithdrawERC20(
  signer: Signer,
  assetType: string,
  starkOrEthPublicKey: string,
  contract: Core,
): Promise<TransactionResponse> {
  const populatedTransaction = await contract.populateTransaction.withdraw(
    starkOrEthPublicKey,
    assetType,
  );

  return signer.sendTransaction(populatedTransaction);
}

export async function completeERC20WithdrawalWorkflow(
  signer: Signer,
  starkOrEthPublicKey: string,
  config: Flash1Configuration,
) {
  const coreContract = Core__factory.connect(
    config.ethConfiguration.coreContractAddress,
    signer,
  );

  return executeWithdrawERC20(
    signer,
    config.ethConfiguration.collateralAssetID,
    starkOrEthPublicKey,
    coreContract,
  );
}
