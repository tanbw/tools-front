// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router' // 使用 type 关键字导入类型
import Login from '../components/Login.vue'
import Main from '../components/Main.vue' // 主框架
import Dashboard from '../components/Dashboard.vue'
import Settings from '../components/Settings.vue'
import Logs from '../components/Logs.vue'
import CopyManager from '../components/CopyManager.vue' 
import VideoManager from '../components/VideoManager.vue' 
import ResourceManager from '../components/ResourceManager.vue' 

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login' // 默认重定向到登录页
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/main',
    name: 'main',
    component: Main,
    children: [ // 定义嵌套路由，子路由内容会显示在 Main 组件的 <router-view> 中
      {
        path: '',
        name: 'dashboard',
        component: Dashboard
      },
      {
        path: 'copy',
        name: 'copy',
        component: CopyManager
      },
      {
        path: 'video',
        name: 'video',
        component: VideoManager
      },
    {
        path: 'resource',
        name: 'resource',
        component: ResourceManager
      },
      {
        path: 'settings',
        name: 'settings',
        component: Settings
      },
      {
        path: 'logs',
        name: 'logs',
        component: Logs
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(), // 使用 HTML5 History 模式
  routes
})

export default router