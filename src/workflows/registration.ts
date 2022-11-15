import { Signer } from '@ethersproject/abstract-signer';
import { TransactionResponse } from '@ethersproject/providers';
import { UsersApi, GetSignableRegistrationResponse } from '../api';
import { Core__factory } from '../contracts';
import { RegisterUserRequest } from '../types';
import { Flash1Configuration } from '../config';

import { Core } from '../contracts';

interface IsRegisteredCheckError {
  reason: string;
}

export async function registerOnchainWorkflow(
  signer: Signer,
  request: RegisterUserRequest,
  config: Flash1Configuration,
): Promise<TransactionResponse> {
  const contract = Core__factory.connect(
    config.ethConfiguration.coreContractAddress,
    signer,
  );

  const populatedTransaction =
    await contract.populateTransaction.registerEthAddress(
      request.ethKey,
      request.starkKey,
      request.signature,
    );

  return signer.sendTransaction(populatedTransaction);
}

export async function isRegisteredOnChainWorkflow(
  starkPublicKey: string,
  contract: Core,
): Promise<boolean> {
  try {
    // TODO: verify this works
    const registeredEthAddress = await contract.getEthKey(starkPublicKey);
    if (
      registeredEthAddress != '0x0' ||
      registeredEthAddress != starkPublicKey
    ) {
      return false;
    }
    return true;
  } catch (ex) {
    if ((ex as IsRegisteredCheckError).reason === 'USER_UNREGISTERED') {
      return false;
    }
    throw ex;
  }
}

export async function getSignableRegistrationOnchain(
  etherKey: string,
  starkPublicKey: string,
  usersApi: UsersApi,
): Promise<GetSignableRegistrationResponse> {
  const response = await usersApi.getSignableRegistration({
    getSignableRegistrationRequest: {
      ether_key: etherKey,
      stark_key: starkPublicKey,
    },
  });
  return {
    operator_signature: response.data.operator_signature,
    payload_hash: response.data.payload_hash,
  };
}
