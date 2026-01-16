/**
 * Script to check if there's data in Order and OrderItem tables
 * Usage: npx ts-node scripts/check-order-data.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking database for Order and OrderItem data...\n')

  try {
    // Check Orders
    const orderCount = await prisma.order.count()
    console.log(`📊 Total Orders: ${orderCount}`)

    if (orderCount > 0) {
      const orders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          table: true,
        },
      })

      console.log('\n📋 Recent Orders:')
      orders.forEach((order) => {
        console.log(`  - ${order.orderNumber} | Table: ${order.table.tableNumber} | Total: ${order.total} | Status: ${order.status}`)
        console.log(`    Items: ${order.items.length}`)
      })
    } else {
      console.log('⚠️  No orders found in database')
    }

    // Check OrderItems
    const orderItemCount = await prisma.orderItem.count()
    console.log(`\n📦 Total Order Items: ${orderItemCount}`)

    if (orderItemCount > 0) {
      const orderItems = await prisma.orderItem.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      })

      console.log('\n📝 Recent Order Items:')
      orderItems.forEach((item) => {
        console.log(`  - ${item.name} | Qty: ${item.quantity} | Price: ${item.price} | Total: ${item.itemTotal}`)
      })
    } else {
      console.log('⚠️  No order items found in database')
    }

    // Check by Tenant
    console.log('\n\n🏢 Orders by Tenant:')
    const ordersByTenant = await prisma.order.groupBy({
      by: ['tenantId'],
      _count: { id: true },
      _sum: { total: true },
    })

    if (ordersByTenant.length > 0) {
      for (const tenantData of ordersByTenant) {
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantData.tenantId },
          select: { name: true, slug: true },
        })
        console.log(`  - ${tenant?.name} (${tenant?.slug}): ${tenantData._count.id} orders, Total: ${tenantData._sum.total}`)
      }
    } else {
      console.log('  No orders found for any tenant')
    }

    // Check order statuses
    console.log('\n\n📈 Order Status Breakdown:')
    const statusBreakdown = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    statusBreakdown.forEach((status) => {
      console.log(`  - ${status.status}: ${status._count.id}`)
    })

  } catch (error) {
    console.error('❌ Error checking database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
