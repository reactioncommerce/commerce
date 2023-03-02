import selectFulfillmentOptions from '../../../mutations/select-fulfillment-options'
import type { CustomerAddressEndpoint } from '.'

const updateItem: CustomerAddressEndpoint['handlers']['updateItem'] = async ({
  body: { item, cartId },
  config: { fetch, anonymousCartTokenCookie },
  req: { cookies },
}) => {
  // Return an error if no cart is present
  if (!cartId) {
    return {
      data: null,
      errors: [{ message: 'Cookie not found' }],
    }
  }

  if (item.shippingMethodId) {
    await fetch(selectFulfillmentOptions, {
      variables: {
        input: {
          cartId,
          cartToken: cookies.get(anonymousCartTokenCookie)?.value,
          fulfillmentGroupId: item.fulfillmentGroupId,
          fulfillmentMethodId: item.shippingMethodId,
        },
      },
    })
  }

  return { data: null, errors: [] }
}

export default updateItem
