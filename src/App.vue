<!-- src/App.vue -->
<template>
  <BApp id="app">
    <router-view /> <!-- 使用 router-view 来渲染匹配的路由组件 -->
  </BApp>
</template>

<script setup lang="ts">
import {BApp} from 'bootstrap-vue-next'
</script>

<style>
/* 你可以将全局样式（如 Bootstrap）放在这里，或者在 index.html 中引入 */
/* 如果在 index.html 中引入了 Bootstrap CSS，则此处不需要重复引入 */
</style>