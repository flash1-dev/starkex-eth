import {
  EthSigner,
  ERC20Collateral,
  WalletConnection,
  ForcedTradeRequest,
  ForcedWithdrawalRequest,
  RegisterUserRequest,
} from './types';
import { Workflows } from './workflows';
import { GetSignableCancelOrderRequest } from './api';
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
   * Register a User on L1 for the purpose of performing forced actions
   * @param walletConnection - the pair of L1/L2 signers
   * @returns a promise that resolves with void if successful
   * @throws {@link index.IMXError}
   */
  public registerOnchain(ethSigner: EthSigner, request: RegisterUserRequest) {
    return this.workflows.registerOnchain(ethSigner, request);
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
   * Completes a Withdrawal
   * @param ethSigner - the L1 signer
   * @param starkPublicKey - the Signer address
   * @param token - the token
   * @returns a promise that resolves with the transaction
   * @throws {@link index.IMXError}
   */
  public completeWithdrawal(ethSigner: EthSigner, starkPublicKey: string) {
    return this.workflows.completeWithdrawal(ethSigner, starkPublicKey);
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
   * Create a Forced Trade Request
   * @param walletConnection - the pair of L1/L2 signers
   * @param request - the request object to be provided in the request
   * @returns a promise that resolves with the created Trade
   * @throws {@link index.IMXError}
   */
  public forcedTrade(ethSigner: EthSigner, request: ForcedTradeRequest) {
    return this.workflows.forcedTradeWorkflow(ethSigner, request);
  }

  /**
   * Create a Forced Withdrawal Request
   * @param walletConnection - the pair of L1/L2 signers
   * @param request - the request object to be provided in the request
   * @returns a promise that resolves with the created Trade
   * @throws {@link index.IMXError}
   */
  public forcedWithdrawal(
    ethSigner: EthSigner,
    request: ForcedWithdrawalRequest,
  ) {
    return this.workflows.forcedWithdrawalWorkflow(ethSigner, request);
  }
}
