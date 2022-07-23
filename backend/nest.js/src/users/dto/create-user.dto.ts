// DTO = Data transfer object
export class CreateUserDTO {

    readonly id: number;
    username: string;
    email: string;

    // ? is for optional field 
    token42?: string; 

}
