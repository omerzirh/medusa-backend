import { Modules } from '@medusajs/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'

interface OrderItem {
  id: string
  title: string
  product_title: string
  quantity: number
  unit_price: number
}

interface ShippingAddress {
  first_name: string
  last_name: string
  address_1: string
  city: string
  province: string
  postal_code: string
  country_code: string
}

interface Order {
  id: string
  display_id: string
  created_at: string
  email: string
  currency_code: string
  items: OrderItem[]
  shipping_address: ShippingAddress
  summary: {
    raw_current_order_total: {
      value: number
    }
  }
}

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)

  try {
    // Retrieve the actual order data
    const order = await orderModuleService.retrieveOrder(data.id, {
      relations: ['items', 'summary', 'shipping_address']
    })

    // Retrieve shipping address
    const shippingAddress = await (orderModuleService as any).orderAddressService_.retrieve(
      order.shipping_address.id
    )

    // Format order items to include totals
    const formattedItems = order.items.map(item => ({
      ...item,
      total: item.quantity * item.unit_price
    }))

    // Get customer email from order or fall back to default
    const customerEmail = order.email || shippingAddress.email || 'oturumbeles@gmail.com'
    console.log("bok", order)
    await notificationModuleService.createNotifications({
      to: customerEmail,
      channel: 'email',
      template: 'd-fba81075dc4340ae879e084285c77592', // Your production template ID
      data: {
        emailOptions: {
          replyTo: 'replyto@autolier.pl',
          subject: `Order Confirmation #${order.display_id}`
        },
        order: {
          ...order,
          items: formattedItems
        },
        shippingAddress,
        preview: 'Thank you for your order!',
        current_year: new Date().getFullYear(),
        store_name: 'Autolier' // Replace with your actual store name
      }
    })

    console.log(`Order confirmation email sent for order ${order.display_id} to ${customerEmail}`)
  } catch (error) {
    console.error('Error sending order confirmation notification:', error)
    console.error('Order ID:', data.id)
    console.error('Error details:', error instanceof Error ? error.message : error)
    throw error
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}