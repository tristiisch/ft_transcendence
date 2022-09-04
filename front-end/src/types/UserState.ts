import type User from '@/types/User';

export interface Auth {
	token_jwt: string;
	has_2fa: boolean;
}

export interface UserState {
	userToken: string | null;
	userAuth: Auth;
	userData: User;
}
