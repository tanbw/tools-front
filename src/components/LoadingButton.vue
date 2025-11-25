<template>
  <button
    v-bind="$attrs"
    :disabled="loading || disabled"
    @click="handleClick"
    :class="computedClass"
    :aria-busy="loading"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { useToast } from 'vue-toastification'; // 导入 useToast

// 定义 props
interface Props {
  disabled?: boolean;
  onClick?: () => Promise<void>;
  // 新增：开始、成功、失败的提示信息
  startMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  // 控制是否自动显示提示
  showStartMessage?: boolean;
  showSuccessMessage?: boolean;
  showErrorMessage?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  onClick: undefined,
  startMessage: '开始处理...',
  successMessage: '处理成功',
  errorMessage: '处理失败',
  showStartMessage: true,
  showSuccessMessage: true,
  showErrorMessage: true,
});

const attrs = useAttrs();

const loading = defineModel<boolean>('loading', { default: false });

// 获取 toast 实例
const toast = useToast();

const computedClass = computed(() => [
  attrs.class,
  {
    'loading-button': true,
    'loading-button--loading': loading.value,
    'loading-button--disabled': loading.value || props.disabled,
  }
]);

const handleClick = async (event: MouseEvent) => {
  if (props.disabled || loading.value) {
    event.preventDefault();
    return;
  }

  if (!props.onClick) {
    return;
  }

  event.preventDefault();

  try {
    loading.value = true;
    // 显示开始消息
    if (props.showStartMessage) {
      toast.info(props.startMessage);
    }
    // 调用业务函数
    await props.onClick();
    // 显示成功消息
    if (props.showSuccessMessage) {
      toast.success(props.successMessage);
    }
  } catch (error) {
    // 显示失败消息
    if (props.showErrorMessage) {
      toast.error(props.errorMessage);
    }
    throw error;
  } finally {
    // 结束加载，无论成功还是失败，都启用按钮
    loading.value = false;
  }
};
</script>

<style scoped>
/* 基础样式 */
.loading-button {
  transition: opacity 0.2s ease, filter 0.2s ease;
}

/* 加载中/禁用样式 */
.loading-button--loading,
.loading-button--disabled {
  opacity: 0.6;
  filter: grayscale(1);
  cursor: not-allowed;
  pointer-events: none;
}
</style>