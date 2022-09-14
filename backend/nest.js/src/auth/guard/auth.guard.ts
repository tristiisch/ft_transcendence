import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	constructor() {
		super();
	}
}

@Injectable()
export class JwtTFAuthGuard extends AuthGuard('jwt-2fa') {
	constructor() {
		super();
	}
}
