import { normalizeCart } from '../../../utils/normalize'
import getCartCookie from '../../utils/get-cart-cookie'
import addCartItemsMutation from '../../mutations/add-cart-item'
import createCartMutation from '../../mutations/create-cart'

import type { CartEndpoint } from '.'

const addItem: CartEndpoint['handlers']['addItem'] = async ({
  body: { cartId, item },
  config,
  req: { cookies },
}) => {
  if (!item) {
    return {
      data: null,
      errors: [{ message: 'Missing item' }],
    }
  }
  if (!item.quantity) item.quantity = 1

  const variables = {
    input: {
      shopId: config.shopId,
      items: [
        {
          productConfiguration: {
            productId: item.productId,
            productVariantId: item.variantId,
          },
          quantity: item.quantity,
          price: {
            amount: item.variant?.price,
            currencyCode: item.currencyCode,
          },
        },
      ],
    },
  }

  if (!cartId) {
    const {
      data: { createCart },
    } = await config.fetch(createCartMutation, { variables })
    return {
      data: normalizeCart(createCart.cart),
      headers: {
        'Set-Cookie': [
          getCartCookie(
            config.cartCookie,
            createCart.cart._id,
            config.cartCookieMaxAge
          ),
          getCartCookie(
            config.anonymousCartTokenCookie,
            createCart.token,
            config.cartCookieMaxAge
          ),
        ],
      },
    }
  }

  const {
    data: { addCartItems },
  } = await config.fetch(addCartItemsMutation, {
    variables: {
      input: {
        items: variables.input.items,
        cartId,
        cartToken: cookies.get(config.anonymousCartTokenCookie)?.value,
      },
    },
  })

  return { data: normalizeCart(addCartItems.cart) }
}

export default addItem
