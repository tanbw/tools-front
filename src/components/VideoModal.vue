<!-- src/components/VideoModal.vue -->
<template>
  <b-modal
    id="videoModal"
    v-model="showLocal"
    title="查看视频"
    size="lg"
    centered
    hide-footer
    @hidden="handleHidden"
  >
    <div class="ratio ratio-16x9">
      <video v-if="videoUrl" :src="videoUrl" ref="videoRef" controls controlsList="nodownload" preload="metadata">
        您的浏览器不支持 HTML5 视频标签。
      </video>
      <div v-else class="d-flex justify-content-center align-items-center h-100">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script setup lang="ts">
import { computed,ref } from 'vue';

// 定义 props
interface Props {
  show: boolean;
  videoUrl: string;
}
const props = defineProps<Props>();
const videoRef=ref<HTMLVideoElement | null>(null)
// 定义 emits
const emit = defineEmits<{
  'update:show': [show: boolean];
  'close': [];
}>();

// 使用计算属性处理 v-model
const showLocal = computed({
  get: () => props.show,
  set: (value) => {
    emit('update:show', value); // 更新父组件的 show prop
    if (!value) {
      emit('close'); // 如果本地值变为 false (模态框关闭)，触发 close 事件
    }
  }
});

// 处理模态框完全隐藏后的逻辑 (可选，如果需要清理)
const handleHidden = () => {
  const video = videoRef.value; 
  if (video) { // 检查 videoRef.value 是否存在
    video.pause(); // TypeScript 现在知道这是 HTMLVideoElement，有 pause 方法
    video.src = ''; // TypeScript 现在知道这是 HTMLVideoElement，有 src 属性
  }
};
</script>

<style scoped>
/* 你可能不需要太多局部样式，因为 BModal 和 Bootstrap 提供了大部分样式 */
/* 如果需要覆盖特定样式，可以在这里添加 */
</style>