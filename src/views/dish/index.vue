<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar">
        <label style="margin-right: 10px">菜品名称：</label>
        <el-input v-model="input"
                  placeholder="请填写菜品名称"
                  style="width: 14%"
                  clearable
                  @clear="init"
                  @keyup.enter.native="initFun" />

        <el-button class="normal-btn continue"
                   @click="init(true)">
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
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import {
  getDishPage,
  deleteDish,
  dishCategoryList,
  getCategoryInfo
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
  private checkList: string[] = []
  private tableData: Dish[] = []
  private dishCategoryList: any[] = []
  private categoryId: any = ''
  private isSearch: boolean = false
  private categoryCache: Record<number, string> = {}

  created() {
    this.init();
    this.getDishCategoryList();
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

  private deleteHandle(type: string, id: any) {
    if (type === '批量' && id === null) {
      if (this.checkList.length === 0) {
        return this.$message.error('请选择删除对象');
      }
    }
    this.$confirm('确认删除该菜品, 是否继续?', '确定删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      
      deleteDish(type === '批量' ? this.checkList.join(',') : id)
        .then(res => {
          if (res && res.data && res.data.code === 1) {
            this.$message.success('删除成功！');
            this.init();
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch(err => {
          this.$message.error('请求出错了：' + err.message);
        });
    });
  }

  // 获取菜品分类下拉数据
  private getDishCategoryList() {
    dishCategoryList({})
      .then(res => {
        if (res && res.data && res.data.code === 0) {
          this.dishCategoryList = res.data.data.categories.map((item: any) => ({
            CategoryID: item.CategoryID,
            Category: item.Category
          }));
        } else {
          this.$message.error('获取菜品分类失败：' + res.data.message);
        }
      })
      .catch(err => {
        this.$message.error('请求菜品分类出错：' + err.message);
      });
  }

  private handleSelectionChange(val: any) {
    let checkArr: any[] = [];
    val.forEach((n: any) => {
      checkArr.push(n.id);
    });
    this.checkList = checkArr;
  }

  private handleSizeChange(val: any) {
    this.pageSize = val;
    this.init();
  }

  private handleCurrentChange(val: any) {
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
