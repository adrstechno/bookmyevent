import axios from 'axios';
import { VITE_API_BASE_URL } from '../utils/api';

axios.defaults.withCredentials = true;

const dashboardService = {
  getUserKpis: async () => {
    const res = await axios.get(`${VITE_API_BASE_URL}/dashboard/user/kpis`, { withCredentials: true });
    return res.data;
  },
  getMonthlyChart: async () => {
    const res = await axios.get(`${VITE_API_BASE_URL}/dashboard/user/monthly`, { withCredentials: true });
    return res.data;
  }
};

export default dashboardService;
