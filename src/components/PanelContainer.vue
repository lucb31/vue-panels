<script setup lang="ts">
import { provide, ref } from 'vue';
import { TabItem } from '../types/TabItem';
import Panel from './Panel.vue'
import { PanelItem } from '../types/PanelItem';

const tabs = ref<TabItem[]>([])
provide('panel-tabs', tabs)

const panels = ref<PanelItem[]>([
  { id: '1', tabIds: [] },
]
)
provide('panels', panels)

function handleTabDropped(tabId: string, panelId: string, nextIdx: number) {
  console.log("tab drop", tabId)
  // Move to new panel
  const idx = tabs.value.findIndex(tab => tab.id === tabId)
  if (idx === -1) {
    console.error("Unknown tab dropped", tabId)
    return
  }
  tabs.value[idx].panelId = panelId

  // Move to correct array position
  const insertBeforeTab = tabs.value.filter(tab => tab.panelId === panelId)[nextIdx]
  const nextIdxInAllTabs = tabs.value.findIndex(tab => tab.id === insertBeforeTab.id)
  if (nextIdxInAllTabs === -1) {
    console.error("Unknown target tab position")
    return
  }
  tabs.value.move(idx, nextIdxInAllTabs)
}
</script>

<template>
  <div class="panels-container" :key="panels.length">
    <Panel v-for="panel in panels" :id="panel.id" @tab-dropped="(id, nextIdx) => handleTabDropped(id, '1', nextIdx)" />
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
}
</style>
