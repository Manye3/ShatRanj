import axios from 'axios'
import { User, GameRecord } from '@/types'

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'
const API = axios.create({
  baseURL: `${SERVER}/api`,
  withCredentials: true,
})

export const login = (username: string, password: string) =>
  API.post<User>('/auth/login', { username, password }).then(r => r.data)

export const register = (username: string, password: string) =>
  API.post<User>('/auth/register', { username, password }).then(r => r.data)

export const logout = () => API.post('/auth/logout').then(r => r.data)

export const getMe = () => API.get<User>('/auth/me').then(r => r.data)

export const getProfile = (username: string) =>
  API.get<User>(`/users/${username}`).then(r => r.data)

export const getGameHistory = (username: string, page = 1) =>
  API.get<{ games: GameRecord[]; total: number; pages: number }>(
    `/users/${username}/games?page=${page}&limit=10`
  ).then(r => r.data)

export const getAiMove = (fen: string, level = 2) =>
  API.post<{ move: string }>('/ai/move', { fen, level }).then(r => r.data)
