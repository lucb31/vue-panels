<script setup lang="ts">
import { ref } from 'vue';
import Panel from './components/Panel.vue';
import { TabItem } from './components/TabItem';

const testTabs = ref<TabItem[]>([
  { id: '1', title: 'First tab', content: 'Lorem ipsum', panelId: '1' },
  { id: '2', title: 'second tab', content: 'dolor sit', panelId: '1' },
  { id: '3', title: 'third tab', content: 'amet', panelId: '1' },
  { id: '4', title: 'fourth tab', content: 'amet 4', panelId: '2' },
  { id: '5', title: 'fifth tab', content: 'amet 5', panelId: '2' },
  { id: '6', title: 'sixth tab', content: 'amet 6', panelId: '2' },
])

function handleTabDropped(tabId: string, panelId: string, nextIdx: number) {
  console.log("tab drop", tabId)
  // Move to new panel
  const idx = testTabs.value.findIndex(tab => tab.id === tabId)
  if (idx === -1) {
    console.error("Unknown tab dropped", tabId)
    return
  }
  testTabs.value[idx].panelId = panelId

  // Move to correct array position
  const insertBeforeTab = testTabs.value.filter(tab => tab.panelId === panelId)[nextIdx]
  const nextIdxInAllTabs = testTabs.value.findIndex(tab => tab.id === insertBeforeTab.id)
  if (nextIdxInAllTabs === -1) {
    console.error("Unknown target tab position")
    return
  }
  testTabs.value.move(idx, nextIdxInAllTabs)
}

</script>

<template>
  <div class="panels-container">
    <Panel :tabs="testTabs.filter(tab => tab.panelId === '1')"
      @tab-dropped="(id, nextIdx) => handleTabDropped(id, '1', nextIdx)" />
    <Panel :tabs="testTabs.filter(tab => tab.panelId === '2')"
      @tab-dropped="(id, nextIdx) => handleTabDropped(id, '2', nextIdx)" />
  </div>
</template>

<style scoped>
.panels-container {
  width: 100%;
  height: 100%;
  border: 1px solid red;
  display: flex;
}
</style>
