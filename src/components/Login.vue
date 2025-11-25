<!-- src/components/Login.vue -->
<template>
  <div class="login-page">
    <div id="layoutAuthentication">
      <div id="layoutAuthentication_content">
        <main>
          <div class="container">
            <div class="row justify-content-center">
              <div class="col-lg-5">
                <div class="card shadow-lg border-0 rounded-lg mt-5">
                  <div class="card-header">
                    <h3 class="text-center font-weight-light my-4">AI助手-登录</h3>
                  </div>
                  <div class="card-body">
                    <!-- AlertMessage 组件 -->
                    <transition name="fade">
                      <div
                        v-if="showAlert"
                        :class="[
                          'alert',
                          'alert-dismissible',
                          'fade',
                          'show',
                          alertType === 'danger' ? 'alert-danger' : 'alert-success'
                        ]"
                      >
                        <span>{{ alertMessage }}</span>
                        <button type="button" class="btn-close" @click="hideAlert"></button>
                      </div>
                    </transition>

                    <!-- LoginForm 组件 -->
                    <form @submit.prevent="handleLoginSubmit">
                      <div class="form-floating mb-3">
                        <input
                          ref="usernameInput"
                          class="form-control"
                          v-model="form.username"
                          type="text"
                          placeholder="请输入用户名"
                          required
                          :disabled="loading"
                          @keypress="handleEnterKey"
                        />
                        <label for="username">用户名</label>
                      </div>
                      <div class="form-floating mb-3">
                        <input
                          class="form-control"
                          v-model="form.password"
                          type="password"
                          placeholder="Password"
                          required
                          :disabled="loading"
                          @keypress="handleEnterKey"
                        />
                        <label for="password">密码</label>
                      </div>
                      <div class="form-check mb-3">
                        <input
                          class="form-check-input"
                          v-model="form.rememberMe"
                          type="checkbox"
                          :disabled="loading"
                        />
                        <label class="form-check-label">记住密码</label>
                      </div>
                      <div class="d-flex align-items-center justify-content-between mt-4 mb-0">
                        <a class="small" href="/password">忘记密码?</a> <!-- 假设后端有此页面 -->
                        <button type="submit" class="btn btn-primary" :disabled="loading">
                          <span>{{ loading ? '登录中...' : '登录' }}</span>
                          <div v-if="loading" class="spinner-border spinner-border-sm ms-2"></div>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // 导入 useRouter

const router = useRouter(); // 获取 router 实例
// 响应式数据
const loading = ref<boolean>(false);
const showAlert = ref<boolean>(false);
const alertMessage = ref<string>('');
const alertType = ref<'danger' | 'success'>('danger');
import { useToast } from 'vue-toastification' // 导入 useToast

const toast = useToast() // 在 setup 内部获取实例
const form = reactive({
  username: '',
  password: '',
  rememberMe: false
});

const usernameInput = ref<HTMLInputElement | null>(null);

// 可复用的工具函数
const utils = {
  getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop()?.split(';').shift() || null : null;
  }
};

// 方法
const handleLoginSubmit = async () => {
  // 表单验证
  if (!form.username.trim()) {
    showMessage('请输入用户名');
    return;
  }

  if (!form.password) {
    showMessage('请输入密码');
    return;
  }

  loading.value = true;
  hideAlert();

  try {
    const formDataObj = new FormData();
    formDataObj.append('username', form.username);
    formDataObj.append('password', form.password);
    if (form.rememberMe) {
      formDataObj.append('remember-me', 'on');
    }

    const csrfToken = utils.getCookie('XSRF-TOKEN');

    // 注意：这里请求的是 /api/login，Vite 代理会将其转发到后端
    const response = await fetch('/api/login', {
      method: 'POST',
      body: formDataObj,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': csrfToken || '', // 确保不传递 undefined
      },
      credentials: 'include'
    });

    if (response.ok) {
      showMessage('登录成功！正在跳转...', 'success');
      // 尝试立即跳转，看是否有错误
      console.log('Attempting to navigate to /main');
      try {
        await router.push('/main'); // 使用 await 等待跳转完成
      } catch (navigationError) {
        toast.error('页面跳转失败，请稍后重试'); // 如果你也在 Login 组件中使用了 toast
      }
    } else {
      showMessage('登录失败：用户名或密码错误');
    }

  } catch (error) {
    console.error('登录请求失败:', error);
    showMessage('网络错误，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const showMessage = (message: string, type: 'danger' | 'success' = 'danger') => {
  alertMessage.value = message;
  alertType.value = type;
  showAlert.value = true;
};

const hideAlert = () => {
  showAlert.value = false;
};

const handleEnterKey = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleLoginSubmit();
  }
};

// 挂载后设置焦点
onMounted(() => {
  if (usernameInput.value) {
    usernameInput.value.focus();
  }
});
</script>

<style scoped>
/* 局部样式 */
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 定义 fade 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>