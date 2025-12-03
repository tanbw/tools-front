<template>
  <div class="container-fluid">
    <div class="row">
      <!-- 左侧表单区域 -->
      <div class="col-5">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">{{ form.id ? '编辑模版' : '新建模版' }}</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveTemplate">
              <div class="mb-3">
                <label for="templateName" class="form-label">模版名称 *</label>
                <input
                  type="text"
                  class="form-control"
                  id="templateName"
                  v-model="form.name"
                  required
                  placeholder="输入模版名称"
                />
              </div>
              
              <!-- 音乐选择区域 -->
              <div class="mb-4">
                <div class="card shadow-sm">
                  <div class="card-header bg-light">
                    <h6 class="mb-0 d-flex justify-content-between align-items-center">
                      <span>选择背景音乐</span>
                      <a href="#" class="text-decoration-none" @click.prevent="openMusicSelector">
                        <i class="fas fa-edit me-1"></i> 更换
                      </a>
                    </h6>
                  </div>
                  <div class="card-body text-center">
                    <div v-if="form.musicId" class="mb-2">
                      <audio :src="`/api/resources/${form.musicId}/raw`" controls class="w-100"></audio>
                    </div>
                    <div v-else class="text-muted py-4">
                      <i class="fas fa-music fa-3x mb-2 text-secondary"></i>
                      <p>尚未选择背景音乐</p>
                    </div>
                    <b-button variant="outline-primary" size="sm" @click="openMusicSelector" class="mt-2">
                      <i class="fas fa-plus me-1"></i> 选择背景音乐
                    </b-button>
                  </div>
                </div>
              </div>
              <!-- /音乐选择区域 -->

              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" @click="resetForm">
                  新建
                </button>
                <button type="submit" class="btn btn-primary">
                  {{ form.id ? '更新' : '保存' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- 右侧列表区域 -->
      <div class="col-7">
        <div class="card">

          <div class="card-body p-0">
            <b-table
              :items="templateList"
              :fields="tableFields"
              striped
              hover
              small
              responsive
              @row-clicked="handleRowClick"
              class="mb-0" 
            >
          
              <template #cell(actions)="slotProps">
                <div class="d-flex gap-2">
                  <a href="#" v-if="currentUser?.draftId!=slotProps.item.id" class="text-decoration-none me-2" @click.prevent="setDefault(slotProps.item)">
                    设为默认
                  </a>
                  <a href="#" class="text-decoration-none me-2" @click.prevent="prepareToDelete(slotProps.item)">
                    删除
                  </a>
                </div>
              </template>
            </b-table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 音乐选择模态框 -->
  <AudioSelectionModal
    ref="audioSelectorModal"
    id="draft-template-music-selector-modal"
    title="请选择一个背景音乐"
    :initial-resource-id="form.musicId"
    @selected="onMusicSelected"
    @hidden="onSelectorHidden"
    filterType="music"
  />

  <!-- 删除确认模态框 -->
  <ConfirmationModal
    v-model="showDeleteModal"
    modal-id="deleteDraftTemplateConfirmModal"
    :on-ok="confirmDelete"
  >
    <p class="mb-2">确定要删除以下剪辑模版吗？</p>
    <p class="fw-bold text-muted mb-3">{{ itemToDelete?.name }}</p>
    <p class="text-warning-emphasis mb-0"><small>此操作不可撤销。</small></p>
  </ConfirmationModal>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { BTable, BButton } from 'bootstrap-vue-next';
import { apiCall,formatDate,loadUser } from '../utils/api';
import { useToast } from 'vue-toastification';
import { DraftTemplate, type ModalComponent,type User } from '../types';
import AudioSelectionModal from './AudioSelectionModal.vue';
import ConfirmationModal from './ConfirmationModal.vue'; // 假设你有这个组件

const toast = useToast();

// 响应式数据
const templateList = ref<DraftTemplate[]>([]);
const form = reactive(new DraftTemplate());
const audioSelectorModal = ref<ModalComponent | null>(null);

// 删除确认相关
const showDeleteModal = ref<boolean>(false);
const itemToDelete = ref<DraftTemplate | null>(null);

// 定义表格列
const tableFields = [
  { key: 'name', label: '名称', sortable: true },
  { key: 'createTime', label: '创建时间', sortable: true, formatter: (value: unknown) => formatDate(value as Date) },
  { key: 'actions', label: '操作' },
];
const setDefault=async(item:DraftTemplate)=>{
try {
    const response = await apiCall<DraftTemplate[]>('/api/drafts/'+item.id+'/default', { method: 'PUT' });
    if(currentUser.value)
      currentUser.value.draftId=item.id;
    toast.success('设置默认剪辑模版成功');
  } catch (error) {
    console.error('设置默认剪辑模版失败:', error);
    toast.error('设置默认剪辑模版失败');
  }
}
const currentUser=ref<User|null>();
const loadCurrentUser=async()=>{
  currentUser.value=await loadUser();
}
// 获取模版列表
const loadTemplates = async () => {
  try {
    const response = await apiCall<DraftTemplate[]>('/api/video/drafts/my', { method: 'GET' });
    templateList.value = response;
  } catch (error) {
    console.error('加载剪辑模版失败:', error);
    toast.error('加载模版列表失败');
  }
};

// 重置表单 (用于新建或取消编辑)
const resetForm = () => {
  Object.assign(form, new DraftTemplate());
  // 可选：清除表单验证状态等
};

// 点击列表行，加载数据到表单
const handleRowClick = (item: DraftTemplate) => {
  Object.assign(form, { ...item });
};

// 保存模版 (新建或更新)
const saveTemplate = async () => {
  if (!form.name) {
    toast.warning('模版名称不能为空');
    return;
  }

  try {
    let response: DraftTemplate;
    if (form.id) {
      // 更新
      response = await apiCall<DraftTemplate>(`/api/drafts/${form.id}`, {
        method: 'PUT',
        data: form,
      });
      toast.success('模版更新成功');
      // 更新列表中的对应项
      const index = templateList.value.findIndex(t => t.id === form.id);
      if (index > -1) {
        templateList.value[index] = response;
      }
    } else {
      // 新建
      response = await apiCall<DraftTemplate>('/api/drafts', {
        method: 'POST',
        data: form,
      });
      toast.success('模版创建成功');
      // 将新项添加到列表
      templateList.value.push(response);
    }
    // 可选：保存后清空表单
    // resetForm();
  } catch (error) {
    console.error('保存剪辑模版失败:', error);
    toast.error('保存失败');
  }
};

// 准备删除：记录要删除的项目并显示模态框
const prepareToDelete = (item: DraftTemplate) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
};

// 确认删除
const confirmDelete = async () => {
  if (!itemToDelete.value || !itemToDelete.value.id) return; // 防御性编程

  try {
    await apiCall(`/api/drafts/${itemToDelete.value.id}`, { method: 'DELETE' });
    toast.success('模版删除成功');
    // 从列表中移除
    templateList.value = templateList.value.filter(t => t.id !== itemToDelete.value!.id);
    // 如果删除的是当前正在编辑的项，则重置表单
    if (form.id === itemToDelete.value.id) {
      resetForm();
    }
  } catch (error) {
    console.error('删除剪辑模版失败:', error);
    toast.error('删除失败');
  } finally {
    showDeleteModal.value = false;
    itemToDelete.value = null;
  }
};

// --- 音乐选择相关 ---
const openMusicSelector = () => {
  if (audioSelectorModal.value) {
    audioSelectorModal.value.open();
  }
};

const onMusicSelected = (resourceId: number) => {
  form.musicId = resourceId;
};

const onSelectorHidden = () => {
  console.log('音乐选择器已关闭');
};

// 页面加载时获取列表
onMounted(async() => {
  await loadCurrentUser();
  await loadTemplates();
});
</script>

<style scoped>
.card {
  margin-bottom: 1rem; /* 保持卡片间距 */
}
</style>