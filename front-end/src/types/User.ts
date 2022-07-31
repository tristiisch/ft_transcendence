import type Status from '@/types/Status'

export default interface User {
  id: number
  username: string
  rank: number
  nbVictory: number
  nbDefeat: number
  avatar: string
  '2fa': string
  '42token': string
  created: string
  register_ip: string
  current_status: Status
  last_connection: string
}

export interface AuthUser {
	id: string;
	token: string;
	username: string;
	avatar: string;
}
export interface AuthState {
	isAuthenticated: boolean;
	user: AuthUser;
	isLoading: boolean;
}
