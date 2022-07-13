import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://ft-transcendence-e2f0d-default-rtdb.europe-west1.firebasedatabase.app',
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-type': 'application/json',
  },
})

export default apiClient
