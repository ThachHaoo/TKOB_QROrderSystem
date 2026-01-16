/**
 * Reset Database Script
 * 
 * Xóa toàn bộ data NHƯNG giữ lại subscription plans để test lại từ đầu
 * 
 * Usage:
 *   pnpm tsx scripts/reset-db.ts
 */

import { PrismaClient, SubscriptionTier } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🗑️  Starting database reset...\n');

  try {
    // 1. Lưu lại subscription plans hiện tại
    console.log('📦 Backing up subscription plans...');
    const existingPlans = await prisma.subscriptionPlan.findMany();
    console.log(`   Found ${existingPlans.length} existing plans\n`);

    // 2. Xóa data theo thứ tự (cascade sẽ xóa các bảng con)
    console.log('🧹 Deleting all data...');
    
    // Xóa user sessions trước
    const deletedSessions = await prisma.userSession.deleteMany();
    console.log(`   ✓ Deleted ${deletedSessions.count} user sessions`);

    // Xóa staff invitations
    const deletedInvites = await prisma.staffInvitation.deleteMany();
    console.log(`   ✓ Deleted ${deletedInvites.count} staff invitations`);

    // Xóa promotions
    const deletedPromotions = await prisma.promotion.deleteMany();
    console.log(`   ✓ Deleted ${deletedPromotions.count} promotions`);

    // Xóa payments
    const deletedPayments = await prisma.payment.deleteMany();
    console.log(`   ✓ Deleted ${deletedPayments.count} payments`);

    // Xóa orders (cascade sẽ xóa order items)
    const deletedOrders = await prisma.order.deleteMany();
    console.log(`   ✓ Deleted ${deletedOrders.count} orders`);

    // Xóa carts (cascade sẽ xóa cart items)
    const deletedCarts = await prisma.cart.deleteMany();
    console.log(`   ✓ Deleted ${deletedCarts.count} carts`);

    // Xóa tables
    const deletedTables = await prisma.table.deleteMany();
    console.log(`   ✓ Deleted ${deletedTables.count} tables`);

    // Xóa menu items (cascade sẽ xóa photos)
    const deletedMenuItems = await prisma.menuItem.deleteMany();
    console.log(`   ✓ Deleted ${deletedMenuItems.count} menu items`);

    // Xóa menu categories
    const deletedCategories = await prisma.menuCategory.deleteMany();
    console.log(`   ✓ Deleted ${deletedCategories.count} categories`);

    // Xóa modifier groups (cascade sẽ xóa modifiers)
    const deletedModifierGroups = await prisma.modifierGroup.deleteMany();
    console.log(`   ✓ Deleted ${deletedModifierGroups.count} modifier groups`);

    // Xóa tenant subscriptions
    const deletedSubscriptions = await prisma.tenantSubscription.deleteMany();
    console.log(`   ✓ Deleted ${deletedSubscriptions.count} tenant subscriptions`);

    // Xóa tenant payment configs
    const deletedPaymentConfigs = await prisma.tenantPaymentConfig.deleteMany();
    console.log(`   ✓ Deleted ${deletedPaymentConfigs.count} payment configs`);

    // Xóa users
    const deletedUsers = await prisma.user.deleteMany();
    console.log(`   ✓ Deleted ${deletedUsers.count} users`);

    // Xóa tenants (cascade sẽ xóa tất cả data liên quan còn lại)
    const deletedTenants = await prisma.tenant.deleteMany();
    console.log(`   ✓ Deleted ${deletedTenants.count} tenants\n`);

    // 3. Xóa tất cả subscription plans (để seed lại clean)
    console.log('🗑️  Deleting old subscription plans...');
    const deletedPlans = await prisma.subscriptionPlan.deleteMany();
    console.log(`   ✓ Deleted ${deletedPlans.count} old plans\n`);

    // 4. Seed lại subscription plans (không cần backup vì schema có thể thay đổi)
    console.log('🌱 Re-seeding subscription plans...');
    const plans = [
      {
        tier: SubscriptionTier.FREE,
        name: 'Free',
        description: 'Perfect for trying out the system',
        priceUSD: 0,
        priceVND: 0,
        maxTables: 1,
        maxMenuItems: 10,
        maxOrdersMonth: 100,
        maxStaff: 1,
        features: {
          analytics: false,
          promotions: false,
          customBranding: false,
          prioritySupport: false,
        },
        isActive: true,
      },
      {
        tier: SubscriptionTier.BASIC,
        name: 'Basic',
        description: 'For small restaurants',
        priceUSD: 2,
        priceVND: 49000,
        maxTables: 10,
        maxMenuItems: 50,
        maxOrdersMonth: 1000,
        maxStaff: 5,
        features: {
          analytics: true,
          promotions: true,
          customBranding: false,
          prioritySupport: false,
        },
        isActive: true,
      },
      {
        tier: SubscriptionTier.PREMIUM,
        name: 'Premium',
        description: 'For growing restaurants',
        priceUSD: 9,
        priceVND: 219000,
        maxTables: -1, // unlimited
        maxMenuItems: -1, // unlimited
        maxOrdersMonth: -1, // unlimited
        maxStaff: -1, // unlimited
        features: {
          analytics: true,
          promotions: true,
          customBranding: true,
          prioritySupport: true,
        },
        isActive: true,
      },
    ];

    for (const plan of plans) {
      await prisma.subscriptionPlan.create({ data: plan });
      console.log(`   ✓ Created ${plan.name} plan`);
    }

    console.log('\n✅ Database reset complete!');
    console.log('\n📊 Summary:');
    console.log('   - All tenant data deleted');
    console.log('   - All users deleted');
    console.log('   - Subscription plans re-seeded');
    console.log('\n🎯 Ready for fresh testing!\n');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resetDatabase()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
