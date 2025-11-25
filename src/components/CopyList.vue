<!-- src/components/CopyList.vue -->
<template>
  <div class="copy-list-container">
    <PaginatedTable
      ref="paginatedTableRef"
      api-url="/api/copy/list"
      :initial-params="params"
      :fields="tableFields"
      :page-size="params.size"
      @row-clicked="handleSelectCopy"
      :on-sort-change="handleSortChange" 
      :on-error="handleError" 
      :on-loading-change="handleLoadingChange" 
    >
       <template #cell(actions)="slotProps">
        <div class="d-flex gap-2">
          <!-- slotProps.item 就是当前行的数据 -->
          <a href="#" class="text-decoration-none me-2" @click.prevent="prepareToDelete(slotProps.item)">
            删除
          </a>
        </div>
      </template>
    </PaginatedTable>
  </div>
     <ConfirmationModal
      v-model="showDeleteModal"
      modal-id="deleteConfirmModal"
      :on-ok="confirmDelete" 
    >
      <p class="mb-2">确定要删除以下文案吗？</p>
      <p class="fw-bold text-muted mb-3">{{ itemToDelete?.title }}</p>
      <p class="text-warning-emphasis mb-0"><small>此操作不可撤销。</small></p>
    </ConfirmationModal>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import PaginatedTable from './PaginatedTable.vue'; // 导入通用组件
import { CopyItem, ListParams } from '../types'; // 导入 CopyItem 和 ListParams
import { formatDate } from '../utils/api'; // 导入日期格式化函数
import { apiCall } from '../utils/api';
import { useToast } from 'vue-toastification';
const toast = useToast();
const paginatedTableRef = ref<InstanceType<typeof PaginatedTable> | null>(null);

// 定义 emits
const emit = defineEmits<{
  'select-copy': [copyData: CopyItem, source: string]
}>();

// 分页参数 (用于 initialParams)
const params = reactive<ListParams>(new ListParams());
const showDeleteModal = ref<boolean>(false);
const itemToDelete = ref<CopyItem | null>(null);

// 准备删除：记录要删除的项目并显示模态框
const prepareToDelete = (item: CopyItem) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!itemToDelete.value) return; // 防御性编程

  try {
    await apiCall(`/api/copy/${itemToDelete.value.id}`, {
      method: 'DELETE',
    });
    toast.success('删除成功');

    // 刷新列表
    if (paginatedTableRef.value && typeof paginatedTableRef.value.refresh === 'function') {
      paginatedTableRef.value.refresh();
    } else {
      console.warn('PaginatedTable ref not available or refresh method not found');
    }

  } catch (error) {
    console.error('删除文案出错:', error);
    toast.error('删除失败');
  } finally {
    showDeleteModal.value = false;
    itemToDelete.value = null;
  }
};

// 处理 PaginatedTable 的 loading-change 事件
const handleLoadingChange = (isLoading: boolean) => {
  console.log('Loading state changed in CopyList:', isLoading);
};

// 处理 PaginatedTable 的 error 事件
const handleError = (err: Error) => {
  console.error('CopyList received error from PaginatedTable:', err);
};

// 定义表格列 (不再包含 formatter)
const tableFields = [
  { key: 'title', label: '标题', sortable: true },
  { key: 'createTime', label: '创建时间', sortable: true ,formatter: (value: string) => formatDate(value)},
  { key: 'actions', label: '操作', sortable: false },
];

// 处理排序变化
const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
  console.log('Sort changed in CopyList:', field, direction);
};

// 选择文案 (通过点击行触发)
const handleSelectCopy = (copy: CopyItem) => {
  emit('select-copy', copy,'copy');
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
  gap: 0.5rem; /* 按钮间距 */
}
</style>