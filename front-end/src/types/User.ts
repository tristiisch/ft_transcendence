import type Status from '@/types/Status'

export default interface User {
	id: number
	login_42: string
	avatar: string
	username: string
	status: Status
  }

export interface Auth {
	token: string;
	has_2fa: boolean;
}

export interface UserState {
	userAuth: Auth;
	userData: User;
}
