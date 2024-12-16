<script setup lang="ts">
import { onUnmounted, provide, ref } from 'vue';
import { TabItem } from '../types/TabItem';
import Panel from './Panel.vue'
import { PanelItem } from '../types/PanelItem';

const tabs = ref<TabItem[]>([])
provide('panel-tabs', tabs)

const panels = ref<PanelItem[]>([{ id: '1', tabIds: [], width: '100%' },])
provide('panels', panels)

let resizingPanelId: string = ""
let dragStartX: number = 0
let dragStartWidth: number = 0
let dragElement: HTMLElement | null
const panelContainer = ref<HTMLElement>()

const handleMouseMove = (args: MouseEvent) => {
  if (!dragElement) {
    return
  }
  dragElement.style.width = calcNewPanelWidth(args.pageX - dragStartX)
}

const handleMouseUp = (args: MouseEvent) => {
  const resizedPanel = panels.value.find(panel => panel.id === resizingPanelId)
  if (!resizedPanel) {
    console.error("Could not save panel width: No panel found")
    return
  }
  // Persist new width
  resizedPanel.width = calcNewPanelWidth(args.pageX - dragStartX)

  // Reset
  resizingPanelId = ""
  dragStartX = 0
  dragStartWidth = 0
  dragElement = null
  removeEventListener('mouseup', handleMouseUp)
  removeEventListener('mousemove', handleMouseMove)
}

// Triggered by starting to drag the resize handle **after** the panel identified by panelId
function startResizing(args: MouseEvent, panelId: string) {
  resizingPanelId = panelId
  dragStartX = args.pageX
  dragElement = (args.target as EventTarget & { previousElementSibling: HTMLElement | null }).previousElementSibling
  if (!(dragElement instanceof HTMLElement)) {
    console.error("Could not start resize: No target element found")
    return
  }
  dragStartWidth = dragElement.offsetWidth
  window.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('mousemove', handleMouseMove)
  dragElement.style.width = calcNewPanelWidth(args.pageX - dragStartX)
}


// @param offsetX: Delta between dragStart and current mouse position
// @returns: New calculated width in percent
function calcNewPanelWidth(offsetX: number): string {
  if (!panelContainer.value) {
    console.error("Cannot resize: No parent container")
    return ""
  }
  const containerWidth = panelContainer.value.clientWidth
  const paneWidth = dragStartWidth + offsetX
  const resultWidthInPercent = paneWidth / containerWidth * 100

  return `${resultWidthInPercent}%`
}

onUnmounted(() => {
  removeEventListener('mouseup', handleMouseUp)
  removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <div ref="panelContainer" class="panels-container" :key="panels.length">
    <template v-for="panel, idx in panels">
      <Panel :id="panel.id"
        :style="{ width: idx < panels.length - 1 ? panel.width : undefined, 'flex-grow': idx == panels.length - 1 ? '1' : undefined }" />
      <div v-if="idx < panels.length - 1" class="panel-resize-handle" @mousedown="startResizing($event, panel.id)">
      </div>
    </template>
    <slot />
  </div>
</template>

<style scoped>
.panels-container {
  width: 100%;
  height: 100%;
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
