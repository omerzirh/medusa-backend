import { Modules } from '@medusajs/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
console.log("OMER BOK KAFA")
  
  const order = await orderModuleService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] })
  const shippingAddress = await (orderModuleService as any).orderAddressService_.retrieve(order.shipping_address.id)
  console.log("OMER BOK KAFA", order, shippingAddress)
  try {
    await notificationModuleService.createNotifications({
      to: 'oturumbeles@gmail.com',
      channel: 'email',
      template: 'medusa_order_create',
      data: {
        emailOptions: {
          replyTo: 'replyto@autolier.pl',
          subject: 'Your order has been placed'
        },
        order,
        shippingAddress,
        preview: 'Thank you for your order!'
      }
    })
  } catch (error) {
    console.error('Error sending order confirmation notification:', error)
  }
  


}

export const config: SubscriberConfig = {
  event: 'order.placed'
}