<template>
  <div class="row g-4"> <!-- 增大间距 -->
    <div v-for="item in items" :key="item.id" class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
      <b-card 
        no-body 
        class="h-100 shadow-sm resource-card border-0" 
        :img-src="type === 'image' ? item.url : null"
        :img-alt="item.name" 
        img-top 
        v-if="type === 'image'"
      >
        <!-- 图片资源卡片 -->
        <div class="image-wrapper position-relative">
          <b-card-img 
            :src="'/api/resources/'+item.id+'/raw'" 
            alt="资源图片" 
            class="resource-image"
            @click="$emit('view', item)"
          ></b-card-img>
          <div class="image-overlay d-flex align-items-center justify-content-center">
            <i class="fas fa-search-plus text-white fa-2x cursor-pointer" @click="$emit('view', item)"></i>
          </div>
        </div>
        <b-card-body class="p-3 d-flex flex-column">
          <b-card-title class="fs-6 fw-bold text-truncate mb-2">{{ item.name }}</b-card-title>
          <div class="mt-auto">
            <b-button-group size="sm" class="w-100 flex-wrap">
                <b-button 
                variant="outline-primary" 
                size="sm" 
                class="flex-fill"
                @click="$emit('edit', item)"
              >
                <i class="fas fa-pencil me-1"></i> 编辑
              </b-button>
              <b-button 
                variant="outline-primary" 
                size="sm" 
                class="flex-fill"
                @click="$emit('view', item)"
              >
                <i class="fas fa-eye me-1"></i> 查看
              </b-button>
              <b-button 
                variant="outline-secondary" 
                size="sm"
                class="flex-fill"
                @click="$emit('setDefault', item)" 
                v-show="item.user.promptPic !== item.id"
              >
                设为默认
              </b-button>
              <b-button 
                variant="outline-danger" 
                size="sm"
                class="flex-fill"
                @click="$emit('delete', item)"
              >
                <i class="fas fa-trash me-1"></i> 删除
              </b-button>
            </b-button-group>
          </div>
        </b-card-body>
      </b-card>

      <b-card 
        no-body 
        class="h-100 shadow-sm resource-card border-0 d-flex flex-column" 
        v-else-if="type === 'audio'"
      >
        <!-- 音频资源卡片 -->
        <b-card-body class="d-flex flex-column p-4 flex-grow-1">
          <div class="audio-icon-container d-flex align-items-center justify-content-center mb-3">
            <i 
              class="fas fa-music text-primary cursor-pointer" 
              style="font-size: 3em;" 
              @click="$emit('view', item)"
            ></i>
          </div>
          <b-card-title class="fs-6 fw-bold text-truncate text-center mb-3">{{ item.name }}</b-card-title>
          
          <div class="mt-auto">
            <b-button-group size="sm" class="w-100 flex-wrap">
                <b-button 
                variant="outline-primary" 
                size="sm" 
                class="flex-fill"
                @click="$emit('edit', item)"
              >
                <i class="fas fa-eye me-1"></i> 编辑
              </b-button>
              <b-button 
                variant="outline-primary" 
                size="sm" 
                class="flex-fill"
                @click="$emit('play', item)"
              >
                <i class="fas fa-play-circle me-1"></i> 播放
              </b-button>
              <b-button 
                variant="outline-secondary" 
                size="sm"
                class="flex-fill"
                @click="$emit('setDefault', item)" 
                v-show="item.user.promptWav !== item.id"
              >
                设为默认
              </b-button>
              <b-button 
                variant="outline-danger" 
                size="sm"
                class="flex-fill"
                @click="$emit('delete', item)"
              >
                <i class="fas fa-trash me-1"></i> 删除
              </b-button>
            </b-button-group>
          </div>
        </b-card-body>
      </b-card>
      <b-card 
        no-body 
        class="h-100 shadow-sm resource-card border-0 d-flex flex-column" 
        v-else-if="type === 'music'"
      >
        <!-- 音频资源卡片 -->
        <b-card-body class="d-flex flex-column p-4 flex-grow-1">
          <div class="audio-icon-container d-flex align-items-center justify-content-center mb-3">
            <i 
              class="fas fa-music text-primary cursor-pointer" 
              style="font-size: 3em;" 
              @click="$emit('view', item)"
            ></i>
          </div>
          <b-card-title class="fs-6 fw-bold text-truncate text-center mb-3">{{ item.name }}</b-card-title>
          
          <div class="mt-auto">
            <b-button-group size="sm" class="w-100 flex-wrap">
                <b-button 
                variant="outline-primary" 
                size="sm" 
                class="flex-fill"
                @click="$emit('edit', item)"
              >
                <i class="fas fa-eye me-1"></i> 编辑
              </b-button>
              <b-button 
                variant="outline-primary" 
                size="sm" 
                class="flex-fill"
                @click="$emit('play', item)"
              >
                <i class="fas fa-play-circle me-1"></i> 播放
              </b-button>
              <b-button 
                variant="outline-secondary" 
                size="sm"
                class="flex-fill"
                @click="$emit('setDefault', item)" 
                v-show="item.user.promptWav !== item.id"
              >
                设为默认
              </b-button>
              <b-button 
                variant="outline-danger" 
                size="sm"
                class="flex-fill"
                @click="$emit('delete', item)"
              >
                <i class="fas fa-trash me-1"></i> 删除
              </b-button>
            </b-button-group>
          </div>
        </b-card-body>
      </b-card>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true },
  type: { type: String, required: true, validator: v => ['image', 'audio','music'].includes(v) }
});

defineEmits(['edit','view', 'play', 'delete','setDefault']);
</script>

<style scoped>
.resource-card {
  border-radius: 12px !important; /* 圆角 */
  overflow: hidden; /* 防止图片超出圆角 */
  transition: all 0.3s ease-in-out; /* 平滑过渡 */
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.resource-card:hover {
  transform: translateY(-8px); /* 悬停提升 */
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

.resource-image {
  height: 180px; /* 固定高度 */
  object-fit: cover; /* 保持比例填充 */
  cursor: pointer;
}

.image-wrapper {
  position: relative;
  overflow: hidden;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明遮罩 */
  opacity: 0; /* 默认隐藏 */
  transition: opacity 0.3s ease;
}

.resource-card:hover .image-overlay {
  opacity: 1; /* 悬停时显示 */
}

.audio-icon-container {
  height: 120px; /* 为音频图标预留固定高度 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.cursor-pointer {
  cursor: pointer;
}

/* 优化按钮组 */
.btn-group-sm > .btn, .btn-sm {
  font-size: 0.75rem; /* 调整小按钮字体大小 */
  padding: 0.25rem 0.5rem;
}

/* 卡片标题 */
.card-title {
  margin-bottom: 0.5rem;
  color: #333;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .col-sm-6 {
    margin-bottom: 1rem; /* 在小屏幕上增加行间距 */
  }
}
</style>