import request from '@/utils/request'
/**
 *
 * 菜品管理
 *
 **/
// 查询列表接口
export const getDishPage = (params: any) => {
  return request({
    url: '/dish/list',
    method: 'post',
    params
  })
}

// 删除接口
export const deleteDish = (id: number) => {
  return request({
    url: '/dish/delete',
    method: 'delete',
    params: { id: id }
  })
}

// 修改接口
export const editDish = (params: any) => {
  return request({
    url: '/dish',
    method: 'put',
    data: { ...params }
  })
}

// 新增接口
export const addDish = (params: any) => {
  return request({
    url: '/dish/add',
    method: 'post',
    data: { ...params }
  })
}

// 查询详情
export const queryDishById = (id: string | (string | null)[]) => {
  return request({
    url: `/dish/${id}`,
    method: 'get'
  })
}

// 查菜品列表的接口
export const queryDishList = (params: any) => {
  return request({
    url: '/dish/search',
    method: 'get',
    params
  })
}

//菜品分类数据查询
export const dishCategoryList = (params: any) => {
  return request({
    url: `/category/list`,
    method: 'post',
    params: { ...params }
  })
}

// 获取分类详情
export const getCategoryInfo = (params: any) => {
  return request({
    url: '/category/info',
    method: 'post',
    data: params,
  });
};