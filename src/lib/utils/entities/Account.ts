import { JoinableClan } from "@lib/enums";
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "Account" })
export class Account {
	@PrimaryColumn()
	Snowflake!: string;

	@Column({ default: "", type: "simple-array" })
	Badges!: string[];

	@Column({ default: JoinableClan.None, enum: JoinableClan, type: "simple-enum" })
	Clan!: JoinableClan;

	@Column({ default: 0, type: "integer" })
	CurrentXp!: number;

	@Column({ default: 0, type: "integer" })
	DailyStreak!: number;

	@Column({ default: 0, type: "integer" })
	Level!: number;

	@Column({ default: 500, type: "integer" })
	RequiredXp!: number;

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
