<!-- src/components/CopyList.vue -->
<template>
  <div class="copy-list-container">
    <PaginatedTable ref="paginatedTableRef" api-url="/api/video/list" :initial-params="params" :fields="tableFields"
      :page-size="params.size" @row-clicked="handleSelect">
      <template #cell(actions)="slotProps">
        <div class="d-flex gap-2">
          <!-- slotProps.item 就是当前行的数据 -->
          <a v-if="['就绪', '后处理失败', '语音生成失败', '原始视频生成失败', '视频生成成功'].includes(slotProps.item.state)" href="#"
            class="text-decoration-none me-2" @click.prevent="prepareToDelete(slotProps.item)">
            删除
          </a>
          <a v-if="['视频生成成功'].includes(slotProps.item.state)" :href="`/api/video/download/${slotProps.item.id}`"
            class="text-decoration-none me-2">
            下载视频
          </a>
           <a v-if="['视频生成成功'].includes(slotProps.item.state)" :href="`/api/video/download/draft/${slotProps.item.id}`"
            class="text-decoration-none me-2">
            下载草稿
          </a>
           <a v-if="['视频生成成功'].includes(slotProps.item.state)" href="#" @click.prevent="showVideoModal(slotProps.item.id)"
            class="text-decoration-none me-2">
            查看视频
          </a>
        </div>
      </template>
    </PaginatedTable>
  </div>
  <ConfirmationModal v-model="showDeleteModal" modal-id="deleteConfirmModal" :on-ok="confirmDelete">
    <p class="mb-2">确定要删除以下视频吗？</p>
    <p class="fw-bold text-muted mb-3">{{ itemToDelete?.title }}</p>
    <p class="text-warning-emphasis mb-0"><small>此操作不可撤销。</small></p>
  </ConfirmationModal>
   <VideoModal :show="showModal"  :video-url="videoUrl"/>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import PaginatedTable from './PaginatedTable.vue'; // 导入通用组件
import { VideoItem, ListParams } from '../types'; // 导入 CopyItem 和 ListParams
import { formatDate } from '../utils/api'; // 导入日期格式化函数
import { apiCall } from '../utils/api';
import { useToast } from 'vue-toastification';
import VideoModal from './VideoModal.vue';
const showModal = ref<boolean>(false);
const videoUrl = ref<string>('');
const showVideoModal = (id:string)=>{
    showModal.value=true;
    videoUrl.value="/api/video/play/"+id;
};
const toast = useToast();
const paginatedTableRef = ref<InstanceType<typeof PaginatedTable> | null>(null);

// 定义 emits
const emit = defineEmits<{
  'select-video': [data: VideoItem]
}>();

// 分页参数 (用于 initialParams)
const params = reactive<ListParams>(new ListParams());
const showDeleteModal = ref<boolean>(false);
const itemToDelete = ref<VideoItem | null>(null);

// 准备删除：记录要删除的项目并显示模态框
const prepareToDelete = (item: VideoItem) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!itemToDelete.value) return; // 防御性编程

  try {
    await apiCall(`/api/video/${itemToDelete.value.id}`, {
      method: 'DELETE',
    });

    toast.success('删除成功');
    if (paginatedTableRef.value && typeof paginatedTableRef.value.refresh === 'function') {
      paginatedTableRef.value.refresh();
    } else {
      console.warn('PaginatedTable ref not available or refresh method not found');
    }

  } catch (error) {
    console.error('删除出错:', error);
  } finally {
    showDeleteModal.value = false;
    itemToDelete.value = null;
  }
};

// 定义表格列 (不再包含 formatter)
const tableFields = [
  { key: 'title', label: '标题', sortable: true },
  { key: 'createTime', label: '创建时间', sortable: true, formatter: (value: string) => formatDate(value) },
  { key: 'state', label: '状态', sortable: true },
  { key: 'duration', label: '时长', sortable: true },
  { key: 'actions', label: '操作', sortable: false },
];


// 选择文案 (通过点击行触发)
const handleSelect = (copy: VideoItem) => {
  emit('select-video', copy);
};
</script>

<style scoped>
#deleteConfirmModal .modal-header {
  padding: 1rem 1rem 0;
}

#deleteConfirmModal .modal-body {
  padding: 0 1.5rem 1rem;
}

#deleteConfirmModal .modal-footer {
  padding: 0.75rem 1rem 1rem;
  gap: 0.5rem;
  /* 按钮间距 */
}
</style>