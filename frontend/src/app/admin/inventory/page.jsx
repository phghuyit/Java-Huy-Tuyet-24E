import { InventoryWorkspace } from "@/components/admin/inventory-workspace";

export const metadata = {
  title: "Kho sơn gel & Vật tư",
  description: "Quản lý tồn kho sơn gel và vật tư tại tiệm VELA.",
};

export default function InventoryPage() {
  return <InventoryWorkspace />;
}
