<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar" style="display: inline-block; width: 100%">

        <div style="float: right">
          <el-button type="primary"
                     class="continue"
                     @click="addClass('class')">
            + 新增菜品分类
          </el-button>
        </div>
      </div>
      <el-table v-if="tableData.length"
                :data="tableData"
                stripe
                class="tableBox">
        
        <el-table-column prop="CategoryID"
                         label="序号" />
        
        <el-table-column prop="Category"
                         label="分类名称" />
        <el-table-column prop="UpdatedAt"
                         label="操作时间" />
        <el-table-column label="操作"
                         width="200"
                         align="center">
          <template slot-scope="scope">
            <el-button type="text"
                       size="small"
                       class="delBut"
                       @click="deleteHandle(scope.row.CategoryID)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <Empty v-else :is-search="isSearch" />
      <el-pagination v-if="counts > 10"
                     class="pageList"
                     :page-sizes="[10, 20, 30, 40]"
                     :page-size="pageSize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="counts"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange" />
    </div>
    <el-dialog :title="classData.title"
               :visible.sync="classData.dialogVisible"
               width="30%"
               :before-close="handleClose">
      <el-form ref="classData"
               :model="classData"
               class="demo-form-inline"
               :rules="rules"
               label-width="100px">
        <el-form-item label="分类名称：" prop="name">
          <el-input v-model="classData.name"
                    placeholder="请输入分类名称"
                    maxlength="20" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="medium"
                   @click="
            ;(classData.dialogVisible = false), $refs.classData.resetFields()
                   ">取 消</el-button>
        <el-button type="primary"
                   :class="{ continue: actionType === 'add' }"
                   size="medium"
                   @click="submitForm()">确 定</el-button>
        <el-button v-if="action != 'edit'"
                   type="primary"
                   size="medium"
                   @click="submitForm('go')">
          保存并继续添加
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { getCategoryPage, deleCategory, addCategory } from '@/api/category';
import Empty from '@/components/Empty/index.vue';

@Component({
  name: 'Category',
  components: {
    Empty
  }
})
export default class extends Vue {
  private options: any = [
    {
      value: 1,
      label: '菜品分类'
    }
  ]
  private actionType: string = ''
  private id = ''
  private name: string = ''
  private action: string = ''
  private counts: number = 0
  private page: number = 1
  private pageSize: number = 10
  private tableData = []
  private type = ''
  private isSearch: boolean = false
  private classData: any = {
    title: '添加菜品分类',
    dialogVisible: false,
    categoryId: '',
    name: '',
  }

  get rules() {
    return {
      name: [
        {
          required: true,
          trigger: 'blur',
          validator: (rule: any, value: string, callback: Function) => {
            var reg = new RegExp('^[A-Za-z\u4e00-\u9fa5]+$')
            if (!value) {
              callback(new Error(this.classData.title + '不能为空'))
            } else if (value.length < 2) {
              callback(new Error('分类名称输入不符，请输入2-20个字符'))
            } else if (!reg.test(value)) {
              callback(new Error('分类名称包含特殊字符'))
            } else {
              callback()
            }
          }
        }
      ]
    }
  }

  created() {
    this.init()
  }

  private async init(isSearch?) {
    this.isSearch = isSearch
    //准备请求参数,参数分别为分类名称、分类类型、页码、每页记录数,通过对象的方式传递给后端服务
    await getCategoryPage({})
      .then(res => {
        //打印返回的数据
        console.log('返回的数据', res)
        if (res.data.code === 0) {
          this.tableData =
            res && res.data && res.data.data && res.data.data.categories
          this.counts = Number(res.data.data.categories.length)
        } else {
          this.$message.error(res.data.desc)
        }
      })
      .catch(err => {
        console.log(err, 'err')
        this.$message.error('请求出错了：' + err.message)
      })
  }

  private addClass(st: any) {
    this.classData.title = '新增菜品分类'
    this.action = 'add'
    this.classData.name = ''
    this.classData.dialogVisible = true
    this.actionType = 'add'
  }

  private handleClose(st: string) {
    this.classData.dialogVisible = false
    this.$refs.classData.resetFields()
  }

private deleteHandle(id: number) {  // 确保 id 是 number 类型
  console.log('iDeleting category with ID:', id)
  this.$confirm('此操作将永久删除该分类，是否继续？', '确定删除', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleCategory(id)  // 直接传递 id
      .then(res => {
        if (res.data.code === 0) {
          this.$message.success('删除成功！')
          this.init()
        } else {
          this.$message.error(res.data.msg)
        }
      })
      .catch(err => {
        this.$message.error('请求出错了：' + err.message)
      })
  })
}


  $refs!: {
    classData: any
  }

  submitForm(st: any) {
    if (this.action === 'add') {
      this.$refs.classData.validate((value: boolean) => {
        if (value) {
          addCategory({
            category: this.classData.name,
          })
            .then(res => {
              if (res.data.code === 0) {
                this.$message.success('分类添加成功！')
                this.$refs.classData.resetFields()
                if (!st) {
                  this.classData.dialogVisible = false
                }
                this.init()
              } else {
                this.$message.error(res.data.desc || res.data.msg)
              }
            })
            .catch(err => {
              this.$message.error('请求出错了：' + err.message)
            })
        }
      })
    }
  }

  private handleSizeChange(val: any) {
    this.pageSize = val
    this.init()
  }

  private handleCurrentChange(val: any) {
    this.page = val
    this.init()
  }
}
</script>

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

      .tableBar {
        display: flex;
        margin-bottom: 20px;
        justify-content: space-between;
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
