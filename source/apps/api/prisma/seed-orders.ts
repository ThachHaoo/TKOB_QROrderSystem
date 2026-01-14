import { PrismaClient, OrderStatus, OrderPriority, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenantId = 'efdf7503-9008-4440-bc37-e0609d3e225b';
  const tableId = '7e111d68-32b4-4e23-90eb-34e4e43054b6'; // Table 999

  // Get first 2 menu items
  const menuItems = await prisma.menuItem.findMany({
    where: { tenantId },
    take: 2,
  });

  if (menuItems.length === 0) {
    console.log('No menu items found!');
    return;
  }

  console.log(`Found ${menuItems.length} menu items`);

  // Create 5 test orders with different statuses
  const statuses: OrderStatus[] = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'PENDING'];
  const priorities: OrderPriority[] = ['NORMAL', 'HIGH', 'URGENT', 'NORMAL', 'HIGH'];

  for (let i = 0; i < 5; i++) {
    const orderNumber = `ORD-${Date.now()}-${i + 1}`;
    
    // Calculate totals
    const item1Price = Number(menuItems[0].price);
    const item2Price = menuItems[1] ? Number(menuItems[1].price) : 0;
    const subtotal = item1Price + item2Price * 2;
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    const order = await prisma.order.create({
      data: {
        tenantId,
        tableId,
        orderNumber,
        status: statuses[i],
        priority: priorities[i],
        customerName: `Test Customer ${i + 1}`,
        customerNotes: `Phone: 090123456${i}`,
        paymentMethod: PaymentMethod.CASH,
        paymentStatus: statuses[i] === 'COMPLETED' ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        estimatedPrepTime: 15 + i * 5,
        items: {
          create: [
            {
              menuItemId: menuItems[0].id,
              name: menuItems[0].name,
              price: menuItems[0].price,
              quantity: 1,
              itemTotal: menuItems[0].price,
            },
            ...(menuItems[1] ? [{
              menuItemId: menuItems[1].id,
              name: menuItems[1].name,
              price: menuItems[1].price,
              quantity: 2,
              itemTotal: new Prisma.Decimal(Number(menuItems[1].price) * 2),
            }] : [])
          ],
        },
        subtotal: new Prisma.Decimal(subtotal),
        tax: new Prisma.Decimal(tax),
        total: new Prisma.Decimal(total),
        receivedAt: statuses[i] !== 'PENDING' ? new Date(Date.now() - 1000 * 60 * (20 - i * 3)) : undefined,
        preparingAt: statuses[i] === 'PREPARING' || statuses[i] === 'READY' || statuses[i] === 'COMPLETED' 
          ? new Date(Date.now() - 1000 * 60 * (15 - i * 3)) 
          : undefined,
        readyAt: statuses[i] === 'READY' || statuses[i] === 'COMPLETED'
          ? new Date(Date.now() - 1000 * 60 * (5 - i))
          : undefined,
      },
      include: {
        items: true,
      },
    });

    console.log(`✅ Created order ${order.orderNumber} - Status: ${order.status}`);
  }

  console.log('\n🎉 Successfully created 5 test orders!');
}

main()
  .catch((e) => {
    console.error('Error seeding orders:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
