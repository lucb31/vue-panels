<script setup lang="ts">
import { computed, inject, Ref, ref } from 'vue';
import { TabItem } from './TabItem';
import { PanelItem } from '../types/PanelItem';

const props = defineProps<{ id: string }>()
const emit = defineEmits<{ (e: 'tab-moved', fromTabId: string, toTabId: string): void }>()

const tabs = inject<Ref<TabItem[]>>('panel-tabs')!
const panels = inject<Ref<PanelItem[]>>('panels')!
const panel = computed<PanelItem | undefined>(() => panels.value.find(panel => panel.id === props.id))
const availableTabs = computed<TabItem[]>(() => tabs.value.filter(tab => panel.value?.tabIds?.includes(tab.id)))
const activeTabId = computed<string | undefined>(() => panel.value?.activeTabId)
const dragOverItemId = ref<string>("")


function navigateToTab(tabId: string) {
  if (!panel.value) {
    console.error("Cannot navigate: Could not find panel")
    return
  }
  panel.value.activeTabId = tabId
}

function handleDragStart(args: DragEvent, tab: TabItem) {
  if (!args.dataTransfer) {
    console.error("Did not receive data transfer details")
    return
  }
  args.dataTransfer.dropEffect = 'move'
  args.dataTransfer.effectAllowed = 'move'
  args.dataTransfer.setData('itemID', tab.id)
}

function handleItemDrop(args: DragEvent, targetTabId: string) {
  const droppedTabId = args.dataTransfer?.getData('itemID')
  if (!droppedTabId) {
    console.error("Did not receive tab id")
    return
  }
  const prevIdx = tabs.value.findIndex(tab => tab.id === droppedTabId)
  if (prevIdx === -1) {
    console.error("Could not move tab: Dropped tab not found")
    return
  }
  const nextIdx = tabs.value.findIndex(tab => tab.id === targetTabId)
  if (nextIdx === -1) {
    console.error("Could not move tab: Target tab not found")
    return
  }
  // Move to different panel
  if (!panel.value?.tabIds.includes(droppedTabId)) {
    const prevPanel = panels.value.find(panel => panel.tabIds.includes(droppedTabId))
    // Disable removing last panel tab
    if (!prevPanel || prevPanel.tabIds.length < 2) {
      console.error("Cannot remove last tab item")
      return
    }
    const tabIdxInPrevPanel = prevPanel?.tabIds.indexOf(droppedTabId)
    // Set new active tab
    if (prevPanel.activeTabId === droppedTabId) {
      if (tabIdxInPrevPanel === prevPanel.tabIds.length - 1) {
        // Active tab was last one of list
        prevPanel.activeTabId = prevPanel.tabIds[tabIdxInPrevPanel - 1]
      } else {
        prevPanel.activeTabId = prevPanel.tabIds[tabIdxInPrevPanel + 1]
      }
    }
    // Remove from prev panel
    prevPanel?.tabIds.splice(tabIdxInPrevPanel, 1)

    // Add tab to new panel
    panel.value?.tabIds.push(droppedTabId)
  }
  if (prevIdx === nextIdx) {
    console.debug("Skipping drop event: No changes")
    return
  }
  // Reorder tab items
  console.log(`moving tab ${droppedTabId} from ${prevIdx} to ${nextIdx}`)
  tabs.value.move(prevIdx, nextIdx)
}

function handleDragOver(item: TabItem) {
  if (item.id !== dragOverItemId.value) {
    dragOverItemId.value = item.id
  }
}

function handleDragEnd() {
  dragOverItemId.value = ""
}
</script>

<template>
  <div class="panel-container">
    <div class="panel-navigation tab-drop-zone">
      <ul>
        <a v-for="item in availableTabs" :key="item.id" :id="`tab-${item.id}`" href="#"
          @click="() => navigateToTab(item.id)"
          :class="{ active: item.id === activeTabId, 'drag-element': true, 'drag-over': dragOverItemId === item.id }"
          draggable @dragstart="handleDragStart($event, item)" @drop="handleItemDrop($event, item.id)"
          @dragend="handleDragEnd" @dragover.prevent="handleDragOver(item)" @dragenter.prevent>
          <li>{{ item.title }}</li>
        </a>
      </ul>
    </div>
    <div class="panel-content" :id="`panel-content-${id}`">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.panel-container {
  border: 1px solid blue;
  min-width: 25%;
  width: 50%;
  resize: horizontal;
  overflow: auto;
  height: 100%;
}

.panel-navigation ul {
  list-style: none;
  display: flex;
  gap: 8px;

  a.active {
    border-bottom: 2px solid yellow;
  }

  a.drag-over {
    border-left: 2px solid blue;
  }
}
</style>
