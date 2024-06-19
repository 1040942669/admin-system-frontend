<template>
  <div class="container">
    <h2 class="homeTitle">
      菜品总览<span><router-link to="dish">菜品管理</router-link></span>
    </h2>
    <div class="orderviewBox">
      <ul>
        <li class="add">
          <router-link to="/dish/add">
            <i></i>
            <p>新增菜品</p>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import orderList from './orderList.vue'
@Component({
  components: { orderList },
  name: 'cuisineview',
})
export default class extends Vue {
  @Prop() private dishesData!: any
}
</script>
