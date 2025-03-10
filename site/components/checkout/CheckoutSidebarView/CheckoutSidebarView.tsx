import Link from 'next/link'
import { FC, useState } from 'react'
import CartItem from '@components/cart/CartItem'
import { Button, Text } from '@components/ui'
import { useUI } from '@components/ui/context'
import SidebarLayout from '@components/common/SidebarLayout'
import useCart from '@framework/cart/use-cart'
import usePrice from '@framework/product/use-price'
import useCheckout from '@framework/checkout/use-checkout'
import useSubmitCheckout from '@framework/checkout/use-submit-checkout'
import ShippingWidget from '../ShippingWidget'
import PaymentWidget from '../PaymentWidget'
import ShippingMethodWidget from '../ShippingMethodWidget'
import { useCheckoutContext } from '../context'

import s from './CheckoutSidebarView.module.css'

const CheckoutSidebarView: FC = () => {
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const { setSidebarView, closeSidebar } = useUI()
  const { data: cartData, mutate: refreshCart } = useCart()
  const { data: checkoutData } = useCheckout()
  const onCheckout = useSubmitCheckout()

  const { clearCheckoutFields, cardFields, addressFields } =
    useCheckoutContext()
  async function handleSubmit(event: React.ChangeEvent<HTMLFormElement>) {
    try {
      setLoadingSubmit(true)
      event.preventDefault()
      await onCheckout({
        card: cardFields,
        address: addressFields,
      })
      clearCheckoutFields()
      setLoadingSubmit(false)
      refreshCart()
      closeSidebar()
    } catch {
      // TODO - handle error UI here.
      setLoadingSubmit(false)
    }
  }

  const { price: subTotal } = usePrice(
    cartData && {
      amount: Number(cartData.subtotalPrice),
      currencyCode: cartData.currency.code,
    }
  )
  const { price: total } = usePrice(
    cartData && {
      amount: Number(cartData.totalPrice),
      currencyCode: cartData.currency.code,
    }
  )

  return (
    <SidebarLayout
      className={s.root}
      handleBack={() => setSidebarView('CART_VIEW')}
    >
      <div className="px-4 sm:px-6 flex-1">
        <Link href="/cart">
          <Text variant="sectionHeading">Checkout</Text>
        </Link>

        <PaymentWidget
          isValid={checkoutData?.hasPayment}
          onClick={() => setSidebarView('PAYMENT_VIEW')}
        />
        <ShippingWidget
          isValid={checkoutData?.hasShipping}
          onClick={() => setSidebarView('SHIPPING_VIEW')}
        />

        {checkoutData?.shippingMethods?.length ? (
          <ShippingMethodWidget
            isValid={!!checkoutData?.selectedShippingMethodId}
            onClick={() => setSidebarView('SHIPPING_METHOD_VIEW')}
          />
        ) : null}

        <ul className={s.lineItemsList}>
          {cartData!.lineItems.map((item: any) => (
            <CartItem
              key={item.id}
              item={item}
              currencyCode={cartData!.currency.code}
              variant="display"
            />
          ))}
        </ul>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 px-6 py-6 sm:px-6 sticky z-20 bottom-0 w-full right-0 left-0 bg-accent-0 border-t text-sm"
      >
        <ul className="pb-2">
          <li className="flex justify-between py-1">
            <span>Subtotal</span>
            <span>{subTotal}</span>
          </li>
          <li className="flex justify-between py-1">
            <span>Taxes</span>
            <span>Calculated at checkout</span>
          </li>
          {checkoutData?.selectedShippingMethodId ? (
            <li className="flex justify-between py-1">
              <span>Shipping</span>
              <span>
                {checkoutData?.shippingMethods?.find(
                  (method) =>
                    method.id === checkoutData.selectedShippingMethodId
                )?.fee ?? 0}
              </span>
            </li>
          ) : (
            <li className="flex justify-between py-1">
              <span>Shipping</span>
              <span className="font-bold tracking-wide">FREE</span>
            </li>
          )}
        </ul>
        <div className="flex justify-between border-t border-accent-2 py-3 font-bold mb-2">
          <span>Total</span>
          <span>{total}</span>
        </div>
        <div>
          {/* Once data is correctly filled */}
          <Button
            type="submit"
            width="100%"
            disabled={!checkoutData?.hasPayment || !checkoutData?.hasShipping}
            loading={loadingSubmit}
          >
            Confirm Purchase
          </Button>
        </div>
      </form>
    </SidebarLayout>
  )
}

export default CheckoutSidebarView
