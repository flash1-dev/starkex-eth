/**
 * An ERC20 token
 */
export interface ERC20Token {
  type: 'ERC20';
  tokenAddress: string;
}

/**
 * An ETH token
 */
export interface ETHToken {
  type: 'ETH';
}

/**
 * An amount of ETH token of unit Wei
 */
export interface ETHAmount extends ETHToken {
  /**
   * An amount in unit Wei
   */
  amount: string;
}

/**
 * The token details and amount of ERC20 token units
 */
export interface ERC20Amount extends ERC20Token {
  /**
   * An amount in units for the given ERC20 token
   */
  amount: string;
}

/**
 * The token details and amount of ERC20 token units
 */
export interface ERC20Collateral extends ERC20Token {
  /**
   * Starkex assetId
   */
  assetId: string;
  /**
   * Number of quantization digits
   */
  quantization: number;
}

/**
 * Union type that represents all token types
 */
export type AnyToken = ETHToken | ERC20Token;

/**
 * Union type that represents all token type amounts
 */
export type TokenAmount = ETHAmount | ERC20Amount;

/**
 * Naming system for flash1's collateral tokens
 */
export enum COLLATERAL_TOKEN_TYPES {
  SELF_MINT_TESTNET = 'SELF_MINT_TESTNET',
  USDT_MAINNET = 'USDT_MAINNET',
}

/**
 * Map between token identifier and collateral token details
 */
export type CollateralTokens = Record<COLLATERAL_TOKEN_TYPES, ERC20Collateral>;
