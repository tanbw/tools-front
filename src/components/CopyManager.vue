<template>
  <div class="container-fluid">
    <div class="row mb-3">
      <div class="col-7">
        <form>

          <div class="row mb-3">
            <div class="col">
              <label class="form-label">标题：</label>
              <LoadingLink href="#" class="text-decoration-none me-2" @click="generateTitle" start-message="正在想标题..."
                success-message="标题想好了！" error-message="想标题出错了">
                根据内容想标题</LoadingLink>
              <textarea v-model="form.title" class="form-control" placeholder="输入视频标题" />
            </div>
          </div>

          <div class="row mb-3">
            <div class="col">
              <label class="form-label">参考风格：</label>
              <LoadingLink href="#" class="text-decoration-none me-2" @click="rewriteContent" start-message="正在洗稿..."
                success-message="洗稿成功！" error-message="洗稿出错了">
                洗稿</LoadingLink>
              <LoadingLink href="#" class="text-decoration-none me-2" @click="randomRewrite" start-message="正在洗稿..."
                success-message="洗稿成功！" error-message="洗稿出错了">随机洗稿</LoadingLink>

              <label class="ms-2">字数：</label>
              <input v-model.number="form.contentCount" style="width: 70px;" class="form-control d-inline-block"
                placeholder="字数" />

              <textarea v-model="form.refStyle" class="form-control mt-2" placeholder="在这里输入你喜欢的文字风格的参考"
                style="height: 200px;"></textarea>
            </div>
          </div>

          <div class="row mb-3">
            <div class="col">
              <label class="form-label">内容（建议不超过1000字）：</label>
              <a href="#" class="text-decoration-none me-2" @click.prevent="restoreOriginal">还原初稿</a>
              <textarea v-model="form.content" class="form-control" style="height: 300px;"></textarea>
              <input type="hidden" v-model="form.oriContent" />
            </div>
          </div>

          <!-- ✅ 重新设计：资源选择部分 -->
          <div class="row mb-4">
            <div class="col-6">
              <div class="card shadow-sm">
                <div class="card-header bg-light">
                  <h6 class="mb-0 d-flex justify-content-between align-items-center">
                    <span>选择视频参考图</span>
                    <a href="#" class="text-decoration-none" @click.prevent="openImageSelector">
                      <i class="fas fa-edit me-1"></i> 更换
                    </a>
                  </h6>
                </div>
                <div class="card-body text-center">
                  <div v-if="form.promptPic" class="mb-2">
                    <BImg :src="'/api/resources/' + form.promptPic + '/raw'" alt="选中的视频参考图"
                      style="max-width: 100%; max-height: 200px; object-fit: contain;" class="img-fluid rounded" />
                    
                  </div>
                  <div v-else class="text-muted py-4">
                    <i class="fas fa-image fa-3x mb-2 text-secondary"></i>
                    <p>尚未选择视频参考图</p>
                  </div>
                  <b-button variant="outline-primary" size="sm" @click="openImageSelector" class="mt-2">
                    <i class="fas fa-plus me-1"></i> 选择视频参考图
                  </b-button>
                </div>
              </div>
            </div>

            <div class="col-6">
              <div class="card shadow-sm">
                <div class="card-header bg-light">
                  <h6 class="mb-0 d-flex justify-content-between align-items-center">
                    <span>选择视频参考语音</span>
                    <a href="#" class="text-decoration-none" @click.prevent="openAudioSelector">
                      <i class="fas fa-edit me-1"></i> 更换
                    </a>
                  </h6>
                </div>
                <div class="card-body text-center">
                  <div v-if="form.promptWav" class="mb-2">
                    <audio :src="'/api/resources/' + form.promptWav + '/raw'" controls class="w-100"></audio>
                   
                  </div>
                  <div v-else class="text-muted py-4">
                    <i class="fas fa-music fa-3x mb-2 text-secondary"></i>
                    <p>尚未选择视频参考语音</p>
                  </div>
                  <b-button variant="outline-primary" size="sm" @click="openAudioSelector" class="mt-2">
                    <i class="fas fa-plus me-1"></i> 选择视频参考语音
                  </b-button>
                </div>
              </div>
            </div>
          </div>
          <!-- /资源选择部分 -->
          <div class="row mb-3">
            <div class="col">
              <label class="form-label">剪辑模版：</label>
                <BFormSelect
                  v-model="form.draftId"
                  :options="draftList"
                  value-field="id"
                  text-field="name"
                > <BFormSelectOption :value="null">无需自动剪辑</BFormSelectOption>
                </BFormSelect>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <button type="button" class="btn btn-info me-2" @click="createNewCopy">新建</button>
              <LoadingButton type="submit" class="btn btn-info me-2" @click="saveCopy" start-message="正在保存..."
                success-message="保存成功" error-message="保存出错">保存</LoadingButton>
              <LoadingButton type="button" class="btn btn-info me-2" @click="saveCopyVideo" start-message="正在保存..."
                success-message="成功" error-message="出错了">保存并生成视频</LoadingButton>
            </div>
          </div>
        </form>
      </div>
      <div class="col-5">
        <div class="row">
          <nav class="nav nav-pills nav-justified">
            <a class="nav-link" :class="{ active: activeTab === 'my' }" aria-current="page" href="#"
              @click.prevent="toTab('my')">
              我的文案
            </a>
            <a class="nav-link" :class="{ active: activeTab === 'public' }" href="#" @click.prevent="toTab('public')">
              公共文案
            </a>
          </nav>
        </div>
        <div class="row" style=" overflow-y: auto;" v-show="activeTab === 'my'">
          <CopyList @select-copy="handleCopySelect" :key="copyListKey" />
        </div>
        <div class="row" style=" overflow-y: auto;" v-show="activeTab === 'public'">
          <DownloadCopyList @select-copy="handleCopySelect" />
        </div>
      </div>
    </div>
  </div>
  <!-- 模态框组件 -->
  <ImageSelectionModal ref="imageSelectorModal" id="my-image-selector-modal" title="请选择一张视频参考图"
    :initial-resource-id="form.promptPic" @selected="onImageSelected" @hidden="onSelectorHidden" />

  <AudioSelectionModal ref="audioSelectorModal" id="my-audio-selector-modal" title="请选择一个视频参考语音"
    :initial-resource-id="form.promptWav" @selected="onAudioSelected" @hidden="onSelectorHidden" />
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import CopyList from './CopyList.vue';
import DownloadCopyList from './DownloadCopyList.vue';
import { apiCall } from '../utils/api';
import { useToast } from 'vue-toastification';
import { CopyItem, VideoItem,DraftTemplate,type User,type ModalComponent} from '../types';
// ✅ 1. 修改导入方式，不使用命名导入
import ImageSelectionModal from './ImageSelectionModal.vue';
import AudioSelectionModal from './AudioSelectionModal.vue';

// 假设你的模态框组件有 defineExpose({ open: ... })
// 为 ref 定义更精确的类型，假设模态框组件暴露了 open 方法


const toast = useToast();

const form = reactive<CopyItem>(new CopyItem());
const draftList = ref<Array<DraftTemplate>>([]); 

const getDraftList = async () => {
  try {
    let response  = await apiCall<Array<DraftTemplate>>("/api/video/drafts/my", {
      method: 'GET',
    });
    // ✅ 将 API 返回的数据赋值给 draftList.value
    draftList.value = response; 
    console.log('Draft list loaded:', response); // 调试日志
  } catch (error) {
    console.error('加载剪辑模版失败:', error);
    toast.error('加载剪辑模版失败');
    // 可以选择将 draftList.value 设为空数组
    draftList.value = [];
  }
};
const copyListKey = ref(0);
watch(
  () => form.content,
  (newVal, oldVal) => {
    form.contentCount = newVal.length;
  }
);
const generateTitle = async () => {
  if (form.content) {
    let response = await apiCall("/api/copy/title", {
      method: 'POST',
      data: form,
      timeout: 240000
    });
    form.title = response + "";
  } else {
    toast.warning('请先输入内容');
  }
};

const rewriteContent = async () => {
  if (form.content) {
    let response = await apiCall("/api/copy/rewrite/my", {
      method: 'POST',
      data: form,
      timeout: 240000
    });
    form.oriContent = form.content;
    form.content = response + "";
  } else {
    toast.warning('请先输入内容');
  }
};

const randomRewrite = async () => {
  if (form.content) {
    let response = await apiCall("/api/copy/rewrite", {
      method: 'POST',
      data: form,
      timeout: 120000
    });
    form.oriContent = form.content;
    form.content = response + "";
  } else {
    toast.warning('请先输入内容');
  }
};

const restoreOriginal = () => {
  if (form.oriContent) {
    form.content = form.oriContent;
    toast.success('已还原初稿');
  } else {
    toast.warning('没有找到初稿内容');
  }
};

const createNewCopy = () => {
  const newDefaultInstance = new CopyItem();
  Object.assign(form, newDefaultInstance);
  loadDefaultUserResources();
  toast.success('已清空表单，可以开始新文案');
};

const saveCopy = async () => {
  if (!form.title || !form.content) {
    toast.warning('标题和内容不能为空');
    return;
  }
  const response = await apiCall<CopyItem>('/api/copy', {
    method: 'POST',
    data: form
  });
  Object.assign(form, response);
  copyListKey.value += 1;
};

const saveCopyVideo = async () => {
  if (!form.title || !form.content) {
    toast.warning('标题和内容不能为空');
    return;
  }
  if(form.content.length>2500){
    toast.warning('内容不能超过2500字');
    return;
  }
  if(!form.promptPic || !form.promptWav) {
    toast.warning('请选择视频参考图和视频参考语音');
    return;
  }
  let response = await apiCall<CopyItem>('/api/copy', {
    method: 'POST',
    data: form
  });

  Object.assign(form, response);
  copyListKey.value += 1;
  const video = new VideoItem({ 
    title: form.title, 
    content: form.content,
    promptPic: form.promptPic,
    promptWav: form.promptWav,
    draftId:form.draftId
  });

  await apiCall<VideoItem>('/api/video', {
    method: 'POST',
    data: video
  });
};

const handleCopySelect = (copyData: any, source: string) => {
  console.log(source);
  if (source === 'downloadCopy') {
    const newDefaultInstance = new CopyItem();
    Object.assign(form, newDefaultInstance);
    form.title = copyData.title;
    form.content = copyData.content;
    toast.success('公共文案加载成功');
  } else if (source === 'copy') {
    Object.assign(form, copyData);
    toast.success('我的文案加载成功');
  }
};
const activeTab = ref<'my' | 'public'>('my');
const toTab = (tab: 'my' | 'public') => {
  if (activeTab.value !== tab) {
    activeTab.value = tab;
  }
};

// --- State ---
// ✅ 2. 为 ref 指定类型
const imageSelectorModal = ref<ModalComponent | null>(null);
const audioSelectorModal = ref<ModalComponent | null>(null);

// --- Methods ---
const openImageSelector = () => {
  if (imageSelectorModal.value) {
    imageSelectorModal.value.open(); // 调用模态框的 open 方法
  }
};

const openAudioSelector = () => {
  if (audioSelectorModal.value) {
    audioSelectorModal.value.open(); // 调用模态框的 open 方法
  }
};

// ✅ 4. 为参数明确指定类型
const onImageSelected = (resourceId: number) => {
  form.promptPic = resourceId; // 保存选中的视频参考图ID
};

// ✅ 4. 为参数明确指定类型
const onAudioSelected = (resourceId: number) => {
  form.promptWav = resourceId; // 保存选中的视频参考语音ID
};

const onSelectorHidden = () => {
  console.log('资源选择器已关闭');
};

const loadDefaultUserResources = async () => {
  try {
    const user = await apiCall<User>('/api/user/current');
    if (user.promptPic && !form.promptPic) {
      form.promptPic = user.promptPic;
    }
    if (user.promptWav && !form.promptWav) {
      form.promptWav = user.promptWav;
    }
  } catch (error) {
    console.error('加载用户默认资源失败:', error);
  }
};
onMounted(async() => {
  loadDefaultUserResources();
  getDraftList(); 
});

</script>

<style scoped>
.card {
  height: 100%; /* 让卡片高度一致 */
}
</style>