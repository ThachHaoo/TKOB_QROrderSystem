import { KdsBoardPage } from "@/features/kds";

/**
 * Owner's Kitchen Display System view
 * Accessible within admin panel with sidebar for monitoring
 */
export default function AdminKDSPage() {
  return <KdsBoardPage showKdsProfile={false} enableKitchenServe={false} />;
}
