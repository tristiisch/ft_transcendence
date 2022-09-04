import axios from "@/plugin/axiosInstance"

class MatchService {
	findMatch() {
		return axios.get(`/matchmaking`)
	}
	loadMatch(id: any) {
		return axios.get(`/matchs/${id}`)
	}
}

export default new MatchService()