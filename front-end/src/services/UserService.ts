import type User from '@/types/User'
import http from '@/services/http-common'

class UserDataService {
  getUsers() {
    return http.get('users')
  }

  getUserInfo(username: string) {
    return http.get('user/' + username)
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
}

export default new UserDataService()
