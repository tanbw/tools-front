<template>
  <b-modal
    :id="id"
    v-model="showModal"
    :title="title"
    size="lg"
    centered
    scrollable
    hide-footer
    @hidden="onHidden"
  >
    <!-- 模态框头部操作按钮 -->
    <template #header="{ close }">
      <h5 class="modal-title">{{ title }}</h5>
      <button type="button" class="btn-close" @click="close"></button>
    </template>

    <!-- 音频资源网格 -->
    <div class="row g-4"> <!-- 增大间距 -->
      <div v-for="item in audios" :key="item.id" class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
        <b-card 
          no-body 
          class="h-100 shadow-sm resource-card border-0 d-flex flex-column" 
          :class="{ 'selected': selectedResourceId === item.id }" 
        >
          <!-- 音频资源卡片 -->
          <b-card-body class="d-flex flex-column p-4 flex-grow-1">
            <div class="audio-icon-container d-flex align-items-center justify-content-center mb-3">
              <i 
                class="fas fa-music text-primary cursor-pointer" 
                style="font-size: 3em;" 
                @click="onSelectResource(item)"
              ></i>
            </div>
            <b-card-title class="fs-6 fw-bold text-truncate text-center mb-3">{{ item.name }}</b-card-title>
            
            <div class="mt-auto">
              <b-button 
                variant="outline-success" 
                size="sm"
                class="w-100"
                @click="onSelectResource(item)"
              >
                <i class="fas fa-check me-1"></i> {{ selectedResourceId === item.id ? '已选择' : '选择' }}
              </b-button>
            </div>
          </b-card-body>
        </b-card>
      </div>
    </div>

    <!-- 模态框底部确认/取消按钮 -->
    <template #footer>
      <b-button variant="secondary" @click="closeModal">取消</b-button>
      <b-button 
        variant="primary" 
        :disabled="!selectedResourceId" 
        @click="confirmSelection"
      >
        确认选择
      </b-button>
    </template>

    <!-- 音频播放模态框 (内部) -->
    <b-modal
      id="internal-audio-player-modal"
      v-model="audioPlayerModal.show"
      :title="audioPlayerModal.title"
      hide-header-close
      hide-footer
      centered
      @hide="stopAudio"
      size="md"
    >
      <div class="d-flex flex-column align-items-center">
        <i class="fas fa-music text-primary mb-3" style="font-size: 4em;"></i>
        <audio ref="audioRef" controls class="w-100">
          <source :src="audioPlayerModal.src" type="audio/mpeg" />
          您的浏览器不支持音频播放。
        </audio>
      </div>
    </b-modal>
  </b-modal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';
import { apiCall } from '../utils/api';

const props = defineProps({
  id: { type: String, default: 'audio-selection-modal' }, // 模态框 ID
  title: { type: String, default: '选择声音' }, // 模态框标题
  initialResourceId: { type: Number, default: null }, // 初始选中的资源 ID
  filterType: { type: String, default: 'audio' },
});

const emit = defineEmits(['selected', 'hidden']); // 定义传出事件

const toast = useToast();

// --- State ---
const showModal = ref(false);
const resources = ref([]);
const selectedResourceId = ref(props.initialResourceId); // 使用 props 的初始值

const audioPlayerModal = ref({ show: false, src: '', title: '' });

// --- Computed ---
const audios = computed(() => resources.value.filter(r => r.type === props.filterType));

// --- Methods ---
const openModal = async () => {
  try {
    resources.value = await apiCall('/api/resources', {
      method: 'GET',
    });
    // 重新设置选中状态，以防 initialResourceId 发生变化
    selectedResourceId.value = props.initialResourceId; 
    showModal.value = true;
  } catch (error) {
    console.error('加载音频资源失败:', error);
    toast.danger('加载音频资源失败');
  }
};

const closeModal = () => {
  showModal.value = false;
};

const onHidden = () => {
  // 模态框完全隐藏后触发
  resources.value = []; // 清空资源列表，释放内存
  // selectedResourceId.value 保持不变，以便下次打开时可能需要
  emit('hidden'); // 通知父组件模态框已隐藏
};

const onSelectResource = (item) => {
  // 如果再次点击已选中的资源，则取消选择
  if (selectedResourceId.value === item.id) {
    selectedResourceId.value = null;
  } else {
    selectedResourceId.value = item.id;
  }
};

const confirmSelection = () => {
  if (selectedResourceId.value) {
    emit('selected', selectedResourceId.value); // 将选中的资源 ID 传递给父组件
    closeModal();
  }
};

const playAudio = (item) => {
  audioPlayerModal.value.src = '/api/resources/' + item.id + '/raw';
  audioPlayerModal.value.title = item.name;
  audioPlayerModal.value.show = true;
};

const stopAudio = () => {
  const audio = document.querySelector('#internal-audio-player-modal audio');
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
};

// 暴露方法给父组件调用
defineExpose({
  open: openModal,
  close: closeModal
});
</script>

<style scoped>
/* 为选中的卡片添加样式 */
.resource-card {
  border-radius: 12px !important;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  cursor: pointer; /* 提示可点击 */
}

.resource-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

.resource-card.selected {
  border-color: #0d6efd; /* Bootstrap primary color */
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25); /* Focus ring style */
}

.audio-icon-container {
  height: 120px; /* 为音频图标预留固定高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer; /* 提示可点击 */
}

/* 卡片标题 */
.card-title {
  margin-bottom: 0.5rem;
  color: #333;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .col-sm-6 {
    margin-bottom: 1rem; /* 在小屏幕上增加行间距 */
  }
}
</style>