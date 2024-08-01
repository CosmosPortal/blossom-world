import { Clan } from "#lib/enums";
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "Account" })
export class Account {
	@PrimaryColumn()
	Snowflake!: string;

	@Column({ default: "", type: "simple-array" })
	Badges!: string[];

	@Column({ default: 0, type: "integer" })
	BankAccount!: number;

	@Column({ default: Clan.None, enum: Clan, type: "simple-enum" })
	Clan!: Clan;

	@Column({ default: 0, type: "integer" })
	CurrentXp!: number;

	@Column({ default: 0, type: "integer" })
	DailyStreak!: number;

	@Column({ default: 0, type: "integer" })
	Level!: number;

	@Column({ default: 0, type: "integer" })
	NetWorth!: number;

	@Column({ default: 0, type: "integer" })
	Paycheck!: number;

	@Column({ default: 500, type: "integer" })
	RequiredXp!: number;

	@Column({ default: 0, type: "integer" })
	TotalNetWorth!: number;

	@Column({ default: 0, type: "integer" })
	TotalXp!: number;

	@Column({ default: 100, type: "integer" })
	Wallet!: number;

	@CreateDateColumn()
	CreationTimestamp!: Date;

	@UpdateDateColumn()
	UpdatedTimestamp!: Date;
}
