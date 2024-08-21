import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "Currency" })
export class Currency {
	@PrimaryColumn()
	Snowflake!: string;

	@Column({ default: 0, type: "integer" })
	DailyStreak!: number;

	@Column({ default: 0, type: "integer" })
	TokenBag!: number;

	@Column({ default: 0, type: "integer" })
	TokenChest!: number;

	@Column({ default: 100000, type: "integer" })
	TokenChestStorage!: number;

	@Column({ default: 0, type: "integer" })
	TokenNetWorth!: number;

	@CreateDateColumn()
	CreationTimestamp!: Date;

	@UpdateDateColumn()
	UpdatedTimestamp!: Date;
}
