<!-- src/components/CopyList.vue -->
<template>
    <div class="row">
          <label class="form-label">筛选作者：</label>
          <select v-model="params.author"
                  class="form-select">
            <option value="">全部作者</option>
             <option value="周小鹏">周小鹏</option>
          </select>
        </div>
        <div class="row">
          <div class="col">
    <PaginatedTable
      api-url="/api/copy/download/list"
      :initial-params="params"
      :fields="tableFields"
      :page-size="params.size"
      @row-clicked="handleSelectCopy"
    >
    
     <template #cell(title)="slotProps">
        <div class="truncate-cell">{{ slotProps.item.title }}</div>
      </template>
    </PaginatedTable></div>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import PaginatedTable from './PaginatedTable.vue'; // 导入通用组件
import { DownloadCopyItem, ListParams } from '../types'; // 导入 CopyItem 和 ListParams
import { formatDate } from '../utils/api'; // 导入日期格式化函数


// 定义 emits
const emit = defineEmits<{
  'select-copy': [copyData: DownloadCopyItem, source: string]
}>();

class DownloadCopyListParams extends ListParams {
  author?: string | null = '';

  constructor(init?: Partial<DownloadCopyListParams>) {
    super(init);
    Object.assign(this, init);
  }
}
// 分页参数 (用于 initialParams)
const params = reactive<DownloadCopyListParams>(new DownloadCopyListParams());

// 定义表格列
const tableFields = [
  { key: 'title', label: '标题', sortable: true ,thStyle: { width: '50%' }},
  { key: 'author', label: '作者', sortable: true }, 
  { key: 'createTime', label: '创建时间', sortable: true ,formatter: (value: string) => formatDate(value)},
];

// 选择文案 (通过点击行触发)
const handleSelectCopy = (copy: DownloadCopyItem) => {
  emit('select-copy', copy,'downloadCopy');
};
</script>

<style scoped>

</style>