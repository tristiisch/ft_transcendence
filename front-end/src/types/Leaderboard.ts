import type Status from '@/types/Status'

export default interface Leaderboard {
	id: number
	avatar: string
	username: string
	status: Status
	rank: number
  }