<script setup lang="ts">
import { provide, ref } from 'vue';
import { TabItem } from '../types/TabItem';
import Panel from './Panel.vue'
import { PanelItem } from '../types/PanelItem';
import { useResize } from '../composables/resize';

const tabs = ref<TabItem[]>([])
provide('panel-tabs', tabs)

const panels = ref<PanelItem[]>([{ id: '1', tabIds: [], width: 100 },])
provide('panels', panels)

const tabDragging = ref<boolean>(false)
provide('panels-tab-dragging', tabDragging)

const panelContainer = ref<HTMLElement | null>(null)
const { startResizing } = useResize(panelContainer)
</script>

<template>
  <div ref="panelContainer" class="panels-container" :key="panels.length">
    <template v-for="panel, idx in panels">
      <Panel :id="panel.id"
        :style="{ width: idx < panels.length - 1 ? `${panel.width}%` : undefined, 'flex-grow': idx == panels.length - 1 ? '1' : undefined }" />
      <div v-if="idx < panels.length - 1" class="panel-resize-handle" @mousedown="startResizing($event, panel)">
      </div>
    </template>
    <slot />
  </div>
</template>

<style scoped>
.panels-container {
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px;
  padding: 8px;

  display: flex;
  gap: 8px;
}

.panel-resize-handle {
  display: block;
  position: relative;
  z-index: 2;

  width: 10px;
  height: 100%;
  margin-left: -10px;
  left: 5px;
  cursor: col-resize;
}

.panel-resize-handle::before {
  display: block;
  content: "";
  width: 3px;
  height: 40px;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -20px;
  margin-left: -1.5px;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
}
</style>
