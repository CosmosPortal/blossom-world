import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "Inventory" })
export class Inventory {
	@PrimaryColumn()
	Snowflake!: string;

	@Column({ default: 0, type: "integer" })
	FishingRod!: number;

	@Column({ default: 0, type: "integer" })
	Pickaxe!: number;

	@Column({ default: 0, type: "integer" })
	Shovel!: number;

	@CreateDateColumn()
	CreationTimestamp!: Date;

	@UpdateDateColumn()
	UpdatedTimestamp!: Date;
}
