import request from '@/utils/request'
// 修改密码
export const editPassword = (data: any) =>
  request({
    'url': '/employee/editPassword',
    'method': 'put',
    data
  })
