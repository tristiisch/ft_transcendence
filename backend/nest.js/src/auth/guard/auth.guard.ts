import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class FtAuthGuard extends AuthGuard('ft'){
	constructor() {
		super();
	}
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){
	constructor() {
		super();
	}
}
