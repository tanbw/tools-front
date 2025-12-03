<!-- src/components/CopyList.vue -->
<template>
  <div class="copy-list-container">
    <PaginatedTable ref="paginatedTableRef" api-url="/api/video/list" :initial-params="params" :fields="tableFields"
      :page-size="params.size" @row-clicked="handleSelect">
      <template #cell(title)="slotProps">
        <div class="truncate-cell">{{ slotProps.item.title }}</div>
      </template>
      <template #cell(state)="slotProps">
        {{ slotProps.item.state }} <i v-show="slotProps.item.state.includes('失败')||['视频生成成功'].includes(slotProps.item.state)" :id="`trigger-${slotProps.item.id}`"
          @click="showLog(slotProps.item.id)" class="fa-solid fa-circle-info"
          :ref="el => setTriggerRef(el, slotProps.item.id)">
        </i>
        <!-- 将 BPopover 的 target 指向触发元素的 ID -->
        <BPopover :target="`trigger-${slotProps.item.id}`" click placement="bottom">
          <template #title>
            <div class="d-flex justify-content-between align-items-center">
              <span>日志信息 (ID: {{ slotProps.item.id }})</span>
              <!-- 可选：添加一个加载指示器图标 -->
              <i v-if="loadingLog && currentLogId === slotProps.item.id" class="fas fa-spinner fa-spin"></i>
            </div>
          </template>
          <div>
            <!-- 显示加载状态 -->
            <div v-if="loadingLog && currentLogId === slotProps.item.id" class="text-center py-2">
              <div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">加载中...</span>
              </div>
            </div>
            <!-- 显示日志数据 -->
            <div v-else-if="logData && logData.length > 0 && logData[0]" class="log-list">
              <!-- 默认显示第一条 -->
              <div class="log-item mb-2 p-2 border rounded bg-light">
                <div class="log-header d-flex justify-content-between">
                  <strong>{{ logData[0].type }}</strong>&nbsp;
                  <small class="text-muted">{{ formatDate(logData[0].createTime, 'MM-dd') }}</small>
                </div>
                <div class="log-content mt-1">{{ logData[0].content }}</div>
              </div>

              <!-- 展开/收起按钮 -->
              <b-button v-if="logData.length > 1" variant="link" size="sm" class="p-0 mb-2 text-decoration-none"
                @click="toggleShowAllLogs">
                {{ showAllLogs ? '隐藏其余日志' : `展开其余 ${logData.length - 1} 条日志` }}
              </b-button>

              <!-- 显示其余日志 (条件渲染) -->
              <div v-if="showAllLogs && logData.length > 1" class="remaining-logs">
                <div v-for="(log, index) in logData.slice(1)" :key="index"
                  class="log-item mb-2 p-2 border rounded bg-light">
                  <div class="log-header d-flex justify-content-between">
                    <strong>{{ log.type }}</strong>&nbsp;
                    <small class="text-muted">{{ formatDate(log.createTime, 'MM-dd') }}</small>
                  </div>
                  <div class="log-content mt-1">{{ log.content }}</div>
                </div>
              </div>
            </div>
            <!-- 显示无数据或错误信息 -->
            <div v-else-if="logData === null||logData.length==0">
              <p class="text-muted mb-0">暂无日志数据</p>
            </div>
            <div v-else>
              <p class="text-muted mb-0">加载日志失败</p>
            </div>
          </div>
        </BPopover>
      </template>
      <template #cell(actions)="slotProps">
        <div class="d-flex gap-1">
          <!-- 删除按钮 -->
          <a v-if="['就绪', '后处理失败', '语音生成失败', '原始视频生成失败', '视频生成成功', '失败，余额不足'].includes(slotProps.item.state)"
            :id="`delete-btn-${slotProps.item.id}`" href="#"
            class="btn btn-sm btn-outline-danger p-1 text-decoration-none"
            @click.prevent="prepareToDelete(slotProps.item)">
            <i class="fas fa-trash"></i>
          </a>
          <BTooltip :target="`delete-btn-${slotProps.item.id}`" placement="top">
            删除视频
          </BTooltip>

          <a v-if="['视频生成成功'].includes(slotProps.item.state)" :id="`download-video-btn-${slotProps.item.id}`"
            :href="`/api/video/download/${slotProps.item.id}`"
            class="btn btn-sm btn-outline-primary p-1 text-decoration-none">
            <i class="fas fa-download"></i>
          </a>
          <BTooltip :target="`download-video-btn-${slotProps.item.id}`" placement="top">
            下载剪辑后的视频
          </BTooltip>
           <a v-if="['视频生成成功','原始视频生成成功'].includes(slotProps.item.state)" :id="`download-highvideo-btn-${slotProps.item.id}`"
            :href="`/api/video/download/highvideo/${slotProps.item.id}`"
            class="btn btn-sm btn-outline-primary p-1 text-decoration-none">
            <i class="fas fa-download"></i>
          </a>
          <BTooltip :target="`download-highvideo-btn-${slotProps.item.id}`" placement="top">
            下载剪辑前的视频
          </BTooltip>
          <a v-if="['视频生成成功'].includes(slotProps.item.state)" :id="`download-draft-btn-${slotProps.item.id}`"
            :href="`/api/video/download/draft/${slotProps.item.id}`"
            class="btn btn-sm btn-outline-info p-1 text-decoration-none">
            <i class="fas fa-file-download"></i>
          </a>
          <BTooltip :target="`download-draft-btn-${slotProps.item.id}`" placement="top">
            下载草稿
          </BTooltip>

          <a v-if="['视频生成成功'].includes(slotProps.item.state)" :id="`view-video-btn-${slotProps.item.id}`" href="#"
            class="btn btn-sm btn-outline-success p-1 text-decoration-none"
            @click.prevent="showVideoModal(slotProps.item.id)">
            <i class="fas fa-eye"></i>
          </a>
          <BTooltip :target="`view-video-btn-${slotProps.item.id}`" placement="top">
            查看视频
          </BTooltip>
        </div>
      </template>
    </PaginatedTable>
  </div>
  <ConfirmationModal v-model="showDeleteModal" modal-id="deleteConfirmModal" :on-ok="confirmDelete">
    <p class="mb-2">确定要删除以下视频吗？</p>
    <p class="fw-bold text-muted mb-3">{{ itemToDelete?.title }}</p>
    <p class="text-warning-emphasis mb-0"><small>此操作不可撤销。</small></p>
  </ConfirmationModal>
  <VideoModal :show="showModal" :video-url="videoUrl" @close="closeModal"/>
</template>

<script setup lang="ts">
import { reactive, ref, useTemplateRef } from 'vue';
import PaginatedTable from './PaginatedTable.vue'; // 导入通用组件
import { VideoItem, ListParams, TaskLog } from '../types'; // 导入 CopyItem 和 ListParams
import { formatDate } from '../utils/api'; // 导入日期格式化函数
import { apiCall } from '../utils/api';
import { useToast } from 'vue-toastification';
import VideoModal from './VideoModal.vue';
import { BPopover } from 'bootstrap-vue-next/components/BPopover'
import { type ComponentPublicInstance } from 'vue'
const showModal = ref<boolean>(false);
const videoUrl = ref<string>('');
const showVideoModal = (id: string) => {
  showModal.value = true;
  videoUrl.value = "/api/video/play/" + id;
};
const closeModal=()=>{
  showModal.value=false;
  videoUrl.value = '';
}
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
const triggerRefs = ref<Map<string, Element | null>>(new Map());

const setTriggerRef = (el: Element | ComponentPublicInstance | null, id: string) => {
  if (el && (el as Element).nodeType) { // 检查是否是 DOM 节点
    triggerRefs.value.set(id, el as Element); // 或 el as HTMLElement 如果你确定
  } else {
    triggerRefs.value.delete(id);
  }
};
const logData = ref<TaskLog[] | null>(null); // 存储日志数组
const loadingLog = ref<boolean>(false); // 标记是否正在加载日志
const currentLogId = ref<number | null>(null); // 记录当前正在查看日志的项的 ID
const showAllLogs = ref<boolean>(false); // 控制是否显示所有日志
const showLog = async (id: number) => {
  currentLogId.value = id;
  loadingLog.value = true;
  logData.value = null; // 清空旧数据
  showAllLogs.value = false; // 重置展开状态

  try {
    const response = await apiCall<TaskLog[]>(`/api/video/${id}/logs`, {
      method: 'GET',
    });
    logData.value = response;
  } catch (error) {
    console.error(`获取 ID ${id} 的日志失败:`, error);
  } finally {
    loadingLog.value = false;
  }
};
const toggleShowAllLogs = () => {
  showAllLogs.value = !showAllLogs.value;
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
  {
    key: 'title', label: '标题', sortable: true,
    thStyle: { width: '30%' },
  },
  { key: 'createTime', label: '创建时间', sortable: true, thStyle: { width: '13%' },formatter: (value: string) => formatDate(value) },
  { key: 'state', label: '状态', sortable: true },
  { key: 'durationMin', label: '时长(分)', sortable: true,thStyle: { width: '12%' },},
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

.popover .popover-body .log-list {
  width: 200px;
  max-height: 400px;
  /* 限制 Popover 内容最大高度 */
  overflow-y: auto;
  /* 超出时显示滚动条 */
}

.log-item {
  background-color: #f8f9fa;
  border-left: 3px solid #0d6efd;
  /* 添加侧边栏颜色区分 */
}

.log-header {
  font-size: 0.875rem;
  /* 稍微缩小字体 */
}

.log-content {
  font-size: 0.85rem;
  /* 稍微缩小字体 */
  white-space: pre-wrap;
  /* 保留换行符 */
}



/* 为按钮添加一些样式，使其更像按钮而不是链接 */
.btn-outline-danger.p-1,
.btn-outline-primary.p-1,
.btn-outline-info.p-1,
.btn-outline-success.p-1 {
  border-radius: 0.25rem;
  /* 可选：调整圆角 */
}
</style>