/*
  Warnings:

  - A unique constraint covering the columns `[name,tenant_id,category_id]` on the table `menu_items` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "menu_items_name_tenant_id_category_id_key" ON "menu_items"("name", "tenant_id", "category_id");
