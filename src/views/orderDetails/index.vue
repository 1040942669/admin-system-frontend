<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar" style="display: inline-block; width: 100%">
        <div style="float: right">
          <el-button type="primary"
                     class="continue"
                     @click="refreshOrders">
            刷新订单
          </el-button>
        </div>
      </div>
      <el-table v-if="tableData.length"
                :data="tableData"
                stripe
                class="tableBox">
        <el-table-column prop="OrderID"
                         label="订单号" />
        <el-table-column prop="UserID"
                         label="用户ID" />
        <el-table-column prop="Status"
                         label="订单状态" />
        <el-table-column prop="TotalAmount"
                         label="总金额" />
        <el-table-column prop="CreatedAt"
                         label="创建时间" />
        <el-table-column label="操作"
                         width="200"
                         align="center">
          <template slot-scope="scope">
            <el-button type="text"
                       size="small"
                       class="delBut"
                       @click="finishHandle(scope.row.OrderID)">
              完成订单
            </el-button>
             <el-button type="text"
                       size="small"
                       class="delBut"
                       @click="confirmRefundHandle(scope.row.OrderID)">
              批准退款
            </el-button>
            <el-button type="text"
                       size="small"
                       class="delBut"
                       @click="deleteHandle(scope.row.OrderID)">
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
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { finishOrder, deleteOrder, getOrderDetailPage, confirmRefund } from '@/api/order';
import Empty from '@/components/Empty/index.vue';

@Component({
  name: 'OrderManagement',
  components: {
    Empty
  }
})
export default class extends Vue {
  private counts: number = 0;
  private page: number = 1;
  private pageSize: number = 10;
  private tableData = [];
  private isSearch: boolean = false;

  created() {
    this.init();
  }

  private async init(isSearch?) {
    this.isSearch = isSearch || false;
    const params = {
      page: this.page,
      pageSize: this.pageSize,
    };
    await getOrderDetailPage(params)
      .then(res => {
        if (res.data.code === 0) {
          this.tableData = res.data.data.orders;
          this.counts = Number(res.data.data.orders.length);
        } else {
          this.$message.error(res.data.message);
        }
      })
      .catch(err => {
        this.$message.error('请求出错了：' + err.message);
      });
  }

  private async confirmRefundHandle(orderId: number) {
    this.$confirm('确定批准退款吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      confirmRefund({ orderId })
        .then(res => {
          if (res.data.code === 0) {
            this.$message.success('操作成功！');
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

  private async finishHandle(orderId: number) {
    this.$confirm('确定完成订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      finishOrder({ orderId })
        .then(res => {
          if (res.data.code === 0) {
            this.$message.success('操作成功！');
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

  private async deleteHandle(orderId: number) {
    this.$confirm('此操作将永久删除该订单，是否继续？', '确定删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      deleteOrder({orderId})
        .then(res => {
          if (res.data.code === 0) {
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

  private refreshOrders() {
    this.init();
  }

  private handleSizeChange(val: number) {
    this.pageSize = val;
    this.init();
  }

  private handleCurrentChange(val: number) {
    this.page = val;
    this.init();
  }

  private deleteOrder(orderId: number) {
    console.log('Deleting order with ID:', orderId);

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


function deleteOrder(orderId: number) {
  throw new Error('Function not implemented.');
}
