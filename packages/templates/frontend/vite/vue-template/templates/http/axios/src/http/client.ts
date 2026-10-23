import axios from 'axios'
import { environment } from '@/shared/config/env'
import { toHttpError } from './errors'

export const client = axios.create({ baseURL: environment.apiBase, timeout: environment.timeout })
client.interceptors.response.use(response => response, error => Promise.reject(toHttpError(error)))
