import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "CooldownManager" })
export class CooldownManager {
	@PrimaryColumn()
	Key!: string;

	@Column({ type: "integer" })
	Duration!: number;

	@Column()
	Snowflake!: string;
}
