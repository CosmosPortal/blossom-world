import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "Roles" })
export class Roles {
	@PrimaryColumn()
	Snowflake!: string;

	@Column({ default: "", type: "simple-array" })
	ApplicationManagementTeam!: string[];

	@Column({ default: "", type: "simple-array" })
	ManagementTeam!: string[];

	@Column({ default: "" })
	Member!: string;

	@Column({ default: "", type: "simple-array" })
	ModerationTeam!: string[];

	@Column({ default: "", type: "simple-array" })
	OwnerTeam!: string[];

	@Column({ default: "", type: "simple-array" })
	SupportTeam!: string[];
}
