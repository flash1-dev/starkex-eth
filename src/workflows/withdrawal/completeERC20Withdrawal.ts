import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import { EncodingApi, UsersApi } from '../../api';
import { Flash1Configuration } from '../../config';
import { Core, Core__factory } from '../../contracts';
import { ERC20Token } from '../../types';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';

// async function executeRegisterAndWithdrawERC20(
//   signer: Signer,
//   assetType: string,
//   starkPublicKey: string,
//   contract: Core,
//   usersApi: UsersApi,
// ): Promise<TransactionResponse> {
//   const etherKey = await signer.getAddress();

//   const signableResult = await getSignableRegistrationOnchain(
//     etherKey,
//     starkPublicKey,
//     usersApi,
//   );

//   const populatedTransaction =
//     await contract.populateTransaction.registerAndWithdraw(
//       etherKey,
//       starkPublicKey,
//       signableResult.operator_signature,
//       assetType,
//     );

//   return signer.sendTransaction(populatedTransaction);
// }

async function executeWithdrawERC20(
  signer: Signer,
  assetType: string,
  starkPublicKey: string,
  contract: Core,
): Promise<TransactionResponse> {
  const populatedTransaction = await contract.populateTransaction.withdraw(
    starkPublicKey,
    assetType,
  );

  return signer.sendTransaction(populatedTransaction);
}

export async function completeERC20WithdrawalWorkflow(
  signer: Signer,
  starkPublicKey: string,
  token: ERC20Token,
  encodingApi: EncodingApi,
  usersApi: UsersApi,
  config: Flash1Configuration,
) {
  const assetType = await getEncodeAssetInfo('asset', 'ERC20', encodingApi, {
    token_address: token.tokenAddress,
  });

  const coreContract = Core__factory.connect(
    config.ethConfiguration.coreContractAddress,
    signer,
  );

  // TODO: fix
  //
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
    // return executeRegisterAndWithdrawERC20(
    //   signer,
    //   assetType.asset_type,
    //   starkPublicKey,
    //   registrationContract,
    //   usersApi,
    // );
  } else {
    return executeWithdrawERC20(
      signer,
      assetType.asset_type,
      starkPublicKey,
      coreContract,
    );
  }
}
