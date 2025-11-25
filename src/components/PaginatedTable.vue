<!-- src/components/PaginatedTable.vue -->
<template>
  <div class="paginated-table-container">
    <div v-if="loading" class="text-center py-3">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">加载中...</span>
      </div>
    </div>
    <div v-else>
      <b-table
        :items="internalData?.content || []"
        :fields="fields"
        :striped="striped"
        :hover="hover"
        :small="small"
        :sort-by="sortField"
        :sort-desc="sortDesc"
        @sort-changed="handleSortChanged"
        @row-clicked="handleRowClick"
        v-bind="tableProps"
      >
      
        <template v-for="(_, slotName) in slots" v-slot:[slotName]="slotProps">
          <slot :name="slotName" v-bind="slotProps"></slot>
        </template>
      </b-table>

      <div v-if="!(internalData?.content?.length && internalData.content.length > 0)" class="text-muted text-center py-3">
        暂无数据
      </div>

      <b-pagination
        v-if="internalData && internalData.totalElements > 0"
        v-model="currentPage"
        :total-rows="internalData.totalElements"
        :per-page="pageSize"
        :limit="paginationLimit"
        :first-text="paginationText.first"
        :prev-text="paginationText.prev"
        :next-text="paginationText.next"
        :last-text="paginationText.last"
        :ellipsis-text="paginationText.ellipsis"
        :align="paginationAlign"
        @input="handlePageChange"
        v-bind="paginationProps"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, useSlots } from 'vue';
import { useToast } from 'vue-toastification';
import { apiCall } from '../utils/api';
// 修正 import 语句
import  {type Page, ListParams } from '../types';
const slots = useSlots(); // 使用 useSlots

type EventHandler<T extends any[]> = (...args: T) => void;

const toast = useToast();

const defaultPageChangeHandler = (page: number) => {};
const defaultSortChangeHandler = (field: string, direction: 'asc' | 'desc') => {};
const defaultRowClickHandler = (item: any, index: number, event: Event) => {};
const defaultLoadingChangeHandler = (loading: boolean) => {};
const defaultErrorHandler = (error: Error) => {
  console.error('PaginatedTable Default Error Handler:', error);
  toast.error(`加载数据失败: ${error.message || '未知错误'}`);
};

const props = withDefaults(defineProps<{
  apiUrl: string;
  initialParams?: ListParams;
  fields: any[];
  pageSize: number;
  striped?: boolean;
  hover?: boolean;
  small?: boolean;
  tableProps?: Record<string, any>;
  paginationLimit?: number;
  paginationText?: {
    first: string;
    prev: string;
    next: string;
    last: string;
    ellipsis: string;
  };
  paginationAlign?: 'fill' | 'center' | 'right';
  paginationProps?: Record<string, any>;
  onPageChange?: EventHandler<[page: number]>;
  onSortChange?: EventHandler<[field: string, direction: 'asc' | 'desc']>;
  onRowClicked?: EventHandler<[item: any, index: number, event: Event]>;
  onLoadingChange?: EventHandler<[loading: boolean]>;
  onError?: EventHandler<[error: Error]>;
}>(), {
  initialParams: () => new ListParams(),
  striped: true,
  hover: true,
  small: false,
  tableProps: () => ({}),
  paginationLimit: 7,
  paginationText: () => ({
    first: '首页',
    prev: '上一页',
    next: '下一页',
    last: '末页',
    ellipsis: '...',
  }),
  paginationAlign: 'center',
  paginationProps: () => ({}),
});

const resolvedPageChangeHandler = props.onPageChange || defaultPageChangeHandler;
const resolvedSortChangeHandler = props.onSortChange || defaultSortChangeHandler;
const resolvedRowClickHandler = props.onRowClicked || defaultRowClickHandler;
const resolvedLoadingChangeHandler = props.onLoadingChange || defaultLoadingChangeHandler;
const resolvedErrorHandler = props.onError || defaultErrorHandler;

// 响应式数据
const internalData = ref<Page<any> | null>(null);
const loading = ref<boolean>(false);
const error = ref<Error | null>(null);

const params = ref<ListParams>(new ListParams({ ...props.initialParams }));

// 计算属性
const currentPage = computed({
  get: () => {
    // 从后端获取的 internalData.number 是 0-based，转换为 1-based 用于 b-pagination
    return (internalData.value?.number ?? 0) + 1;
  },
  set: (value: number) => {
    // b-pagination 传入的 value 是 1-based，转换为 0-based 用于 params 和 API 请求
    const zeroBasedPage = value - 1;
    params.value.page = zeroBasedPage;
    resolvedPageChangeHandler(zeroBasedPage); // 将 0-based 页码传递给处理函数
  }
});

const sortField = computed(() => internalData.value?.sort?.sort?.[0]?.property);
const sortDesc = computed(() => internalData.value?.sort?.sort?.[0]?.direction === 'DESC');

// 加载数据的函数
const loadData = async () => {
  loading.value = true;
  resolvedLoadingChangeHandler(true);

  try {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params.value)) {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    }

    const fullUrl = `${props.apiUrl}?${queryParams.toString()}`;
    console.log('Full URL for loadData:', fullUrl); // 添加调试日志
    const result = await apiCall<Page<any>>(fullUrl);
    console.log('Data loaded from loadData:', result); // 添加调试日志
    internalData.value = result;
  } catch (err) {
    console.error('PaginatedTable Load Data Error:', err);
    error.value = err as Error;
    resolvedErrorHandler(err as Error);
  } finally {
    loading.value = false;
    resolvedLoadingChangeHandler(false);
  }
};
// 监听 props.initialParams 的变化，同步到内部 params
// 这样当 CopyList 中的 params.author 改变并传递给 initialParams 时，
// PaginatedTable 内部的 params 也会更新，从而触发 loadData
watch(() => props.initialParams, (newInitialParams) => {
  // 使用 Object.assign 或扩展运算符来更新内部 params 的属性
  // 这样可以保留内部 params 的响应性
  // 注意：这会用 newInitialParams 覆盖 params 的所有属性
  // 如果只想更新部分属性（如 author），可以只更新特定字段
  Object.assign(params.value, newInitialParams);
}, { deep: true }); // 对于 ListParams 这样的对象，deep watch 是必要的
// 监听 params 变化
watch(params, () => {
  loadData();
}, { deep: true });

// 初始加载
loadData();

// 处理事件
const handleRowClick = (item: any, index: number, event: Event) => {
  resolvedRowClickHandler(item, index, event);
};

const handlePageChange = (newPage: number) => {};

const handleSortChanged = (ctx: any) => {
  if (ctx.field && ctx.direction) {
    params.value.sort = `${ctx.field},${ctx.direction}`;
    params.value.page = 0;
    resolvedSortChangeHandler(ctx.field, ctx.direction);
  }
};

// 暴露一个 refresh 方法
const refresh = () => {
  loadData();
};

// 使用 defineExpose 暴露方法给父组件
defineExpose({ refresh });
</script>

<style scoped>
.paginated-table-container {
  /* 你的样式 */
}
</style>