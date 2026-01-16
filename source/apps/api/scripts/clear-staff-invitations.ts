/**
 * Script to clear staff invitations
 * Usage: npx tsx scripts/clear-staff-invitations.ts [email]
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearInvitations(email?: string) {
  try {
    console.log('🔍 Clearing staff invitations...');

    if (email) {
      // Delete specific email
      const result = await prisma.staffInvitation.deleteMany({
        where: { email },
      });
      console.log(`✅ Deleted ${result.count} invitation(s) for: ${email}`);
    } else {
      // Delete all invitations
      const result = await prisma.staffInvitation.deleteMany();
      console.log(`✅ Deleted all ${result.count} invitation(s)`);
    }
  } catch (error) {
    console.error('❌ Error clearing invitations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line args
const email = process.argv[2];

clearInvitations(email);
