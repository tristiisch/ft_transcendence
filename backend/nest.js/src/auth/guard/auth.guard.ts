import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class FtAuthguard extends AuthGuard('ft'){
	constructor() {
		super();
	}
}
