<!-- src/components/CopyManager.vue -->
<template>
    <div class="container-fluid">
        <div class="row mb-3">
            <div class="col-6">
                <form>
                    <div class="row mb-3">
                        <div class="col">
                            <label class="form-label">标题：</label>
                            <textarea v-model="form.title" class="form-control" placeholder="输入视频标题" />
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col">
                            <label class="form-label">内容（建议不超过1000字）：</label>
                            <textarea v-model="form.content" class="form-control" style="height: 300px;"></textarea>
                        </div>
                    </div>
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
                                            style="max-width: 100%; max-height: 200px; object-fit: contain;"
                                            class="img-fluid rounded" />

                                    </div>
                                    <div v-else class="text-muted py-4">
                                        <i class="fas fa-image fa-3x mb-2 text-secondary"></i>
                                        <p>尚未选择视频参考图</p>
                                    </div>
                                    <b-button variant="outline-primary" size="sm" @click="openImageSelector"
                                        class="mt-2">
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
                                        <audio :src="'/api/resources/' + form.promptWav + '/raw'" controls
                                            class="w-100"></audio>

                                    </div>
                                    <div v-else class="text-muted py-4">
                                        <i class="fas fa-music fa-3x mb-2 text-secondary"></i>
                                        <p>尚未选择视频参考语音</p>
                                    </div>
                                    <b-button variant="outline-primary" size="sm" @click="openAudioSelector"
                                        class="mt-2">
                                        <i class="fas fa-plus me-1"></i> 选择视频参考语音
                                    </b-button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col">
                            <label class="form-label">剪辑模版：</label>
                            <BFormSelect v-model="form.draftId" :options="draftList" value-field="id" text-field="name">
                                <BFormSelectOption :value="null">无需自动剪辑</BFormSelectOption>
                            </BFormSelect>
                        </div>
                    </div>
                    <!-- /资源选择部分 -->
                    <div class="row">
                        <div class="col">
                            <LoadingButton type="button" class="btn btn-info me-2" @click="save" start-message="正在保存..."
                                success-message="成功" error-message="出错了">保存并重新生成视频</LoadingButton>
                        </div>
                    </div>
                </form>
            </div>
            <div class="col">
                <div class="row" style=" overflow-y: auto;">
                    <VideoList @select-video="handleSelect" :key="listKey" />
                </div>

            </div>
        </div>
    </div>
    <ImageSelectionModal ref="imageSelectorModal" id="my-image-selector-modal" title="请选择一张视频参考图"
        :initial-resource-id="form.promptPic" @selected="onImageSelected" @hidden="onSelectorHidden" />

    <AudioSelectionModal ref="audioSelectorModal" id="my-audio-selector-modal" title="请选择一个视频参考语音"
        :initial-resource-id="form.promptWav" @selected="onAudioSelected" @hidden="onSelectorHidden" />
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { apiCall } from '../utils/api';
import { useToast } from 'vue-toastification';
import { VideoItem, DraftTemplate, type ModalComponent } from '../types';
import VideoList from './VideoList.vue';


const toast = useToast();
const form = reactive<VideoItem>(new VideoItem());
const listKey = ref(0);

const save = async () => {
    if (!form.title || !form.content) {
        toast.warning('标题和内容不能为空');
        return;
    }
    if (form.content.length > 2500) {
        toast.warning('内容不能超过2500字');
        return;
    }
    if (!form.promptPic || !form.promptWav) {
        toast.warning('请选择视频参考图和视频参考语音');
        return;
    }
    const response = await apiCall<VideoItem>('/api/video/resave', {
        method: 'POST',
        data: form
    });
    Object.assign(form, response);
    listKey.value += 1;
};

const handleSelect = (data: VideoItem) => {
    Object.assign(form, data);
    toast.success('加载成功');

};
// --- Methods ---
const imageSelectorModal = ref<ModalComponent | null>(null);
const audioSelectorModal = ref<ModalComponent | null>(null);
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

const draftList = ref<Array<DraftTemplate>>([]);

const getDraftList = async () => {
    try {
        let response = await apiCall<Array<DraftTemplate>>("/api/video/drafts/my", {
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
onMounted(async () => {
    getDraftList();
});
</script>

<style scoped></style>