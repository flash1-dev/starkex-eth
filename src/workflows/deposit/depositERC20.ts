import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import { UsersApi } from '../../api';
import { parseUnits } from '@ethersproject/units';
import {
  Core,
  Core__factory,
  IERC20__factory,
  SelfSufficient__factory,
} from '../../contracts';
import { getSignableRegistrationOnchain } from '../registration';
import { ERC20Collateral } from '../../types';
import { BigNumber } from '@ethersproject/bignumber';
import { Flash1Configuration } from '../../config';
import { getDefaultVaultId } from '../../utils';
import { COLLATERAL_TOKENS } from '../../constants';

async function executeDepositERC20(
  signer: Signer,
  quantizedAmount: BigNumber,
  assetType: string,
  starkPublicKey: string,
  vaultId: string,
  contract: Core,
): Promise<TransactionResponse> {
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
  amount: string,
  token: ERC20Collateral,
  starkKey: string,
  config: Flash1Configuration,
): Promise<TransactionResponse> {
  const parsedAmount = parseUnits(amount, 0);

  // Approve whether an amount of token from an account can be spent by a third-party account
  const tokenContract = IERC20__factory.connect(token.tokenAddress, signer);
  const approveTransaction = await tokenContract.populateTransaction.approve(
    config.ethConfiguration.coreContractAddress,
    amount,
  );

  const approval = await signer.sendTransaction(approveTransaction);
  await approval.wait(1);

  const assetType = token.assetId;
  const starkPublicKey = starkKey;
  const vaultId = getDefaultVaultId(starkKey);
  const parsedAmountBig = BigNumber.from(parsedAmount);

  const coreContract = Core__factory.connect(
    config.ethConfiguration.coreContractAddress,
    signer,
  );

  return executeDepositERC20(
    signer,
    parsedAmountBig,
    assetType,
    starkPublicKey,
    vaultId,
    coreContract,
  );
}

export async function selfMintWorkflow(
  signer: Signer,
  amount: string,
): Promise<TransactionResponse> {
  const parsedAmount = parseUnits(amount, 0);

  // Approve whether an amount of token from an account can be spent by a third-party account
  const tokenContract = SelfSufficient__factory.connect(
    COLLATERAL_TOKENS.SELF_MINT_TESTNET.tokenAddress,
    signer,
  );
  const selfMintTransaction = await tokenContract.populateTransaction.selfMint(
    parsedAmount,
  );
  return signer.sendTransaction(selfMintTransaction);
}
