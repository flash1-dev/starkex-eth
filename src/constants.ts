/* eslint-disable prettier/prettier */
import { CollateralTokens } from './types';

export const COLLATERAL_TOKENS: CollateralTokens = {
    SELF_MINT_TESTNET: {
        tokenAddress: '0xd44BB808bfE43095dBb94c83077766382D63952a',
        assetId: '0xa21edc9d9997b1b1956f542fe95922518a9e28ace11b7b2972a1974bf5971f',
        type: 'ERC20',
        quantization: 1e6,
    },
    USDT_MAINNET: {
        tokenAddress: '0x0',
        assetId: '0x0',
        type: 'ERC20',
        quantization: 1e1,
    },
};
