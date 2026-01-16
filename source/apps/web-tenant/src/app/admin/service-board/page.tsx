import { ServiceBoardPage } from "@/features/waiter";

/**
 * Owner's Service Board view
 * Accessible within admin panel with sidebar for monitoring
 */
export default function AdminServiceBoardPage() {
  return <ServiceBoardPage userRole="admin" />;
}
