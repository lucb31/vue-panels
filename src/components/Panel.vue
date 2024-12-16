<script setup lang="ts">
import { computed, inject, Ref, ref } from 'vue';
import { TabItem } from '../types/TabItem';
import { PanelItem } from '../types/PanelItem';

const props = defineProps<{ id: string }>()

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
  // Validation
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
  const targetPanelId = panel.value?.id
  if (!targetPanelId) {
    console.error("Could not move tab: Current panel id not found")
    return
  }

  // Move to different tab position
  if (prevIdx !== nextIdx) {
    console.log(`moving tab ${droppedTabId} from ${prevIdx} to ${nextIdx}`)
    tabs.value.move(prevIdx, nextIdx)
  }

  dragOverItemId.value = ""
  moveTabToPanel(droppedTabId, targetPanelId)
}

function moveTabToPanel(tabId: string, targetPanelId: string) {
  const targetPanel = panels.value.find(p => p.id === targetPanelId)
  if (!targetPanel || targetPanel.tabIds.includes(tabId)) {
    console.log("skipping panel move. Already inside")
    return
  }
  // Move to different panel
  const prevPanelIdx = panels.value.findIndex(p => p.tabIds.includes(tabId))
  if (prevPanelIdx === -1) {
    console.error("Could not find prev panel")
    return
  }
  const prevPanel = panels.value[prevPanelIdx]
  if (prevPanel.tabIds.length < 2) {
    // Removing last panel tab: Remove panel
    console.log("Last panel tab -> Removing panel")
    panels.value.splice(prevPanelIdx, 1)
  } else {
    // Remove from list of panel tabs
    const tabIdxInPrevPanel = prevPanel?.tabIds.indexOf(tabId)
    // Set new active tab
    if (prevPanel.activeTabId === tabId) {
      if (tabIdxInPrevPanel === prevPanel.tabIds.length - 1) {
        // Active tab was last one of list
        prevPanel.activeTabId = prevPanel.tabIds[tabIdxInPrevPanel - 1]
      } else {
        prevPanel.activeTabId = prevPanel.tabIds[tabIdxInPrevPanel + 1]
      }
    }
    prevPanel?.tabIds.splice(tabIdxInPrevPanel, 1)
  }

  // Add tab to new panel
  targetPanel.tabIds.push(tabId)
  // Set tab new active in destination panel
  targetPanel.activeTabId = tabId
}

// Move given tabId to a new panel
function moveTabToNewPanel(tabId: string) {
  // Create new panel
  const panelId = (Math.floor(Math.random() * 999999)).toString()
  panels.value.push({ id: panelId, tabIds: [], width: '50%' })
  moveTabToPanel(tabId, panelId)
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
    <div class="panel-navigation">
      <ul>
        <li v-for="item in availableTabs" :key="item.id" :id="`tab-${item.id}`"
          :class="{ active: item.id === activeTabId, 'drag-element': true, 'drag-over': dragOverItemId === item.id }"
          draggable @dragstart="handleDragStart($event, item)" @drop="handleItemDrop($event, item.id)"
          @dragend="handleDragEnd" @dragover.prevent="handleDragOver(item)" @dragenter.prevent>
          <a href="#" @click="() => navigateToTab(item.id)">
            {{ item.title }}
          </a>
          <button @click="moveTabToNewPanel(item.id)" v-if="panels.length < 2">Split</button>
        </li>
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
  overflow: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 8px;
}

.panel-content {
  border: 1px solid grey;
  background-color: lightgray;
  flex-grow: 1;
  color: black;
  padding: 8px;
}

.panel-navigation ul {
  list-style: none;
  display: flex;
  gap: 8px;
  padding-inline-start: 0;

  li {
    border-bottom: 2px solid #e0e0e0;

    &.active {
      border-bottom-color: #0f62fe;
      font-weight: bold;
    }

    &.drag-over {
      border-left: 2px solid blue;
    }

    &:hover:not(.active) {
      border-bottom-color: #525252;
    }
  }

}
</style>
