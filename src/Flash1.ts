import {
  AnyToken,
  EthSigner,
  TokenAmount,
  ERC20Collateral,
  UnsignedOrderRequest,
  WalletConnection,
} from './types';
import { Workflows } from './workflows';
import { GetSignableCancelOrderRequest, GetSignableTradeRequest } from './api';
import { Flash1Configuration, UserConfiguration } from './config';

/**
 * The main entry point for the Core SDK
 */
export class Flash1 {
  private workflows: Workflows;

  constructor(envConfig: Flash1Configuration, userConfig: UserConfiguration) {
    this.workflows = new Workflows(envConfig, userConfig);
  }

  /**
   * Deposit based on a token type. For unregistered Users, the Deposit will be combined with a registration in order to register the User first
   * @param ethSigner - the L1 signer
   * @param deposit - the token type amount in its corresponding unit
   * @returns a promise that resolves with the resulting transaction
   * @throws {@link index.IMXError}
   */
  public deposit(ethSigner: EthSigner, amount: string, token: ERC20Collateral) {
    return this.workflows.deposit(ethSigner, amount, token);
  }

  /**
   * Mint testnet collateral for free. Used as part of depositing testnet funds
   * @param ethSigner - the L1 signer
   * @param deposit - the token type amount in its corresponding unit
   * @returns a promise that resolves with the resulting transaction
   * @throws {@link index.IMXError}
   */
  public selfMintCollateral(ethSigner: EthSigner, amount: string) {
    return this.workflows.selfMintCollateral(ethSigner, amount);
  }

  /**
   * Register a User to Immutable X if they are not already
   * @param walletConnection - the pair of L1/L2 signers
   * @returns a promise that resolves with void if successful
   * @throws {@link index.IMXError}
   */
  public registerOffchain(walletConnection: WalletConnection) {
    return this.workflows.registerOffchain(walletConnection);
  }

  /**
   * Checks if a User is registered on on-chain
   * @param walletConnection - the pair of L1/L2 signers
   * @returns a promise that resolves with true if the User is registered, false otherwise
   * @throws {@link index.IMXError}
   */
  public isRegisteredOnchain(walletConnection: WalletConnection) {
    return this.workflows.isRegisteredOnchain(walletConnection);
  }

  /**
   * Create a Withdrawal
   * @param walletConnection - the pair of L1/L2 signers
   * @param request - the token type amount in its corresponding unit
   * @returns a promise that resolves with the created Withdrawal
   * @throws {@link index.IMXError}
   */
  public prepareWithdrawal(
    walletConnection: WalletConnection,
    request: TokenAmount,
  ) {
    return this.workflows.prepareWithdrawal(walletConnection, request);
  }

  /**
   * Completes a Withdrawal
   * @param ethSigner - the L1 signer
   * @param starkPublicKey - the Signer address
   * @param token - the token
   * @returns a promise that resolves with the transaction
   * @throws {@link index.IMXError}
   */
  public completeWithdrawal(
    ethSigner: EthSigner,
    starkPublicKey: string,
    token: AnyToken,
  ) {
    return this.workflows.completeWithdrawal(ethSigner, starkPublicKey, token);
  }

  /**
   * Create an Order
   * @param walletConnection - the pair of L1/L2 signers
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with the created Order
   * @throws {@link index.IMXError}
   */
  public createOrder(
    walletConnection: WalletConnection,
    request: UnsignedOrderRequest,
  ) {
    return this.workflows.createOrder(walletConnection, request);
  }

  /**
   * Cancel an Order
   * @param walletConnection - the pair of L1/L2 signers
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with the cancelled Order
   * @throws {@link index.IMXError}
   */
  public cancelOrder(
    walletConnection: WalletConnection,
    request: GetSignableCancelOrderRequest,
  ) {
    return this.workflows.cancelOrder(walletConnection, request);
  }

  /**
   * Create a Trade
   * @param walletConnection - the pair of L1/L2 signers
   * @param request - the request object to be provided in the API request
   * @returns a promise that resolves with the created Trade
   * @throws {@link index.IMXError}
   */
  public createTrade(
    walletConnection: WalletConnection,
    request: GetSignableTradeRequest,
  ) {
    return this.workflows.createTrade(walletConnection, request);
  }
}
