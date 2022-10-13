/* tslint:disable */
/* eslint-disable */
/**
 * Immutable X API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 3.0
 * Contact: support@immutable.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import globalAxios, { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Configuration } from '../configuration';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from '../common';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from '../base';
// @ts-ignore
import { Balance } from '../models';
// @ts-ignore
import { ListBalancesResponse } from '../models';
/**
 * BalancesApi - axios parameter creator
 * @export
 */
export const BalancesApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Fetches the token balances of the user
         * @summary Fetches the token balances of the user
         * @param {string} owner Address of the owner/user
         * @param {string} address Token address
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getBalance: async (owner: string, address: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'owner' is not null or undefined
            assertParamExists('getBalance', 'owner', owner)
            // verify required parameter 'address' is not null or undefined
            assertParamExists('getBalance', 'address', address)
            const localVarPath = `/v2/balances/{owner}/{address}`
                .replace(`{${"owner"}}`, encodeURIComponent(String(owner)))
                .replace(`{${"address"}}`, encodeURIComponent(String(address)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Get a list of balances for given user
         * @summary Get a list of balances for given user
         * @param {string} owner Ethereum wallet address for user
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listBalances: async (owner: string, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'owner' is not null or undefined
            assertParamExists('listBalances', 'owner', owner)
            const localVarPath = `/v2/balances/{owner}`
                .replace(`{${"owner"}}`, encodeURIComponent(String(owner)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * BalancesApi - functional programming interface
 * @export
 */
export const BalancesApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = BalancesApiAxiosParamCreator(configuration)
    return {
        /**
         * Fetches the token balances of the user
         * @summary Fetches the token balances of the user
         * @param {string} owner Address of the owner/user
         * @param {string} address Token address
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getBalance(owner: string, address: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Balance>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getBalance(owner, address, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Get a list of balances for given user
         * @summary Get a list of balances for given user
         * @param {string} owner Ethereum wallet address for user
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async listBalances(owner: string, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ListBalancesResponse>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.listBalances(owner, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * BalancesApi - factory interface
 * @export
 */
export const BalancesApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = BalancesApiFp(configuration)
    return {
        /**
         * Fetches the token balances of the user
         * @summary Fetches the token balances of the user
         * @param {string} owner Address of the owner/user
         * @param {string} address Token address
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getBalance(owner: string, address: string, options?: any): AxiosPromise<Balance> {
            return localVarFp.getBalance(owner, address, options).then((request) => request(axios, basePath));
        },
        /**
         * Get a list of balances for given user
         * @summary Get a list of balances for given user
         * @param {string} owner Ethereum wallet address for user
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listBalances(owner: string, options?: any): AxiosPromise<ListBalancesResponse> {
            return localVarFp.listBalances(owner, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * Request parameters for getBalance operation in BalancesApi.
 * @export
 * @interface BalancesApiGetBalanceRequest
 */
export interface BalancesApiGetBalanceRequest {
    /**
     * Address of the owner/user
     * @type {string}
     * @memberof BalancesApiGetBalance
     */
    readonly owner: string

    /**
     * Token address
     * @type {string}
     * @memberof BalancesApiGetBalance
     */
    readonly address: string
}

/**
 * Request parameters for listBalances operation in BalancesApi.
 * @export
 * @interface BalancesApiListBalancesRequest
 */
export interface BalancesApiListBalancesRequest {
    /**
     * Ethereum wallet address for user
     * @type {string}
     * @memberof BalancesApiListBalances
     */
    readonly owner: string
}

/**
 * BalancesApi - object-oriented interface
 * @export
 * @class BalancesApi
 * @extends {BaseAPI}
 */
export class BalancesApi extends BaseAPI {
    /**
     * Fetches the token balances of the user
     * @summary Fetches the token balances of the user
     * @param {BalancesApiGetBalanceRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalancesApi
     */
    public getBalance(requestParameters: BalancesApiGetBalanceRequest, options?: AxiosRequestConfig) {
        return BalancesApiFp(this.configuration).getBalance(requestParameters.owner, requestParameters.address, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Get a list of balances for given user
     * @summary Get a list of balances for given user
     * @param {BalancesApiListBalancesRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalancesApi
     */
    public listBalances(requestParameters: BalancesApiListBalancesRequest, options?: AxiosRequestConfig) {
        return BalancesApiFp(this.configuration).listBalances(requestParameters.owner, options).then((request) => request(this.axios, this.basePath));
    }
}
