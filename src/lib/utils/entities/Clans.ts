import { JoinableClan } from "@lib/enums";
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "Clans" })
export class Clans {
	@PrimaryColumn({ enum: JoinableClan, type: "simple-array" })
	Clan!: JoinableClan;

	@Column({ default: 0, type: "integer" })
	CurrentXp!: number;

	@Column({ default: 0, type: "integer" })
	Level!: number;

	@Column({ default: 2500, type: "integer" })
	RequiredXp!: number;

	@Column({ default: 0, type: "integer" })
	TokenChest!: number;

	@Column({ default: 0, type: "integer" })
	TokenNetWorth!: number;

	@CreateDateColumn()
	CreationTimestamp!: Date;

	@UpdateDateColumn()
	UpdatedTimestamp!: Date;
}
