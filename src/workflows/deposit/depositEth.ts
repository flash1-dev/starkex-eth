import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import { DepositsApi, EncodingApi, UsersApi } from '../../api';
import { parseUnits } from '@ethersproject/units';
import { Core, Core__factory } from '../../contracts';
import { getSignableRegistrationOnchain } from '../registration';
import { ETHAmount, ETHToken } from '../../types';
import { BigNumber } from '@ethersproject/bignumber';
import { Flash1Configuration } from '../../config';

interface ETHTokenData {
  decimals: number;
}

async function executeRegisterAndDepositEth(
  signer: Signer,
  amount: BigNumber,
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
    await contract.populateTransaction.registerAndDepositEth(
      etherKey,
      starkPublicKey,
      signableResult.operator_signature,
      assetType,
      vaultId,
    );

  return signer.sendTransaction({ ...populatedTransaction, value: amount });
}

async function executeDepositEth(
  signer: Signer,
  amount: BigNumber,
  assetType: string,
  starkPublicKey: string,
  vaultId: number,
  contract: Core,
): Promise<TransactionResponse> {
  const populatedTransaction = await contract.populateTransaction[
    'deposit(uint256,uint256,uint256)'
  ](starkPublicKey, assetType, vaultId);

  return signer.sendTransaction({ ...populatedTransaction, value: amount });
}

export async function depositEthWorkflow(
  signer: Signer,
  amount: string,
  token: ETHToken,
  depositsApi: DepositsApi,
  usersApi: UsersApi,
  encodingApi: EncodingApi,
  config: Flash1Configuration,
): Promise<TransactionResponse> {
  const user = await signer.getAddress();
  const data: ETHTokenData = {
    decimals: 18,
  };
  const weiAmount = parseUnits(amount, 'wei');

  const getSignableDepositRequest = {
    user,
    token: {
      type: token.type,
      data,
    },
    amount: amount.toString(),
  };

  const signableDepositResult = await depositsApi.getSignableDeposit({
    getSignableDepositRequest,
  });

  const encodingResult = await encodingApi.encodeAsset({
    assetType: 'asset',
    encodeAssetRequest: {
      token: {
        type: token.type,
      },
    },
  });

  const assetType = encodingResult.data.asset_type;
  const starkPublicKey = signableDepositResult.data.stark_key;
  const vaultId = signableDepositResult.data.vault_id;

  const coreContract = Core__factory.connect(
    config.ethConfiguration.coreContractAddress,
    signer,
  );

  // TODO: fix
  // const registrationContract = Registration__factory.connect(
  //   config.ethConfiguration.registrationContractAddress,
  //   signer,
  // );

  // const isRegistered = await isRegisteredOnChainWorkflow(
  //   starkPublicKey,
  //   registrationContract,
  // );

  const isRegistered = true;

  if (!isRegistered) {
    return executeRegisterAndDepositEth(
      signer,
      weiAmount,
      assetType,
      starkPublicKey,
      vaultId,
      coreContract,
      usersApi,
    );
  } else {
    return executeDepositEth(
      signer,
      weiAmount,
      assetType,
      starkPublicKey,
      vaultId,
      coreContract,
    );
  }
}
