import api from './api';

export const healthApi = {
  async check() {
    const { data } = await api.get('/health');
    return data;
  },
};