import type { CustomerAddressEndpoint } from '.'

// TODO: @chloe maybe move into checkout folder
const getCards: CustomerAddressEndpoint['handlers']['getAddresses'] =
  async ({}) => {
    return { data: null, errors: [] }
  }

export default getCards
