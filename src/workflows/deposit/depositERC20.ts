import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import { DepositsApi, EncodingApi, UsersApi } from '../../api';
import { parseUnits } from '@ethersproject/units';
import { Core, Core__factory, IERC20__factory } from '../../contracts';
import { getSignableRegistrationOnchain } from '../registration';
import { ERC20Amount } from '../../types';
import { BigNumber } from '@ethersproject/bignumber';
import { Flash1Configuration } from '../../config';
import { getDefaultVaultId } from '../../utils';

async function executeDepositERC20(
  signer: Signer,
  quantizedAmount: BigNumber,
  assetType: string,
  starkPublicKey: string,
  vaultId: string,
  contract: Core,
): Promise<TransactionResponse> {
  console.log({ quantizedAmount, assetType, starkPublicKey, vaultId });
  const populatedTransaction = await contract.populateTransaction.depositERC20(
    starkPublicKey,
    assetType,
    vaultId,
    quantizedAmount,
  );

  return signer.sendTransaction(populatedTransaction);
}

async function executeRegisterAndDepositERC20(
  signer: Signer,
  quantizedAmount: BigNumber,
  assetType: string,
  starkPublicKey: string,
  vaultId: number,
  contract: Core,
  usersApi: UsersApi,
): Promise<TransactionResponse> {
  const etherKey = await signer.getAddress();

  const signableResult = await getSignableRegistrationOnchain(
    etherKey,
    starkPublicKey,
    usersApi,
  );

  const populatedTransaction =
    await contract.populateTransaction.registerAndDepositERC20(
      etherKey,
      starkPublicKey,
      signableResult.operator_signature,
      assetType,
      vaultId,
      quantizedAmount,
    );

  return signer.sendTransaction(populatedTransaction);
}

export async function depositERC20Workflow(
  signer: Signer,
  deposit: ERC20Amount,
  starkKey: string,
  config: Flash1Configuration,
): Promise<TransactionResponse> {
  const amount = parseUnits(deposit.amount, 6); // 0 to always use undecimalized value

  // Approve whether an amount of token from an account can be spent by a third-party account
  const tokenContract = IERC20__factory.connect(deposit.tokenAddress, signer);
  const approveTransaction = await tokenContract.populateTransaction.approve(
    config.ethConfiguration.coreContractAddress,
    amount,
  );
  await signer.sendTransaction(approveTransaction);

  const assetType = config.ethConfiguration.collateralAssetID;
  const starkPublicKey = starkKey;
  const vaultId = getDefaultVaultId(starkKey);
  const quantizedAmount = BigNumber.from(amount);

  const coreContract = Core__factory.connect(
    config.ethConfiguration.coreContractAddress,
    signer,
  );

  return executeDepositERC20(
    signer,
    quantizedAmount,
    assetType,
    starkPublicKey,
    vaultId,
    coreContract,
  );
}
