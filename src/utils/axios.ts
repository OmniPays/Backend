import axios, { AxiosInstance } from 'axios';
import { configLoader } from '../config/config-loader';

export const axiosApiBackendInstance: AxiosInstance = axios.create();

axiosApiBackendInstance.interceptors.request.use((request) => {
  request.baseURL = configLoader().backendURL;
  return request;
});
