import request from '@/utils/request'
// 修改密码
export const editPassword = (data: any) =>
  request({
    url: '/user/editPassword',
    method: 'put',
    data
  })

// 登录
//这里的request是一个封装好的axios请求,可以参考src/utils/request.ts
export const login = (data: any) =>
  request({
    url: '/auth/login',
    method: 'post',
    data: data
  })

// 分页查询
export const getUserList = (params: any) =>
  request({
    url: `/user/page`,
    method: 'get',
    params: params
  })
