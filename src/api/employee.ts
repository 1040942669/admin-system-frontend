import request from '@/utils/request'
/**
 *
 * 员工管理
 *
 **/
// 登录
//这里的request是一个封装好的axios请求,可以参考src/utils/request.ts
export const login = (data: any) =>
  request({
    'url': '/auth/login',
    'method': 'post',
    data: data
  })

  // 退出
 export const userLogout = (params: any) =>
 request({
   'url': `/employee/logout`,
   'method': 'post',
   params
 })

   // 分页查询
   export const getEmployeeList = (params: any) =>
   request({
     'url': `/employee/page`,
     'method': 'get',
     'params': params
   })


// 新增员工
export const addEmployee = (params: any) =>
request({
  'url': '/employee',
  'method': 'POST',
  'data': params
})

// 根据id查询员工
export const queryEmployeeById = (id: number) =>
request({
  'url': `/employee/${id}`,
  'method': 'GET'
})

// 修改员工
export const updateEmployee = (params: any) =>
request({
  'url': '/employee',
  'method': 'PUT',
  'data': params
})