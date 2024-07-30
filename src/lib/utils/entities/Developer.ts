import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "Developer" })
export class Developer {
	@PrimaryColumn()
	Snowflake!: string;

	@Column({ default: false })
	MaintenanceModeStatus!: boolean;
}
