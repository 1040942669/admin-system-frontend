import request from '@/utils/request';
/**
 *
 * 分类管理
 *
 **/

// 查询分类列表接口
export const getCategoryPage = (params: any) => {
  return request({
    url: 'category/list',
    method: 'post',
    params
  });
};

// 删除当前列的接口
export const deleCategory = (id: number) => {  // 修改参数类型为 number
  return request({
    url: 'category/delete',
    method: 'delete',
    data: { id: id },  // 修改为 data，传递 JSON 格式的请求体
  });
};

// 新增接口
export const addCategory = (params: any) => {
  return request({
    url: 'category/add',
    method: 'post',
    data: { ...params }
  });
};
