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
        :sort-by="sortByArray"
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
import type {BTableSortBy, TableFieldRaw, TableItem} from 'bootstrap-vue-next'
type EventHandler<T extends any[]> = (...args: T) => void;

const slots = useSlots(); // 使用 useSlots

const toast = useToast();

// ✅ 移除未使用的默认处理函数参数
const defaultPageChangeHandler = (/* page: number */) => {};
const defaultSortChangeHandler = (/* field: string, direction: 'asc' | 'desc' */) => {};
const defaultRowClickHandler = (/* item: any, index: number, event: Event */) => {};
const defaultLoadingChangeHandler = (/* loading: boolean */) => {};

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
  // ✅ 修复：'right' -> 'end'
  paginationAlign?: 'fill' | 'center' | 'end';
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
  // ✅ 修复：'right' -> 'end'
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

const sortByArray = computed<BTableSortBy[]>(() => {
  const sortInfo = internalData.value?.sort?.sort?.[0]; // 假设只处理第一个排序字段
  if (sortInfo && sortInfo.property) {
    return [{
      key: sortInfo.property,
      order: sortInfo.direction?.toLowerCase() as 'asc' | 'desc' || 'asc' // ✅ 使用 'order'，并提供默认值 'asc'
    }];
  }
  return []; // 如果没有排序信息，返回空数组
});

// ✅ 移除原来的 sortField 和 sortDesc 计算属性
// const sortField = computed(() => internalData.value?.sort?.sort?.[0]?.property);
// const sortDesc = computed(() => internalData.value?.sort?.sort?.[0]?.direction === 'DESC');

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
    console.log('Full URL for loadData:', fullUrl);
    const result = await apiCall<Page<any>>(fullUrl);
    console.log('Data loaded from loadData:', result);
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
watch(() => props.initialParams, (newInitialParams) => {
  Object.assign(params.value, newInitialParams);
}, { deep: true });

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

const handlePageChange = (/* newPage: number */) => {
  // 逻辑由 currentPage setter 处理
};

const handleSortChanged = (ctx: any) => {
  if (ctx.field && ctx.direction) {
    params.value.sort = `${ctx.field},${ctx.direction}`;
    params.value.page = 0; // 排序变化时通常回到第一页
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
:deep(table) {
  table-layout: fixed;
  width: 100%;
}
</style>