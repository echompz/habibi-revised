-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pricePaidInPeso" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "shippingStatus" TEXT NOT NULL DEFAULT 'not-shipped',
    "shippingId" TEXT,
    "address" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "orderGroupId" TEXT,
    "specialInstructions" TEXT,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("address", "createdAt", "id", "orderGroupId", "pricePaidInPeso", "productId", "quantity", "shippingId", "shippingStatus", "specialInstructions", "updatedAt", "userId") SELECT "address", "createdAt", "id", "orderGroupId", "pricePaidInPeso", "productId", "quantity", "shippingId", "shippingStatus", "specialInstructions", "updatedAt", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
