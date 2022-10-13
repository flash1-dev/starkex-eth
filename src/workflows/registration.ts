import {
  UsersApi,
  GetSignableRegistrationResponse,
  RegisterUserResponse,
} from '../api';
import { WalletConnection } from '../types';
import { signRaw } from '../utils';
import { Core } from '../contracts';

type registerOffchainWorkflowParams = WalletConnection & {
  usersApi: UsersApi;
};

export async function registerOffchainWorkflow({
  ethSigner,
  starkSigner,
  usersApi,
}: registerOffchainWorkflowParams): Promise<RegisterUserResponse> {
  const userAddress = await ethSigner.getAddress();
  const starkPublicKey = await starkSigner.getAddress();

  const signableResult = await usersApi.getSignableRegistrationOffchain({
    getSignableRegistrationRequest: {
      ether_key: userAddress,
      stark_key: starkPublicKey,
    },
  });

  const { signable_message: signableMessage, payload_hash: payloadHash } =
    signableResult.data;

  const ethSignature = await signRaw(signableMessage, ethSigner);

  const starkSignature = await starkSigner.signMessage(payloadHash);

  const registeredUser = await usersApi.registerUser({
    registerUserRequest: {
      eth_signature: ethSignature,
      ether_key: userAddress,
      stark_signature: starkSignature,
      stark_key: starkPublicKey,
    },
  });

  return registeredUser.data;
}

interface IsRegisteredCheckError {
  reason: string;
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
