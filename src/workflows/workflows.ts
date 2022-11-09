import { Signer } from '@ethersproject/abstract-signer';
import {
  DepositsApi,
  EncodingApi,
  OrdersApi,
  UsersApi,
  GetSignableCancelOrderRequest,
  GetSignableTradeRequest,
  TradesApi,
  ProjectsApi,
  CreateProjectRequest,
  CollectionsApi,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  MetadataApi,
  AddMetadataSchemaToCollectionRequest,
  MetadataSchemaRequest,
  MetadataRefreshesApi,
  CreateMetadataRefreshRequest,
} from '../api';
import {
  WalletConnection,
  UnsignedOrderRequest,
  AnyToken,
  ERC20Token,
  ETHToken,
  EthSigner,
  ERC20Collateral,
} from '../types';
import {
  isRegisteredOnChainWorkflow,
  registerOffchainWorkflow,
} from './registration';
import {
  depositERC20Workflow,
  depositEthWorkflow,
  selfMintWorkflow,
} from './deposit';
import {
  completeERC20WithdrawalWorkflow,
  completeEthWithdrawalWorkflow,
} from './withdrawal';
import { cancelOrderWorkflow, createOrderWorkflow } from './orders';
import { createTradeWorkflow } from './trades';
import { generateIMXAuthorisationHeaders } from '../utils';
import { Flash1Configuration, UserConfiguration } from '../config';
import { Core__factory } from '../contracts';

export class Workflows {
  private readonly depositsApi: DepositsApi;
  private readonly encodingApi: EncodingApi;
  private readonly ordersApi: OrdersApi;
  private readonly tradesApi: TradesApi;
  private readonly usersApi: UsersApi;
  private readonly projectsApi: ProjectsApi;
  private readonly collectionsApi: CollectionsApi;
  private readonly metadataApi: MetadataApi;
  private readonly metadataRefreshesApi: MetadataRefreshesApi;

  private isChainValid(chainID: number) {
    return chainID === this.config.ethConfiguration.chainID;
  }

  constructor(
    protected config: Flash1Configuration,
    protected userConfig: UserConfiguration,
  ) {
    const { apiConfiguration } = config;

    this.config = config;
    this.userConfig = userConfig;
    this.depositsApi = new DepositsApi(apiConfiguration);
    this.encodingApi = new EncodingApi(apiConfiguration);
    this.ordersApi = new OrdersApi(apiConfiguration);
    this.tradesApi = new TradesApi(apiConfiguration);
    this.usersApi = new UsersApi(apiConfiguration);
    this.projectsApi = new ProjectsApi(apiConfiguration);
    this.collectionsApi = new CollectionsApi(apiConfiguration);
    this.metadataApi = new MetadataApi(apiConfiguration);
    this.metadataRefreshesApi = new MetadataRefreshesApi(apiConfiguration);
  }

  private async validateChain(signer: Signer) {
    const chainID = await signer.getChainId();

    if (!this.isChainValid(chainID))
      throw new Error(
        'The wallet used for this operation is not from the correct network.',
      );
  }

  public async registerOffchain(walletConnection: WalletConnection) {
    await this.validateChain(walletConnection.ethSigner);

    return registerOffchainWorkflow({
      ...walletConnection,
      usersApi: this.usersApi,
    });
  }

  public async isRegisteredOnchain(walletConnection: WalletConnection) {
    await this.validateChain(walletConnection.ethSigner);

    const coreContract = Core__factory.connect(
      this.config.ethConfiguration.coreContractAddress,
      walletConnection.ethSigner,
    );

    const l2Address = await walletConnection.starkSigner.getAddress();

    return isRegisteredOnChainWorkflow(l2Address, coreContract);
  }

  public async deposit(
    signer: Signer,
    amount: string,
    token: ETHToken | ERC20Collateral,
  ) {
    switch (token.type) {
      case 'ETH':
        return this.depositEth(signer, amount, token);
      case 'ERC20':
        return this.depositERC20(signer, amount, token);
    }
  }

  public async selfMintCollateral(signer: Signer, amount: string) {
    await this.validateChain(signer);

    return selfMintWorkflow(signer, amount);
  }

  private async depositEth(signer: Signer, amount: string, token: ETHToken) {
    await this.validateChain(signer);

    return depositEthWorkflow(
      signer,
      amount,
      token,
      this.depositsApi,
      this.usersApi,
      this.encodingApi,
      this.config,
    );
  }

  private async depositERC20(
    signer: Signer,
    amount: string,
    token: ERC20Collateral,
  ) {
    await this.validateChain(signer);

    const starkKey = this.userConfig.starkex.publicKey;

    return depositERC20Workflow(signer, amount, token, starkKey, this.config);
  }

  public completeWithdrawal(signer: Signer, starkOrEthPublicKey: string) {
    return this.completeERC20Withdrawal(signer, starkOrEthPublicKey);
  }

  private async completeEthWithdrawal(signer: Signer, starkPublicKey: string) {
    await this.validateChain(signer);

    return completeEthWithdrawalWorkflow(
      signer,
      starkPublicKey,
      this.encodingApi,
      this.usersApi,
      this.config,
    );
  }

  private async completeERC20Withdrawal(
    signer: Signer,
    starkOrEthPublicKey: string,
  ) {
    await this.validateChain(signer);

    return completeERC20WithdrawalWorkflow(
      signer,
      starkOrEthPublicKey,
      this.config,
    );
  }

  public async createOrder(
    walletConnection: WalletConnection,
    request: UnsignedOrderRequest,
  ) {
    await this.validateChain(walletConnection.ethSigner);

    return createOrderWorkflow({
      ...walletConnection,
      request,
      ordersApi: this.ordersApi,
    });
  }

  public async cancelOrder(
    walletConnection: WalletConnection,
    request: GetSignableCancelOrderRequest,
  ) {
    await this.validateChain(walletConnection.ethSigner);

    return cancelOrderWorkflow({
      ...walletConnection,
      request,
      ordersApi: this.ordersApi,
    });
  }

  public async createTrade(
    walletConnection: WalletConnection,
    request: GetSignableTradeRequest,
  ) {
    await this.validateChain(walletConnection.ethSigner);

    return createTradeWorkflow({
      ...walletConnection,
      request,
      tradesApi: this.tradesApi,
    });
  }

  /**
   * IMX authorisation header functions
   */
  public async createProject(
    ethSigner: EthSigner,
    createProjectRequest: CreateProjectRequest,
  ) {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);

    return this.projectsApi.createProject({
      iMXSignature: imxAuthHeaders.signature,
      iMXTimestamp: imxAuthHeaders.timestamp,
      createProjectRequest,
    });
  }

  public async getProject(ethSigner: EthSigner, id: string) {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);

    return this.projectsApi.getProject({
      id,
      iMXSignature: imxAuthHeaders.signature,
      iMXTimestamp: imxAuthHeaders.timestamp,
    });
  }

  public async getProjects(
    ethSigner: EthSigner,
    pageSize?: number,
    cursor?: string,
    orderBy?: string,
    direction?: string,
  ) {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);

    return this.projectsApi.getProjects({
      iMXSignature: imxAuthHeaders.signature,
      iMXTimestamp: imxAuthHeaders.timestamp,
      pageSize,
      cursor,
      orderBy,
      direction,
    });
  }

  public async createCollection(
    ethSigner: EthSigner,
    createCollectionRequest: CreateCollectionRequest,
  ) {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);

    return this.collectionsApi.createCollection({
      iMXSignature: imxAuthHeaders.signature,
      iMXTimestamp: imxAuthHeaders.timestamp,
      createCollectionRequest,
    });
  }

  public async updateCollection(
    ethSigner: EthSigner,
    address: string,
    updateCollectionRequest: UpdateCollectionRequest,
  ) {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);

    return this.collectionsApi.updateCollection({
      iMXSignature: imxAuthHeaders.signature,
      iMXTimestamp: imxAuthHeaders.timestamp,
      address,
      updateCollectionRequest,
    });
  }

  public async addMetadataSchemaToCollection(
    ethSigner: EthSigner,
    address: string,
    addMetadataSchemaToCollectionRequest: AddMetadataSchemaToCollectionRequest,
  ) {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);

    return this.metadataApi.addMetadataSchemaToCollection({
      iMXSignature: imxAuthHeaders.signature,
      iMXTimestamp: imxAuthHeaders.timestamp,
      addMetadataSchemaToCollectionRequest,
      address,
    });
  }

  public async updateMetadataSchemaByName(
    ethSigner: EthSigner,
    address: string,
    name: string,
    metadataSchemaRequest: MetadataSchemaRequest,
  ) {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);

    return this.metadataApi.updateMetadataSchemaByName({
      iMXSignature: imxAuthHeaders.signature,
      iMXTimestamp: imxAuthHeaders.timestamp,
      address,
      name,
      metadataSchemaRequest,
    });
  }

  public async listMetadataRefreshes(
    ethSigner: EthSigner,
    collectionAddress?: string,
    pageSize?: number,
    cursor?: string,
  ) {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);
    const ethAddress = await ethSigner.getAddress();

    return this.metadataRefreshesApi.getAListOfMetadataRefreshes({
      xImxEthSignature: imxAuthHeaders.signature,
      xImxEthTimestamp: imxAuthHeaders.timestamp,
      xImxEthAddress: ethAddress,
      collectionAddress,
      pageSize,
      cursor,
    });
  }

  public async getMetadataRefreshErrors(
    ethSigner: EthSigner,
    refreshId: string,
    pageSize?: number,
    cursor?: string,
  ) {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);
    const ethAddress = await ethSigner.getAddress();

    return this.metadataRefreshesApi.getMetadataRefreshErrors({
      xImxEthSignature: imxAuthHeaders.signature,
      xImxEthTimestamp: imxAuthHeaders.timestamp,
      xImxEthAddress: ethAddress,
      refreshId,
      pageSize,
      cursor,
    });
  }

  public async getMetadataRefreshResults(
    ethSigner: EthSigner,
    refreshId: string,
  ) {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);
    const ethAddress = await ethSigner.getAddress();

    return this.metadataRefreshesApi.getMetadataRefreshResults({
      xImxEthSignature: imxAuthHeaders.signature,
      xImxEthTimestamp: imxAuthHeaders.timestamp,
      xImxEthAddress: ethAddress,
      refreshId,
    });
  }

  public async createMetadataRefresh(
    ethSigner: EthSigner,
    request: CreateMetadataRefreshRequest,
  ) {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);
    const ethAddress = await ethSigner.getAddress();

    return this.metadataRefreshesApi.requestAMetadataRefresh({
      xImxEthSignature: imxAuthHeaders.signature,
      xImxEthTimestamp: imxAuthHeaders.timestamp,
      xImxEthAddress: ethAddress,
      createMetadataRefreshRequest: request,
    });
  }
}
