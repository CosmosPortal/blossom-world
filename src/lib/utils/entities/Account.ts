import { JoinableClan } from "@lib/enums";
import { Attributes, Currency, Inventory, Levels } from "@lib/utils";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "Account" })
export class Account {
	@PrimaryColumn()
	Snowflake!: string;

	@Column({ default: "", type: "simple-array" })
	Badges!: string[];

	@Column({ default: JoinableClan.None, enum: JoinableClan, type: "simple-enum" })
	Clan!: JoinableClan;

	@CreateDateColumn()
	CreationTimestamp!: Date;

	@UpdateDateColumn()
	UpdatedTimestamp!: Date;

	@OneToOne(() => Attributes)
	@JoinColumn()
	Attributes!: Attributes;

	@OneToOne(() => Currency)
	@JoinColumn()
	Currency!: Currency;

	@OneToOne(() => Inventory)
	@JoinColumn()
	Inventory!: Inventory;

	@OneToOne(() => Levels)
	@JoinColumn()
	Levels!: Levels;
}
