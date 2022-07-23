import type User from '@/types/User'

export default interface Match {
  id: number
  player1: User
  player2: User
}