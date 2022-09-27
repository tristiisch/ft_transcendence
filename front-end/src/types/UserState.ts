import type User from '@/types/User';

export interface Auth {
	user_id?: number;
	token_jwt: string | null;
	has_2fa?: boolean;
	islogin?: boolean
}

export interface UserState {
	userAuth: Auth;
	userData: User;
}
