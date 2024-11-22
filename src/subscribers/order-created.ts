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
console.log("bok")
  // Mock data for testing
  const order = {
    id: 'test-order-id',
    display_id: 'ORD-123',
    created_at: new Date().toISOString(),
    email: 'omerzirh@gmail.com',
    currency_code: 'USD',
    items: [
      { id: 'item-1', title: 'Item 1', product_title: 'Product 1', quantity: 2, unit_price: 10 },
      { id: 'item-2', title: 'Item 2', product_title: 'Product 2', quantity: 1, unit_price: 25 }
    ],
    shipping_address: {
      first_name: 'Test',
      last_name: 'User',
      address_1: '123 Main St',
      city: 'Anytown',
      province: 'CA',
      postal_code: '12345',
      country_code: 'US'
    },
    summary: { raw_current_order_total: { value: 45 } }
  }

  const shippingAddress = {
    first_name: 'Test',
    last_name: 'User',
    address_1: '123 Main St',
    city: 'Anytown',
    province: 'CA',
    postal_code: '12345',
    country_code: 'US'
  }

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: 'email',
      template: 'd-fba81075dc4340ae879e084285c77592',
      data: {
        emailOptions: {
          replyTo: 'replyto@autolier.pl',
          subject: `Order Confirmation #${order.display_id}`
        },
        order: {
          ...order,
          // Calculate total for each item
          items: order.items.map(item => ({
            ...item,
            total: item.quantity * item.unit_price
          }))
        },
        shippingAddress,
        preview: 'Thank you for your order!',
        current_year: new Date().getFullYear(),
        store_name: 'Your Store Name'
      }
    })

    console.log(`Order confirmation email sent for order ${order.display_id}`)
  } catch (error) {
    console.error('Error sending order confirmation notification:', error)
    throw error
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}