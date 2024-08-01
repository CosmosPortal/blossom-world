import { Clan } from "#lib/enums";
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "Clans" })
export class Clans {
	@PrimaryColumn({ enum: Clan, type: "simple-array" })
	Clan!: Clan;

	@Column({ default: 0, type: "integer" })
	BankAccount!: number;

	@Column({ default: 0, type: "integer" })
	CurrentXp!: number;

	@Column({ default: 0, type: "integer" })
	Level!: number;

	@Column({ default: 0, type: "integer" })
	NetWorth!: number;

	@Column({ default: 2500, type: "integer" })
	RequiredXp!: number;

	@Column({ default: 0, type: "integer" })
	TotalNetWorth!: number;

	@Column({ default: 0, type: "integer" })
	TotalXp!: number;

	@CreateDateColumn()
	CreationTimestamp!: Date;

	@UpdateDateColumn()
	UpdatedTimestamp!: Date;
}