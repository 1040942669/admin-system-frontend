<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar">
        <label style="margin-right: 10px">菜品名称：</label>
        <el-input v-model="input"
                  placeholder="请填写菜品名称"
                  style="width: 14%"
                  clearable
                  @clear="queryDishList"
                   />

        <el-button class="normal-btn continue"
                   @click="queryDishList">
          查询
        </el-button>

        <div class="tableLab">
          <span class="delBut non"
                @click="deleteHandle('批量', null)">批量删除</span>

          <el-button type="primary"
                     style="margin-left: 15px"
                     @click="addDishtype('add')">
            + 新建菜品
          </el-button>
        </div>
      </div>
      <el-table v-if="tableData.length"
                :data="tableData"
                stripe
                class="tableBox"
                @selection-change="handleSelectionChange">
        <el-table-column type="selection"
                         width="25" />
        <el-table-column prop="Name"
                         label="菜品名称" />
        <el-table-column prop="categoryName"
                         label="菜品分类" />
        <el-table-column label="售价">
          <template slot-scope="scope">
            <span style="margin-right: 10px">￥{{ (scope.row.Price ).toFixed(2)*100/100 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="UpdatedAt"
                         label="最后操作时间" />
        <el-table-column label="操作"
                         width="250"
                         align="center">
          <template slot-scope="scope">
            <el-button type="text"
                       size="small"
                       class="editBut"
                       @click="editDish(scope.row)">
              修改
            </el-button>

            <el-button type="text"
                       size="small"
                       class="delBut"
                       @click="deleteHandle('单删', scope.row.DishId)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <Empty v-else
             :is-search="isSearch" />
      <el-pagination v-if="counts > 0"
                     class="pageList"
                     :page-sizes="[10, 20, 30, 40]"
                     :page-size="pageSize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="counts"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange" />
      
      <!-- 添加修改菜品的对话框 -->
      <el-dialog title="修改菜品" :visible.sync="editDialogVisible">
        <el-form :model="editForm" label-width="100px">
          <el-form-item label="菜品名称">
            <el-input v-model="editForm.name"></el-input>
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="editForm.description"></el-input>
          </el-form-item>
          <el-form-item label="价格">
            <el-input v-model="editForm.price" type="number"></el-input>
          </el-form-item>
          <el-form-item label="是否热门">
            <el-switch v-model="editForm.is_popular"></el-switch>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditForm">确定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>


<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import {
  getDishPage,
  deleteDish,
  dishCategoryList,
  getCategoryInfo,
  queryDishList,
  editDish
} from '@/api/dish'

interface Dish {
  DishId: number;
  Name: string;
  Description: string;
  Price: number;
  CategoryID: number;
  IsPopular: boolean;
  ImageName: string;
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  categoryName?: string;
}

@Component
export default class DishType extends Vue {
  private input: any = ''
  private counts: number = 60 // 假设总记录数少于60条
  private page: number = 1
  private pageSize: number = 10
  private checkList: number[] = [] // 用于存储选中的菜品ID
  private tableData: Dish[] = []
  private categoryId: any = ''
  private isSearch: boolean = false
  private categoryCache: Record<number, string> = {}
  private editDialogVisible: boolean = false
  private editForm: any = {
    name: '',
    description: '',
    price: 0.0,
    is_popular: false
  }
  private currentDishId: number | null = null

  created() {
    this.init();
    
  }

  private async init(isSearch?) {
    this.isSearch = isSearch;
    await getDishPage({
      page: this.page,
      pageSize: this.pageSize,
      name: this.input || undefined,
      categoryId: this.categoryId || undefined,
    })
      .then(async res => {
        if (res.data.code === 0) {
          this.tableData = res.data && res.data.data && res.data.data.dishes;
          // 假设每页10条数据且返回数据不为空来估算总记录数
          if (this.tableData.length > 0) {
            this.counts = this.page * this.pageSize + 1;
          }
          console.log('Total counts:', this.counts);
          console.log('Table data:', this.tableData);

          for (let dish of this.tableData) {
            if (!this.categoryCache[dish.CategoryID]) {
              await this.fetchCategoryName(dish.CategoryID);
            }
            this.$set(dish, 'categoryName', this.categoryCache[dish.CategoryID]);
          }
        } else {
          this.$message.error('获取菜品列表失败：' + res.data.message);
        }
      })
      .catch(err => {
        this.$message.error('请求出错了：' + err.message);
      });
  }

  // 根据当前菜品列表，按照菜品名称查询菜品
  private async queryDishList() {
    queryDishList({ 
      keyword: this.input,
      page: this.page,
      pageSize: this.pageSize
       })
      .then(res => {
        if (res && res.data && res.data.code === 0) {
          this.tableData = res.data.data.dishes;
        } else {
          this.$message.error('查询菜品失败：' + res.data.message);
        }
      })
      .catch(err => {
        this.$message.error('请求查询菜品出错：' + err.message);
      });
  }

  private async fetchCategoryName(categoryId: number) {
    try {
      const res = await getCategoryInfo({ category_id: categoryId });
      if (res.data.code === 0) {
        this.$set(this.categoryCache, categoryId, res.data.data.category.Category);
      } else {
        this.$message.error('获取分类详情失败：' + res.data.message);
      }
    } catch (err) {
      this.$message.error('请求分类详情出错：' + err.message);
    }
  }

  private addDishtype(st: string) {
    if (st === 'add') {
      this.$router.push({ path: '/dish/add' });
    } else {
      this.$router.push({ path: '/dish/add', query: { id: st } });
    }
  }

  private async deleteHandle(type: string, id: number | null) { // id类型为number或null
    if (type === '批量' && id === null) {
      if (this.checkList.length === 0) {
        return this.$message.error('请选择删除对象');
      }
      this.$confirm('确认删除所选菜品, 是否继续?', '确定删除', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await Promise.all(this.checkList.map(async (dishId) => {
            console.log(`Deleting dish with ID: ${dishId}`); // 打印删除的菜品ID
            const res = await deleteDish(dishId);
            if (res.data.code !== 0) {
              throw new Error(res.data.message);
            }
          }));
          this.$message.success('批量删除成功！');
          this.init();
        } catch (err) {
          this.$message.error('批量删除出错：' + err.message);
        }
      });
    } else if (type === '单删' && id !== null) { // 单个删除逻辑
      this.$confirm('确认删除该菜品, 是否继续?', '确定删除', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          console.log(`Deleting dish with ID: ${id}`); // 打印删除的菜品ID
          const res = await deleteDish(id);
          if (res.data.code === 0) {
            this.$message.success('删除成功！');
            this.init();
          } else {
            this.$message.error(res.data.msg);
          }
        } catch (err) {
          this.$message.error('请求出错了：' + err.message);
        }
      });
    }
  }

  private editDish(dish: Dish) {
    this.currentDishId = dish.DishId;
    this.editForm = {
      name: dish.Name,
      description: dish.Description,
      price: dish.Price,
      is_popular: dish.IsPopular,
    };
    this.editDialogVisible = true;
  }

private async submitEditForm() {
  if (this.currentDishId !== null) {
    // 将 price 转换为数值类型，确保支持小数位
    this.editForm.price = parseFloat(this.editForm.price);
    try {
      const res = await editDish(this.editForm, this.currentDishId);
      if (res.data.code === 0) {
        this.$message.success('修改成功！');
        this.editDialogVisible = false;
        this.init();
      } else {
        this.$message.error('修改失败：' + res.data.message);
      }
    } catch (err) {
      this.$message.error('请求出错了：' + err.message);
    }
  }
}



  private handleSelectionChange(val: Dish[]) {
    this.checkList = val.map(row => row.DishId);
  }

  private handleSizeChange(val: number) {
    this.pageSize = val;
    this.init();
  }

  private handleCurrentChange(val: number) {
    this.page = val;
    this.init();
  }
}
</script>

<style lang="scss">
.el-table-column--selection .cell {
  padding-left: 10px;
}
</style>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
    .container {
      background: #fff;
      position: relative;
      z-index: 1;
      padding: 30px 28px;
      border-radius: 4px;
      //查询黑色按钮样式
      .normal-btn {
        background: #333333;
        color: white;
        margin-left: 20px;
      }
      .tableBar {
        margin-bottom: 20px;

        .tableLab {
          display: inline-block;
          float: right;
          span {
            cursor: pointer;
            display: inline-block;
            font-size: 14px;
            padding: 0 20px;
            color: $gray-2;
          }
        }
      }
      .tableBox {
        width: 100%;
        border: 1px solid $gray-5;
        border-bottom: 0;
      }
      .pageList {
        text-align: center;
        margin-top: 30px;
      }
    }
  }
}
</style>
