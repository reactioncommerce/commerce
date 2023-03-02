import {
  CommerceAPI,
  CommerceAPIConfig,
  getCommerceApi as commerceApi,
} from '@vercel/commerce/api'
import createFetchGraphqlApi from './utils/fetch-grapql-api'

import getAllPages from './operations/get-all-pages'
import getPage from './operations/get-page'
import getSiteInfo from './operations/get-site-info'
import getAllProductPaths from './operations/get-all-product-paths'
import getAllProducts from './operations/get-all-products'
import getProduct from './operations/get-product'

const API_URL = process.env.OPENCOMMERCE_STOREFRONT_API_URL
const SHOP_ID = process.env.OPENCOMMERCE_PRIMARY_SHOP_ID

if (!API_URL) {
  throw new Error(
    `The environment variable OPENCOMMERCE_STOREFRONT_API_URL is missing and it's required to access your store`
  )
}

export interface OpenCommerceConfig extends CommerceAPIConfig {
  shopId: string
  anonymousCartTokenCookie: string
}

const ONE_DAY = 60 * 60 * 24

const config: OpenCommerceConfig = {
  commerceUrl: API_URL,
  apiToken: '',
  shopId: SHOP_ID ?? '',
  customerCookie: 'opencommerce_customerToken',
  cartCookie: 'opencommerce_cartId',
  cartCookieMaxAge: ONE_DAY * 30,
  anonymousCartTokenCookie: 'opencommerce_anonymousCartToken',
  fetch: createFetchGraphqlApi(() => getCommerceApi().getConfig()),
}

const operations = {
  getAllPages,
  getPage,
  getSiteInfo,
  getAllProductPaths,
  getAllProducts,
  getProduct,
}

export const provider = { config, operations }

export type Provider = typeof provider

export type OpenCommerceAPI<P extends Provider = Provider> = CommerceAPI<P>

export function getCommerceApi<P extends Provider>(
  customProvider: P = provider as any
): OpenCommerceAPI<P> {
  return commerceApi(customProvider)
}
