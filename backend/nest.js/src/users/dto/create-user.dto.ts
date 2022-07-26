// DTO = Data transfer object
export class CreateUserDTO {

	readonly id: number;
	readonly username: string;
	readonly email: string;

	// ? is for optional field 
	readonly token42?: string; 

}
