<template>
    <div class="container-fluid mt-4">
        <!-- 上传区域 -->
        <b-card class="mb-4 shadow-sm rounded-3">
            <b-form @submit.prevent="handleUpload">
                <b-row class="mt-2"> <!-- 添加 g-3 增加列间距 -->
                    <b-form-file id="file-input" v-model="selectedFile" :accept="allowedFileTypes"
                        placeholder="选择一个视频参考图或音频文件..." drop-placeholder="拖拽文件到这里..."></b-form-file>
                </b-row>
                <b-row class="mt-2" v-show="form.type == 'audio'">
                    <b-col sm="1">
                        <label for="form_content">语音内容:</label></b-col>
                    <b-col>
                        <BFormTextarea v-model="form.content" rows="2" id="form_content" />
                    </b-col>
                </b-row>
                <b-row class="mt-2" v-show="form.type == 'image'">
                    <b-col sm="1">
                        <label for="form_prompt">正向提示词:</label></b-col>
                    <b-col>
                        <BFormTextarea v-model="form.prompt" rows="4" id="form_prompt" />
                    </b-col>
                </b-row>
                <b-row class="mt-2" v-show="form.type == 'image'">
                    <b-col sm="1">
                        <label for="form_nprompt">反向提示词:</label></b-col>
                    <b-col>
                        <BFormTextarea v-model="form.nprompt" rows="4" id="form_nprompt" />
                    </b-col>
                </b-row>
                <b-row class="mt-2">
                    <b-col>
                    <b-button type="submit" :disabled="uploading" class="btn btn-info me-2">
                        <i v-if="uploading" class="fas fa-spinner fa-spin me-2"></i>
                        {{ uploading ? '保存中...' : '保存' }}
                    </b-button>
                    <b-button type="button" :disabled="uploading" @click="createNew" class="btn btn-info me-2">
                        新建
                    </b-button>
                    </b-col>
                </b-row>
            </b-form>
        </b-card>

        <!-- 分类切换按钮 -->
        <b-tabs content-class="mt-3" v-model:index="activeTab" justified>
            <b-tab title="视频参考图" active>
                <ResourceGrid :items="images" type="image" @delete="confirmDelete" @view="showImage" @edit="edit"
                    @setDefault="setDefault" />
            </b-tab>
            <b-tab title="视频参考语音">
                <ResourceGrid :items="sounds" type="audio" @delete="confirmDelete" @play="playAudio" @edit="edit"
                    @setDefault="setDefault" />
            </b-tab>
              <b-tab title="音乐">
                <ResourceGrid :items="musics" type="music" @delete="confirmDelete" @play="playAudio" @edit="edit"
                    @setDefault="setDefault" />
            </b-tab>
        </b-tabs>

        <!-- 视频参考图预览模态框 -->
        <b-modal id="image-preview-modal" v-model="imagePreviewModal.show" :title="imagePreviewModal.title" size="lg"
            centered body-class="p-0" modal-class="image-preview-modal">
            <img :src="imagePreviewModal.src" alt="预览视频参考图" class="w-100 rounded" />
            <template #modal-footer="{ ok, cancel, hide }">

            </template>
        </b-modal>

        <!-- 音频播放模态框 -->
        <b-modal id="audio-player-modal" v-model="audioPlayerModal.show" :title="audioPlayerModal.title"
            hide-header-close hide-footer centered @hide="stopAudio" size="md">
            <div class="d-flex flex-column align-items-center">
                <i class="fas fa-music text-primary mb-3" style="font-size: 4em;"></i>
                <audio ref="audioRef" controls class="w-100" :src="audioPlayerModal.src">

                </audio>
            </div>
        </b-modal>

        <!-- 删除确认模态框 -->
        <b-modal id="delete-confirm-modal" v-model="deleteConfirmModal.show" title="确认删除" @ok="performDelete"
            ok-variant="danger" cancel-variant="secondary">
            <p>确定要删除资源 "<strong>{{ deleteConfirmModal.item?.name || '未知' }}</strong>" 吗？此操作不可撤销。</p>
        </b-modal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useToast } from 'vue-toastification';
import ResourceGrid from './ResourceGrid.vue'; // 子组件
import { apiCall } from '../utils/api';
import { ResourceItem } from '../types';

const toast = useToast();
// --- State ---
const resources = ref([]);
const selectedFile = ref(null);
const uploading = ref(false);
const activeTab = ref(0); 
const imagePreviewModal = ref({ show: false, src: '', title: '' });
const audioPlayerModal = ref({ show: false, src: '', title: '' });
const deleteConfirmModal = ref({ show: false, item: null });

const form = reactive(new ResourceItem());
// --- Computed ---
const images = computed(() => resources.value.filter(r => r.type === 'image'));
const sounds = computed(() => resources.value.filter(r => r.type === 'audio'));
const musics = computed(() => resources.value.filter(r => r.type === 'music'));
const allowedFileTypes =  ref('image/*,audio/*');

// --- Methods ---
const createNew=()=>{
    const r=new ResourceItem();
    Object.assign(form,r);
}
const setDefault = async (item) => {
    try {
        await apiCall(`/api/resources/${item.id}/default`, {
            method: 'PUT',
        });
        toast.success('已设为默认资源');
        loadResources();
    } catch (error) {
        console.error('设为默认失败:', error);
        toast.danger('设为默认失败');
    }
};
const loadResources = async () => {
    try {
        resources.value = await apiCall('/api/resources', {
            method: 'GET',
        });
    } catch (error) {
        console.error('加载资源失败:', error);
        toast.error('加载资源失败');
    }
};
watch(
    () => activeTab.value,
    (newVal, oldVal) => {
        createNew(); 

        if (newVal === 2) {
            form.type = 'music';
        } else if (newVal === 1) {
            form.type = 'audio';
        } else if (newVal === 0) {
            form.type = 'image';
        } else {
        }

        if (form.type === 'music' || form.type === 'audio') {
            allowedFileTypes.value = 'audio/*';
        } else if (form.type === 'image') {
            allowedFileTypes.value = 'image/*';
        }
    }
);
const edit = async (item) => {
    Object.assign(form, item)
};
const handleUpload = async () => {
    if (!form.path) {
        if (!selectedFile.value) {
            toast.error("请选择上传的文件");
            return;
        };

    }

    //form.type = selectedFile?.value?.type.startsWith('image/') ? 'image' : 'audio';
    const formData = new FormData();
    if (form.type == 'image') {
        if (!form.prompt) {
            toast.error("请输入正向提示词");
            return;
        }
        if (!form.nprompt) {
            toast.error("请输入负向提示词");
            return;
        }
        formData.append('prompt', form.prompt);
        formData.append('nprompt', form.nprompt);
    } else if (form.type == 'audio') {
        if (!form.content) {
            toast.error("请输入参考语音的内容");
            return;
        }
        formData.append('content', form.content);
    }

    uploading.value = true;
    if (selectedFile?.value) {
        formData.append('file', selectedFile.value);
        formData.append('name', selectedFile.value.name);
    } 
    formData.append('path', form.path);
    formData.append('type', form.type);
    formData.append('draftTemplate', 0);

    try {
        const url = form.id ? `/api/resources/${form.id}/upload` : "/api/resources/upload";
        const res = await apiCall(url, {
            method: form.id ? 'PATCH' : 'POST',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        selectedFile.value = null;
        toast.success('上传成功');
        loadResources();
    } catch (error) {
        console.error('上传失败:', error);
        toast.error('上传失败');
    } finally {
        uploading.value = false;
    }
};

const confirmDelete = (item) => {
    deleteConfirmModal.value.item = item;
    deleteConfirmModal.value.show = true;
};

const performDelete = async () => {
    if (!deleteConfirmModal.value.item) return;

    try {
        await apiCall(`/api/resources/${deleteConfirmModal.value.item.id}`, {
            method: 'DELETE',
        });
        loadResources();
        toast.success('删除成功');
    } catch (error) {
        console.error('删除失败:', error);
        toast.danger('删除失败');
    } finally {
        deleteConfirmModal.value.show = false;
        deleteConfirmModal.value.item = null;
    }
};

const showImage = (item) => {
    imagePreviewModal.value.src = '/api/resources/' + item.id + '/raw';
    imagePreviewModal.value.title = item.name;
    imagePreviewModal.value.show = true;
};

const playAudio = (item) => {
    audioPlayerModal.value.src = '/api/resources/' + item.id + '/raw';
    audioPlayerModal.value.title = item.name;
    audioPlayerModal.value.show = true;
};

const stopAudio = () => {
    const audio = document.querySelector('#audio-player-modal audio');
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
};

onMounted(() => {
    loadResources();
});
</script>

<style scoped>
/* 可选：为视频参考图预览模态框添加样式 */
.image-preview-modal .modal-body img {
    max-height: 70vh;
    /* 限制视频参考图最大高度 */
    object-fit: contain;
    /* 保持视频参考图比例 */
}
</style>