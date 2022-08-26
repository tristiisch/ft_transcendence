import axios from "@/plugin/axiosInstance"

class MatchService {
	loadMatch(id: any) {
		return axios.get(`/matchs/${id}`)
	}
}

export default new MatchService()