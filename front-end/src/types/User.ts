import type Status from '@/types/Status'

export default interface User {
	id: number
	login_42: string
	//rank: number
	//nbVictory: number
	//nbDefeat: number
	avatar: string
	username: string
	status: Status
  }

export interface Auth {
	user_id: number;
	token: string;
	has_2fa: boolean;
	isRegistered: boolean,
	isAuthenticated: boolean
}

export interface UserState {
	userAuth: Auth;
	userData: User;
}
