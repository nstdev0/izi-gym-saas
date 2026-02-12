import { BaseEntity, EntityStatus } from "./_base";

export enum ProductType {
  CONSUMABLE = "CONSUMABLE",
  GEAR = "GEAR",
  MERCH = "MERCH",
  SERVICE = "SERVICE",
}

export class Product extends BaseEntity {
  constructor(
    id: string,
    organizationId: string,
    createdAt: Date,
    updatedAt: Date,
    status: EntityStatus,
    deletedAt: Date | null,
    public sku: string | null,
    public name: string,
    public description: string | null,
    public price: number,
    public cost: number,
    public stock: number,
    public minStock: number,
    public type: ProductType,
    public isActive: boolean,
    public images: string[] = [],
  ) {
    super(id, organizationId, createdAt, updatedAt, status, deletedAt);
  }

  get isLowStock(): boolean {
    return this.type !== ProductType.SERVICE && this.stock <= this.minStock;
  }

  get profitMargin(): number {
    if (this.price === 0) return 0;
    return ((this.price - this.cost) / this.price) * 100;
  }
}
