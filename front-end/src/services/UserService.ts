import type User from '@/types/User'
import type Match from '@/types/Match'
import http from '@/services/http-common'

class UserDataService {
  getUsers() {
    return http.get('users')
  }

  getUserInfo(username: string) {
    return http.get('user/' + username)
  }

  getUserfriends(username: string) {
    return http.get('user/friends/' + username )
  }

  create(data: User) {
    return http.post('/users', data)
  }

  update(id: number, data: User) {
    return http.put(`/users/${id}`, data)
  }

  delete(id: number) {
    return http.delete(`/users/${id}`)
  }

  deleteAll() {
    return http.delete(`/users`)
  }

  findByName(name: string) {
    return http.get(`/users?username=${name}`)
  }

  getCurrentMatchs() {
    return http.get(`matchs`)
  }
}



export default new UserDataService()
