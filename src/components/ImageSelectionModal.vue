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

    <!-- 图片资源网格 -->
    <div class="row g-4"> <!-- 增大间距 -->
      <div v-for="item in images" :key="item.id" class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
        <b-card 
          no-body 
          class="h-100 shadow-sm resource-card border-0" 
          :class="{ 'selected': selectedResourceId === item.id }"
        >
          <!-- 图片资源卡片 -->
          <div class="image-wrapper position-relative">
            <b-card-img 
              :src="'/api/resources/'+item.id+'/raw'" 
              alt="资源图片" 
              class="resource-image"
              @click="onSelectResource(item)"
            ></b-card-img>
            <div class="image-overlay d-flex align-items-center justify-content-center">
              <i class="fas fa-search-plus text-white fa-2x cursor-pointer" @click="showImage(item)"></i>
            </div>
          </div>
          <b-card-body class="p-3 d-flex flex-column">
            <b-card-title class="fs-6 fw-bold text-truncate mb-2">{{ item.name }}</b-card-title>
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

    <!-- 图片预览模态框 (内部) -->
    <b-modal
      id="internal-image-preview-modal"
      v-model="imagePreviewModal.show"
      :title="imagePreviewModal.title"
      size="lg"
      centered
      body-class="p-0"
      modal-class="image-preview-modal"
      hide-footer
    >
      <img :src="imagePreviewModal.src" alt="预览图片" class="w-100 rounded" />
    </b-modal>
  </b-modal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';
import { apiCall } from '../utils/api';

const props = defineProps({
  id: { type: String, default: 'image-selection-modal' }, // 模态框 ID
  title: { type: String, default: '选择图片' }, // 模态框标题
  initialResourceId: { type: Number, default: null } // 初始选中的资源 ID
});

const emit = defineEmits(['selected', 'hidden']); // 定义传出事件

const toast = useToast();

// --- State ---
const showModal = ref(false);
const resources = ref([]);
const selectedResourceId = ref(props.initialResourceId); // 使用 props 的初始值

const imagePreviewModal = ref({ show: false, src: '', title: '' });

// --- Computed ---
const images = computed(() => resources.value.filter(r => r.type === 'image'));

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
    console.error('加载图片资源失败:', error);
    toast.danger('加载图片资源失败');
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
 console.log("confirmSelection called, selectedResourceId:", selectedResourceId.value);
  if (selectedResourceId.value) {
    console.log("Emitting 'selected' event with ID:", selectedResourceId.value);
    emit('selected', selectedResourceId.value); // 这里应该触发 @selected 事件
    closeModal(); // 这里应该触发 @hidden 事件
  } else {
    console.log("No resource selected, cannot confirm.");
  }
};

const showImage = (item) => {
  imagePreviewModal.value.src = '/api/resources/' + item.id + '/raw';
  imagePreviewModal.value.title = item.name;
  imagePreviewModal.value.show = true;
};

// 暴露方法给父组件调用
defineExpose({
  open: openModal,
  close: closeModal
});
</script>

<style scoped>
/* 可选：为图片预览模态框添加样式 */
.image-preview-modal .modal-body img {
  max-height: 70vh; /* 限制图片最大高度 */
  object-fit: contain; /* 保持图片比例 */
}

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

.resource-image {
  height: 180px; /* 固定高度 */
  object-fit: cover; /* 保持比例填充 */
  cursor: pointer; /* 提示可点击 */
}

.image-wrapper {
  position: relative;
  overflow: hidden;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明遮罩 */
  opacity: 0; /* 默认隐藏 */
  transition: opacity 0.3s ease;
}

.resource-card:hover .image-overlay {
  opacity: 1; /* 悬停时显示 */
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