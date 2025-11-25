import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Toast from "vue-toastification";
import 'vue-toastification/dist/index.css' // 导入 CSS
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import router from './router' // 导入 router
// import 'bootstrap/dist/css/bootstrap.min.css'; // 如果通过 npm 安装了 bootstrap
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // 如果需要 JS 功能
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import LoadingLink from './components/LoadingLink.vue'; // 导入组件
import LoadingButton from './components/LoadingButton.vue'; 


const app = createApp(App)

app.use(router) // 使用 router 插件

const options = {
    // You can set your default options here
};

app.use(Toast, options);

// 创建一个 QueryClient 实例并配置默认选项
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // 立即认为数据是陈旧的，每次都会重新请求
      retry: 2, // 失败时重试 2 次
      retryDelay: (attemptIndex) => {
        // 指数退避重试延迟
        return Math.min(1000 * 2 ** attemptIndex, 30000); // 最大延迟 30 秒
      },
      refetchOnWindowFocus: false, // 窗口聚焦时不自动重新获取
      refetchOnReconnect: true,   // 网络重连时自动重新获取
      // 可以在这里添加 onError 等其他全局默认配置
    },
  },
})
app.component('LoadingLink', LoadingLink)
app.component('LoadingButton', LoadingButton)

app.use(VueQueryPlugin, { queryClient })
app.mount('#app')

