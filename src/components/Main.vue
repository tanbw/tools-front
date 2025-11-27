<!-- src/components/Main.vue -->
<template>
  <div class="sb-nav-fixed">
    <!-- 顶部导航栏 -->
    <nav class="sb-topnav navbar navbar-expand navbar-dark bg-dark">
      <!-- Navbar Brand-->
      <router-link class="navbar-brand ps-3" :to="{ name: 'dashboard' }">
        主页
      </router-link>
      <!-- Sidebar Toggle-->
      <button class="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0"
              id="sidebarToggle" @click="toggleSidebar">
        <i class="fas fa-bars"></i>
      </button>
      <!-- Navbar-->
      <ul class="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" id="navbarDropdown" href="#"
             role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fas fa-user fa-fw"></i>
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
            <li>
              <router-link class="dropdown-item" :to="{ name: 'settings' }">
                设置
              </router-link>
            </li>
            <li>
              <router-link class="dropdown-item" :to="{ name: 'logs' }">
                日志
              </router-link>
            </li>
            <li><hr class="dropdown-divider" /></li>
            <li>
              <a class="dropdown-item" href="#" @click="handleLogout">注销</a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <div id="layoutSidenav">
      <!-- 侧边栏 -->
      <div id="layoutSidenav_nav">
        <nav class="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
          <div class="sb-sidenav-menu">
            <div class="nav">
              <router-link class="nav-link" :to="{ name: 'copy' }"
                           active-class="active" exact-active-class="active">
                <div class="sb-nav-link-icon"><i class="fas fa-book-open"></i></div>
                文案库
              </router-link>
               <router-link class="nav-link" :to="{ name: 'video' }"
                           active-class="active" exact-active-class="active">
                <div class="sb-nav-link-icon"><i class="fas fa-table"></i></div>
                生成视频
              </router-link>
               <router-link class="nav-link" :to="{ name: 'resource' }"
                           active-class="active" exact-active-class="active">
                <div class="sb-nav-link-icon"><i class="fas fa-chart-area"></i></div>
                资源库
              </router-link>
            </div>
          </div>
          <div class="sb-sidenav-footer">
            <div v-if="isCurrentUserLoading">加载中...</div>
    <div v-else-if="isCurrentUserError">加载失败</div>
    <!-- 访问重命名后的 data Ref -->
    <div v-else-if="currentUserData">
      {{ currentUserData.username }},余额<b>{{ (currentUserData.balance/1000/60).toFixed(2) }}</b>分钟
    </div>
    <div v-else>
      未知用户
    </div>
          </div>
        </nav>
      </div>

      <!-- 主内容区域 -->
      <div id="layoutSidenav_content">
        <main>
          <div v-if="isLoading" class="page-loading">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">加载中...</span>
            </div>
          </div>
          <router-view v-else />
        </main>
        <footer class="py-4 bg-light mt-auto">
          <div class="container-fluid px-4">
            <div class="d-flex align-items-center justify-content-between small">
              <div class="text-muted">Copyright &copy; AI助手 2026</div>
              <div>
                <a href="#">隐私政策</a>
                &middot;
                <a href="#">使用条款</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'; // 导入 useRouter
import { apiCall } from '../utils/api'; // 导入高级 API 封装
import type { User } from '../types'; // 导入类型
import { useQuery } from '@tanstack/vue-query'

const router = useRouter(); // 获取 router 实例
const { 
  isLoading: isCurrentUserLoading, 
  isError: isCurrentUserError, 
  data: currentUserData, 
  error: currentUserError 
} = useQuery<User, Error>({
  queryKey: ['currentUser'],
  queryFn: () => apiCall<User>('/api/user/current'),
  // 其他配置已在 main.ts 全局设置
});

const sidebarCollapsed = ref(false);
const isLoading = ref(false);

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  document.body.classList.toggle('sb-sidenav-toggled');
  localStorage.setItem('sb|sidebar-toggle', sidebarCollapsed.value.toString());
};

// 注销处理
const handleLogout = async () =>  {
    await apiCall('/api/logout');
    router.push('/login'); // 使用 Vue Router 跳转到登录页
};

// 路由导航守卫 - 显示加载状态 (如果需要)
// router.beforeEach((to, from, next) => {
//   isLoading.value = true;
//   next();
// });
//
// router.afterEach(() => {
//   isLoading.value = false;
// });

// 初始化
onMounted(() => {
  // 检查本地存储的侧边栏状态
  const savedState = localStorage.getItem('sb|sidebar-toggle');
  if (savedState === 'true') {
    sidebarCollapsed.value = true;
    document.body.classList.add('sb-sidenav-toggled');
  }

  // 添加窗口调整大小时的响应
  const handleResize = () => {
    if (window.innerWidth < 768) {
      sidebarCollapsed.value = true;
      document.body.classList.add('sb-sidenav-toggled');
    }
  };

  window.addEventListener('resize', handleResize);

  // 清理事件监听器
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
});
</script>

<style scoped>

.page-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.main-content {
  padding: 20px;
}

</style>