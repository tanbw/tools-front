<template>
  <div class="user-operation-log-list-container">
    <!-- 搜索/筛选区域 -->
    <b-card class="mb-3 shadow-sm">
      <b-form @submit.prevent="applyFilters">
        <b-row>
          <b-col md="4">
            <b-form-group label="开始日期" label-for="start-date-filter">
              <BFormInput id="start-date-filter" type="datetime-local" v-model="params.startDate" locale="zh-CN"
                placeholder="选择开始日期" />

            </b-form-group>
          </b-col>
          <b-col md="4">
            <b-form-group label="结束日期" label-for="end-date-filter">
              <BFormInput id="end-date-filter" type="datetime-local" v-model="params.endDate" locale="zh-CN"
                placeholder="选择结束日期" />

            </b-form-group>
          </b-col>
          <b-col md="4" class="d-flex align-items-end">
            <b-button type="submit" variant="primary" class="me-2">搜索</b-button>
            <b-button type="button" variant="outline-secondary" @click="resetFilters">重置</b-button>
          </b-col>
        </b-row>
      </b-form>
    </b-card>

    <!-- 分页表格 -->
    <PaginatedTable ref="paginatedTableRef" api-url="/api/users/logs/page" :initial-params="params"
      :fields="tableFields" :page-size="params.size">
      <!-- 格式化 createTime 列 -->
      <template #cell(createTime)="slotProps">
        {{ formatDate(slotProps.item.createTime) }}
      </template>
    </PaginatedTable>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useToast } from 'vue-toastification';
import PaginatedTable from './PaginatedTable.vue'; // 导入通用组件
import { UserOperationLog, ListParams } from '../types'; // 导入 UserOperationLog 和 ListParams
import { formatDate } from '../utils/api'; // 导入日期格式化函数

const toast = useToast();
const paginatedTableRef = ref<InstanceType<typeof PaginatedTable> | null>(null);

// --- Extended Params Class ---
class UserOperationLogListParams extends ListParams {
  startDate?: string | null = null; // 用于传递给后端的格式化日期字符串
  endDate?: string | null = null;   // 用于传递给后端的格式化日期字符串

  constructor(init?: Partial<UserOperationLogListParams>) {
    super(init);
    Object.assign(this, init);
  }
}

// --- Initial Params with Filters ---
const params = reactive<UserOperationLogListParams>(new UserOperationLogListParams());

// --- Table Fields ---
const tableFields = [
  { key: 'operationLog.type', label: '操作', sortable: true },
  { key: 'balanceIncrMin', label: '时间余额变化（分）', sortable: true,  },
  { key: 'balanceMin', label: '时间余额（分）', sortable: true,  },
  { key: 'balanceTokenM', label: 'Token余额(M)', sortable: true,  },
  { key: 'balanceTokenIncr', label: 'Token余额变化', sortable: true,  },
  { key: 'operationLog.createTime', label: '时间', sortable: true, formatter: (value: Date) => formatDate(value,'yyyy-MM-dd HH:mm:ss')  },
];

// --- Methods ---
const applyFilters = () => {
  // params.startDate 和 params.endDate 已经是格式化后的字符串
  // 或者在这里进行进一步处理，例如日期格式转换
  // params.startDate = filters.startDate ? formatDate(filters.startDate, 'YYYY-MM-DD') : null;
  // params.endDate = filters.endDate ? formatDate(filters.endDate, 'YYYY-MM-DD') : null;

  // 可能需要重置页码
  params.page = 0;
  // 触发 PaginatedTable 刷新
  if (paginatedTableRef.value && typeof paginatedTableRef.value.refresh === 'function') {
    paginatedTableRef.value.refresh();
  }
};

const resetFilters = () => {
  // 直接重置 params 对象上的筛选字段
  params.startDate = null;
  params.endDate = null;
  params.page = 0; // 重置页码
  // 触发 PaginatedTable 刷新
  if (paginatedTableRef.value && typeof paginatedTableRef.value.refresh === 'function') {
    paginatedTableRef.value.refresh();
  }
};

// --- Initial Load ---
// PaginatedTable 会在 mounted 时自动加载，应用初始 params
</script>

<style scoped>
.user-operation-log-list-container {
  /* 你的样式 */
}
</style>