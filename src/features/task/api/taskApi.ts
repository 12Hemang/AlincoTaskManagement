// src/features/task/api/taskApi.ts
import axiosInstance from '../../../utils/axiosInstance';

export const getTaskDetail = async (taskName: string) => {
  const response = await axiosInstance.get(`/resource/Task/${taskName}`);
  return response.data.data;
};
