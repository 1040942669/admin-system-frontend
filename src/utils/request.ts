import axios from 'axios'
import { UserModule } from '@/store/modules/user'
import { getRequestKey, removePending } from './requestOptimize'
import router from '@/router'

// baseURL是axios的默认配置，用于指定请求的基础URL，不同的环境可以配置不同的baseURL，例如开发环境和生产环境
//可以去.env.development和.env.production中配置
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 600000
})

// Request interceptors
service.interceptors.request.use(
  (config: any) => {
    // Add X-Access-Token header to every request, you can add other custom headers here
    // 给每个请求添加X-Access-Token头部，用于后端校验用户token
    if (UserModule.token) {
      config.headers['Authorization'] = `Bearer ${UserModule.token}`
    } else if (UserModule.token && config.url != '/login') {
      window.location.href = '/login'
      return false
    }
    return config
  },
  (error: any) => {
    Promise.reject(error)
  }
)

// Response interceptors
service.interceptors.response.use(
  (response: any) => {
    // console.log(response, 'response')
    if (response.data.status === 401) {
      router.push('/login')
    }
    //请求响应中的config的url会带上代理的api需要去掉
    response.config.url = response.config.url.replace('/admin', '')
    // 请求完成，删除请求中状态
    const key = getRequestKey(response.config)
    removePending(key)
    if (response.data.code === 1) {
      return response
    }
    return response
  },
  (error: any) => {
    // console.log(error.config, pending, 'error')
    if (error && error.response) {
      switch (error.response.status) {
        case 401:
          router.push('/login')
          break
        case 405:
          error.message = '请求错误'
      }
    }
    //请求响应中的config的url会带上代理的api需要去掉
    error.config.url = error.config.url.replace('/admin', '')
    // 请求完成，删除请求中状态
    const key = getRequestKey(error.config)
    removePending(key)
    return Promise.reject(error)
  }
)

export default service
