<!-- src/components/ConfirmationModal.vue -->
<template>
  <b-modal
    :id="modalId"
    v-model="localShow"
    :title="title"
    :title-tag="titleTag"
    :header-class="headerClass"
    :body-class="bodyClass"
    :footer-class="footerClass"
    :ok-title="okTitle"
    :cancel-title="cancelTitle"
    @ok="handleOk"
    @cancel="handleCancel"
    :ok-variant="okVariant"
    :cancel-variant="cancelVariant"
    :centered="centered"
    :size="size"
    :header-close-content="headerCloseContent"
    :hide-header="hideHeader"
    :hide-footer="hideFooter"
  >
    <template #header v-if="!hideHeader">
      <div v-if="icon" class="d-flex flex-column align-items-center w-100">
        <div class="p-3 bg-danger-subtle rounded-circle mb-3">
          <i :class="`${icon} text-${iconColor} fs-2`"></i>
        </div>
        <h4 v-if="title" class="modal-title text-center">{{ title }}</h4>
      </div>
      <h4 v-else-if="title" class="modal-title">{{ title }}</h4>
    </template>

    <template #default>
      <slot></slot>
    </template>

    <template #footer="{ ok, cancel, hide }" v-if="!hideFooter">
      <b-button :variant="cancelVariant" @click="cancel()">
        {{ cancelTitle }}
      </b-button>
      <b-button :variant="okVariant" @click="ok()">
        {{ okTitle }}
      </b-button>
    </template>
  </b-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ButtonVariant } from 'bootstrap-vue-next';

// 定义 props
interface Props {
  modelValue: boolean; // 控制显示隐藏的 v-model
  modalId?: string; // 模态框 ID
  title?: string; // 标题
  titleTag?: string; // 标题标签
  headerClass?: string; // 头部样式类
  bodyClass?: string; // 主体样式类
  footerClass?: string; // 底部样式类
  okTitle?: string; // 确认按钮文字
  cancelTitle?: string; // 取消按钮文字
  okVariant?: ButtonVariant; // 确认按钮样式
  cancelVariant?: ButtonVariant; // 取消按钮样式
  centered?: boolean; // 是否垂直居中
  size?: 'sm' | 'lg' | 'xl'; // 大小
  headerCloseContent?: string; // 关闭按钮内容
  hideHeader?: boolean; // 是否隐藏头部
  hideFooter?: boolean; // 是否隐藏底部
  icon?: string; // 图标类名 (如 'fas fa-exclamation-triangle')
  iconColor?: string; // 图标颜色 (如 'danger')
  onOk?: () => void; // 确认回调
  onCancel?: () => void; // 取消回调
}

const props = withDefaults(defineProps<Props>(), {
  modalId: 'confirmation-modal',
  title: '确认操作',
  titleTag: 'h4',
  headerClass: '',
  bodyClass: 'text-center',
  footerClass: 'justify-content-center',
  okTitle: '确认',
  cancelTitle: '取消',
  okVariant: 'danger',
  cancelVariant: 'outline-secondary',
  centered: true,
  size: 'sm',
  headerCloseContent: '&times;',
  hideHeader: false,
  hideFooter: false,
  icon: 'fas fa-exclamation-triangle', 
  iconColor: 'danger', // 默认图标颜色
  onOk: undefined,
  onCancel: undefined,
});

// 定义 emits
const emit = defineEmits<{
  'update:modelValue': [show: boolean];
  'ok': [];
  'cancel': [];
}>();

// 使用计算属性处理 v-model
const localShow = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// 确认处理函数
const handleOk = async () => {
  if (props.onOk) {
    try {
      await props.onOk(); // 等待异步操作完成
      // 如果 onOk 成功执行，默认会关闭模态框
    } catch (error) {
      console.error('ConfirmationModal onOk error:', error);
      // 可以选择在这里不关闭模态框，让用户重试
      // e.preventDefault(); // 阻止默认关闭行为 (如果需要)
      throw error; // 重新抛出错误，让 b-modal 知道操作失败（通常不会阻止关闭）
    }
  }
  emit('ok'); // 触发 ok 事件
};

// 取消处理函数
const handleCancel = () => {
  if (props.onCancel) {
    props.onCancel(); // 执行取消回调
  }
  emit('cancel'); // 触发 cancel 事件
  // cancel() 通常会关闭模态框，无需额外处理
};
</script>

<style scoped>
.modal-header {
  padding: 1rem 1rem 0;
}

.modal-body {
  padding: 0 1.5rem 1rem;
}

.modal-footer {
  padding: 0.75rem 1rem 1rem;
  gap: 0.5rem; /* 按钮间距 */
}
</style>