<template>
  <div :key="vueRest" class="addBrand-container">
    <div :key="restKey" class="container">
      <el-form ref="ruleForm"
               :model="ruleForm"
               :rules="rules"
               :inline="true"
               label-width="180px"
               class="demo-ruleForm">
        <div>
          <el-form-item label="菜品名称:" prop="name">
            <el-input v-model="ruleForm.name"
                      placeholder="请填写菜品名称"
                      maxlength="20" />
          </el-form-item>
          <el-form-item label="菜品分类:" prop="CategoryID">
            <el-select v-model="ruleForm.categoryId"
                       placeholder="请选择菜品分类">
              <el-option v-for="(item, index) in dishList"
                         :key="item.CategoryID"
                         :label="item.Category"
                         :value="item.CategoryID" />
            </el-select>
          </el-form-item>
        </div>
        <div>
          <el-form-item label="菜品价格:" prop="price">
            <el-input v-model="ruleForm.price"
                      placeholder="请设置菜品价格" />
          </el-form-item>
        </div>
        <div class="subBox address">
          <el-button @click="() => $router.back()">
            取消
          </el-button>
          <el-button type="primary"
                     :class="{ continue: actionType === 'add' }"
                     @click="submitForm('ruleForm')">
            保存
          </el-button>
          <el-button v-if="actionType == 'add'"
                     type="primary"
                     @click="submitForm('ruleForm', 'goAnd')">
            保存并继续添加
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import {
  addDish,
  editDish,
  dishCategoryList
} from '@/api/dish';
import { getToken } from '@/utils/cookies';

@Component({
  name: 'addShop',
})
export default class extends Vue {
  private restKey: number = 0;
  private value: string = '';
  private actionType: string = '';
  private dishList: any[] = []; // 将 dishList 定义为数组
  private vueRest = '1';
  private headers = {
    token: getToken()
  };
  private ruleForm = {
    name: '',
    id: '',
    price: '',
    code: '',
    categoryId: ''
  };

  get rules() {
    return {
      name: [
        {
          required: true,
          validator: (rule: any, value: string, callback: Function) => {
            if (!value) {
              callback(new Error('请输入菜品名称'));
            } else {
              const reg = /^([A-Za-z0-9\u4e00-\u9fa5]){2,20}$/;
              if (!reg.test(value)) {
                callback(new Error('菜品名称输入不符，请输入2-20个字符'));
              } else {
                callback();
              }
            }
          },
          trigger: 'blur'
        }
      ],
      categoryId: [
        { required: true, message: '请选择菜品分类', trigger: 'change' }
      ],
      price: [
        {
          required: true,
          validator: (rules: any, value: string, callback: Function) => {
            const reg = /^([1-9]\d{0,5}|0)(\.\d{1,2})?$/;
            if (!reg.test(value) || Number(value) <= 0) {
              callback(
                new Error(
                  '菜品价格格式有误，请输入大于零且最多保留两位小数的金额'
                )
              );
            } else {
              callback();
            }
          },
          trigger: 'blur'
        }
      ],
      code: [{ required: true, message: '请填写商品码', trigger: 'blur' }]
    };
  }

  created() {
    this.getDishList();
    this.actionType = this.$route.query.id ? 'edit' : 'add';
    if (this.$route.query.id) {
      this.init();
    }
  }

  private async init() {
    queryDishById(this.$route.query.id).then(res => {
      if (res && res.data && res.data.code === 1) {
        this.ruleForm = { ...res.data.data };
        this.ruleForm.price = String(res.data.data.price);
      } else {
        this.$message.error(res.data.msg);
      }
    });
  }

  // 获取菜品分类
  private getDishList() {
    dishCategoryList({}).then(res => {
      if (res.data.code === 0) {
        this.dishList = res.data.data.categories;
      } else {
        this.$message.error(res.data.msg);
      }
    });
  }

  private submitForm(formName: any, st: any) {
  ;(this.$refs[formName] as any).validate((valid: any) => {
    if (valid) {
      const categoryItem = this.dishList.find(item => item.CategoryID === this.ruleForm.categoryId);
      const category = categoryItem ? categoryItem.Category : '';

      let params: any = {
        name: this.ruleForm.name,
        price: parseFloat(this.ruleForm.price), // 确保 price 是数值型（浮点数）
        category: category
      };

      if (this.actionType == 'add') {
        addDish(params)
          .then(res => {
            if (res.data.code === 0) {
              this.$message.success('菜品添加成功！');
              if (!st) {
                this.$router.push({ path: '/dish' });
              } else {
                this.ruleForm = {
                  name: '',
                  id: '',
                  price: '',
                  code: '',
                  categoryId: ''
                };
                this.restKey++;
              }
            } else {
              this.$message.error(res.data.desc || res.data.msg);
            }
          })
          .catch(err => {
            this.$message.error('请求出错了：' + err.message);
          });
      } else {
        editDish(params)
          .then(res => {
            if (res && res.data && res.data.code === 1) {
              this.$router.push({ path: '/dish' });
              this.$message.success('菜品修改成功！');
            } else {
              this.$message.error(res.data.desc || res.data.msg);
            }
          })
          .catch(err => {
            this.$message.error('请求出错了：' + err.message);
          });
      }
    } else {
      return false;
    }
  });
}

}
</script>

<style lang="scss" scoped>
.addBrand-container {
  .el-form--inline .el-form-item__content {
    width: 293px;
  }

  .el-input {
    width: 350px;
  }

  .address {
    .el-form-item__content {
      width: 777px !important;
    }
  }
}

.addBrand {
  &-container {
    margin: 30px;

    .container {
      position: relative;
      z-index: 1;
      background: #fff;
      padding: 30px;
      border-radius: 4px;
      min-height: 500px;

      .subBox {
        padding-top: 30px;
        text-align: center;
        border-top: solid 1px #dfe2e8;
      }
    }
  }
}
</style>
