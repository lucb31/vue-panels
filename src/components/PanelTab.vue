<script setup lang="ts">
import { computed, inject, onMounted, Ref } from 'vue';
import { TabItem } from '../types/TabItem';
import { PanelItem } from '../types/PanelItem';

const props = defineProps<{ id: string, title: string }>()
const tabs = inject<Ref<TabItem[]>>('panel-tabs')
const panels = inject<Ref<PanelItem[]>>('panels')
const parentPanel = computed<PanelItem | undefined>(() => panels?.value?.find(panel => panel.tabIds.some(id => id === props.id)))
const tabSelected = computed<boolean>(() => parentPanel.value?.activeTabId === props.id)

onMounted(() => {
  console.log("mounting tab")
  if (!tabs) {
    console.error("No tabs provided")
    return
  }
  const index = tabs.value?.findIndex(tab => tab.id === props.id)
  const tabItem: TabItem = { id: props.id, title: props.title }
  if (index > -1) {
    console.log("updating tab")
    tabs.value.splice(index, 1, tabItem)
  } else {
    console.log("adding tab")
    tabs.value.push(tabItem)
  }

  // Already tracked
  if (panels?.value?.some(panel => panel.tabIds.some(id => id === props.id))) {
    console.log("Tab already tracked")
    return
  }
  // Add tab to first panel
  const firstPanel = panels?.value[0]
  if (!firstPanel) {
    return
  }
  console.log("Adding tab to first panel")
  firstPanel.tabIds.push(props.id)
  // Select tab if first in panel
  if (!firstPanel.activeTabId) {
    firstPanel.activeTabId = props.id
  }
})

function getPanelTarget(): string {
  console.log("recalculating teleport target")
  if (!parentPanel.value) {
    console.error("Could not determine active panel for tab")
    return 'body'
  }
  return `#panel-content-${parentPanel.value.id}`
}
</script>

<template>
  <Teleport defer :to="getPanelTarget()">
    <div :hidden="!tabSelected">
      <slot />
    </div>
  </Teleport>
</template>

<style scoped>
.panel-tab-content {
  border: 1px solid green;
}
</style>
