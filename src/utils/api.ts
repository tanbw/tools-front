// src/utils/api.ts
import axios, { type AxiosRequestConfig, type AxiosResponse, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useToast } from 'vue-toastification';
import { isProxy, toRaw } from 'vue';
import router from '../router'
// 定义一个更灵活的 Options 类型
interface ApiCallOptions extends AxiosRequestConfig {
  // 可以添加自定义选项
}

// 创建一个 Axios 实例
const apiClient = axios.create({
  // baseURL: 'http://your-api-base-url.com', // 可选：设置基础 URL
  timeout: 10000, // 可选：设置超时时间
  headers: {
    'Content-Type': 'application/json',
    // 'X-Requested-With': 'XMLHttpRequest', // 可选：添加通用请求头
  },
  withCredentials: true,
});

// 添加请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器 (仅处理通用错误日志等，不处理业务逻辑如跳转)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // 仅在此处记录错误日志
    if (error.response) {
      console.error('Response Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Request Error (No Response):', error.request);
    } else {
      console.error('Error:', error.message);
    }
    // 将错误继续抛出，让调用者 (apiCall) 处理
    return Promise.reject(error);
  }
);

// 将 toast 和 router 的获取延迟到实际调用时
export async function apiCall<T>(url: string, options: ApiCallOptions = {}): Promise<T> {
  const toast = useToast();
  // const router = useRouter(); // 如果需要在函数内部获取

  // 检查是否为 FormData，以决定是否设置 Content-Type
  const isFormData = options.data instanceof FormData;

  const config: AxiosRequestConfig = {
    url,
    method: 'GET', // 默认方法
    withCredentials: true,
    ...options,
    headers: {
      // 如果是 FormData，不设置 Content-Type，让浏览器自动设置
      // 如果不是，则保留默认的 application/json 或 options 中的设置
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers, // 允许 options.headers 覆盖默认设置
    },
  };

  // FormData 不需要手动 JSON 序列化，axios 会处理
  // 如果不是 FormData，且 data 存在，可能需要 JSON 序列化（虽然 axios 通常会处理）
  // 但为了明确，这里保持 options.data 不变，由 axios 决定如何处理

  try {
    const response = await apiClient(config);
    console.log('apiCall response data:', response.data);
    return response.data as T;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        console.error('用户未登录或会话已过期');
        toast.error('会话已过期，请重新登录');
        await router.push('/login');
      } else {
        let errorMessage = error.message;
        if (error.response && error.response.data) {
          if (typeof error.response.data === 'object' && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          }
        }
        console.error('请求失败: ', error);
        toast.error(`请求失败: ${errorMessage}`);
      }
    } else {
      console.error('apiCall: Unexpected error:', error);
      toast.error('网络错误，请稍后重试');
    }
    throw error;
  }
}
export function formatDate(
  dateValue: string | Date | null | undefined,
  format: string = 'yyyy-MM-dd' // 新增 format 参数，默认为 'yyyy-MM-dd'
): string {
  if (!dateValue) {
    return '-';
  }

  let date: Date;

  if (dateValue instanceof Date) {
    // 如果输入是 Date 对象，直接使用
    date = dateValue;
  } else if (typeof dateValue === 'string') {
    // 如果输入是字符串，尝试转换为 Date 对象
    try {
      date = new Date(dateValue);
    } catch (error) {
      console.warn('Invalid date string:', dateValue, error);
      return 'Invalid Date';
    }
  } else {
    // 如果输入既不是字符串也不是 Date 对象
    console.warn('Invalid date type:', typeof dateValue, dateValue);
    return 'Invalid Date Type';
  }

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    console.warn('Invalid date value after conversion:', dateValue);
    return 'Invalid Date';
  }

  // 定义日期组件
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // 替换格式字符串中的占位符
  return format
    .replace(/yyyy/g, year.toString())
    .replace(/MM/g, month)
    .replace(/dd/g, day)
    .replace(/HH/g, hours)
    .replace(/mm/g, minutes)
    .replace(/ss/g, seconds);
}

export function isInstanceOf<T>(obj: any, constructor: new (...args: any[]) => T): obj is T {
  if (isProxy(obj)) {
    obj = toRaw(obj);
  }
  return obj instanceof constructor;
}