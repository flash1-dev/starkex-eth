import {
  Configuration as APIConfiguration,
  ConfigurationParameters,
} from '../api';
import { version } from '../../package.json';
import { CollateralTokens } from '../types';

const defaultHeaders = { 'x-sdk-version': `imx-core-sdk-ts-${version}` };

/**
 * The configuration for the Ethereum network
 */
export interface EthConfiguration {
  coreContractAddress: string;
  chainID: number;
}

/**
 * The environment configuration for the Flash1 client
 */
export interface Flash1Configuration {
  /**
   * The configuration for the API client
   */
  apiConfiguration: APIConfiguration;
  /**
   * The configuration for the Ethereum network
   */
  ethConfiguration: EthConfiguration;
}

/**
 * The environment configuration for the Flash1 client
 */
export interface UserConfiguration {
  /**
   * The user's starkex keypair
   */
  starkex: {
    publicKey: string;
    privateKey: string;
  };
  /**
   * The user's ethereum keypair
   */
  ethereum: {
    publicKey: string;
    privateKey: string;
  };
}

interface Environment extends EthConfiguration {
  basePath: string;
  headers?: Record<string, string>;
}

const createConfig = ({
  coreContractAddress,
  chainID,
  basePath,
  headers,
}: Environment): Flash1Configuration => {
  if (!basePath.trim()) {
    throw Error('basePath can not be empty');
  }

  headers = { ...(headers || {}), ...defaultHeaders };
  const apiConfigOptions: ConfigurationParameters = {
    basePath,
    baseOptions: { headers },
  };

  return {
    apiConfiguration: new APIConfiguration(apiConfigOptions),
    ethConfiguration: {
      coreContractAddress,
      chainID,
    },
  };
};

/**
 * Creates a Configuration for the specified environment
 * @returns an Flash1Configuration
 */
export const Config = {
  get MAINNET() {
    return createConfig({
      basePath: 'https://flash1.com',
      chainID: 1,
      coreContractAddress: '0x0',
    });
  },

  get GOERLI() {
    return createConfig({
      basePath: 'https://test.flash1.com',
      chainID: 5,
      coreContractAddress: '0x2785680c010510c4ef5be451c69c9d6ee748b3de',
    });
  },

  createConfig: createConfig,
};
