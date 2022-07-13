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
