import type Status from '@/types/Status'

export default interface User {
  id: string
  username: string
  rank: number
  nbVictory: number
  nbDefeat: number
  avatar: string
  '2fa': boolean
  current_status: Status
}

/*export interface AuthUser {
	id: string;
	token: string;
	//username: string;
	//avatar: string;
}*/
export interface UserState {
	userAuth: { id: string, token: string, isRegistered: boolean, isAuthenticated: boolean};
	userData: User;
}
