import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import { EncodingApi, UsersApi } from '../../api';
import { Flash1Configuration } from '../../config';
import { Core, Core__factory } from '../../contracts';
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChainWorkflow,
} from '../registration';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';

// async function executeRegisterAndWithdrawEth(
//   signer: Signer,
//   assetType: string,
//   starkPublicKey: string,
//   contract: Registration,
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

async function executeWithdrawEth(
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

export async function completeEthWithdrawalWorkflow(
  signer: Signer,
  starkPublicKey: string,
  encodingApi: EncodingApi,
  usersApi: UsersApi,
  config: Flash1Configuration,
) {
  const assetType = await getEncodeAssetInfo('asset', 'ETH', encodingApi);

  const coreContract = Core__factory.connect(
    config.ethConfiguration.coreContractAddress,
    signer,
  );

  // TOOD: figure out what to do here
  //
  // const isRegistered = await isRegisteredOnChainWorkflow(
  //   starkPublicKey,
  //   coreContract,
  // );
  const isRegistered = true;

  if (!isRegistered) {
    // return executeRegisterAndWithdrawEth(
    //   signer,
    //   assetType.asset_type,
    //   starkPublicKey,
    //   registrationContract,
    //   usersApi,
    // );
  } else {
    return executeWithdrawEth(
      signer,
      assetType.asset_type,
      starkPublicKey,
      coreContract,
    );
  }
}
