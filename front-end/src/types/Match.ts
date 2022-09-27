import type { ReservedOrUserEventNames } from "@socket.io/component-emitter"

export default interface Match {
	id: number
	user1_id: number
	user1_username: string
	user1_avatar: string
	user2_id: number
	user2_username: string
	user2_avatar: string
	score: number[]
	timestamp_started: string
	timestamp_ended: string
  }

export interface MatchInfo {
	ballSpeed: number,
	racketSize: number,
	increaseBallSpeed: boolean,
	world: number
	winningScore: number
}
