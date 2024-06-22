import { VuexModule, Module, Action, Mutation, getModule } from 'vuex-module-decorators'
import { login } from '@/api/users'
import { getToken, setToken, removeToken,getStoreId, setStoreId, removeStoreId, setUserInfo, getUserInfo, removeUserInfo } from '@/utils/cookies'
import store from '@/store'
import Cookies from 'js-cookie'
import { Message } from 'element-ui'
export interface IUserState {
  token: string
  name: string
  avatar: string
  storeId: string
  introduction: string
  userInfo: any
  roles: string[]
  username: string
}

@Module({ 'dynamic': true, store, 'name': 'user' })
class User extends VuexModule implements IUserState {
  public token = getToken() || ''
  public name = ''
  public avatar = ''
  // @ts-ignore
  public storeId: string = getStoreId() || ''
  public introduction = ''
  public userInfo = {}
  public roles: string[] = []
  public username = Cookies.get('username') || ''

  @Mutation
  private SET_TOKEN(token: string) {
    this.token = token
  }

  @Mutation
  private SET_NAME(name: string) {
    this.name = name
  }

  @Mutation
  private SET_USERINFO(userInfo: any) {
    this.userInfo = { ...userInfo }
  }

  @Mutation
  private SET_AVATAR(avatar: string) {
    this.avatar = avatar
  }

  @Mutation
  private SET_INTRODUCTION(introduction: string) {
    this.introduction = introduction
  }

  @Mutation
  private SET_ROLES(roles: string[]) {
    this.roles = roles
  }

  @Mutation
  private SET_STOREID(storeId: string) {
    this.storeId = storeId
  }
  @Mutation
  private SET_USERNAME(name: string) {
    this.username = name
    }

  @Action
  public async Login(userInfo: { username: string, password: string }) {
    let { username, password } = userInfo
    username = username.trim()
    //调用登录接口,login,实际上是调用了api/employee.ts中的login方法，下面处理的是返回的数据
    //data是返回的数据，data.code是返回的状态码，data.msg是返回的信息
    //为什么要这样处理，因为后台返回的数据格式可能不是我们想要的，所以需要处理
    //为什么不直接在index.vue中处理，因为这样不符合规范，不符合分层原则,employee.ts是api层，专门处理请求，index.vue是视图层，专门处理视图
    //这一层是业务逻辑层
    const { data } = await login({ username, password })
    if (data.code=== 0) {
      //设置vuex中属性的值
      //打印data
      console.log("this is data",data)
      this.SET_USERNAME(username)
      
      this.SET_TOKEN(data.data.token)
      this.SET_USERINFO(data.data)

      //保存到Cookie中
      Cookies.set('username', username)
      Cookies.set('user_info', data.data)
      Cookies.set("token", data.data.token);
      return data
    } else {
      return Message.error(data.msg)
    }
  }

  @Action
  public ResetToken () {
    removeToken()
    this.SET_TOKEN('')
    this.SET_ROLES([])
  }

  @Action
  public async changeStore(data: any) {
    this.SET_STOREID = data.data
    this.SET_TOKEN(data.authorization)
    setStoreId(data.data)
    setToken(data.authorization)
  }

  @Action
  public async GetUserInfo () {
    if (this.token === '') {
      throw Error('GetUserInfo: token is undefined!')
    }

    const data = JSON.parse(<string>getUserInfo()) //  { roles: ['admin'], name: 'zhangsan', avatar: '/login', introduction: '' }
    if (!data) {
      throw Error('Verification failed, please Login again.')
    }

    const { roles, name, avatar, introduction, applicant, storeManagerName, storeId='' } = data // data.user
    // roles must be a non-empty array
    if (!roles || roles.length <= 0) {
      throw Error('GetUserInfo: roles must be a non-null array!')
    }

    this.SET_ROLES(roles)
    this.SET_USERINFO(data)
    this.SET_NAME(name || applicant || storeManagerName)
    this.SET_AVATAR(avatar)
    this.SET_INTRODUCTION(introduction)
  }

  @Action
  public async LogOut () {
    const { data } = await userLogout({})
    removeToken()
    this.SET_TOKEN('')
    this.SET_ROLES([])
    Cookies.remove('username')
    Cookies.remove('user_info')
    removeUserInfo()
  }
}

export const UserModule = getModule(User)
