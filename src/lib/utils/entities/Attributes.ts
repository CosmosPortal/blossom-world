import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "Attributes" })
export class Attributes {
	@PrimaryColumn()
	Snowflake!: string;

	@Column({ default: 50, type: "integer" })
	Energy!: number;

	@Column({ default: 100, type: "integer" })
	Health!: number;

	@CreateDateColumn()
	CreationTimestamp!: Date;

	@UpdateDateColumn()
	UpdatedTimestamp!: Date;
}
