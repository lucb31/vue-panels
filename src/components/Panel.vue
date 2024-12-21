<script setup lang="ts">
import { computed, inject, Ref, ref } from 'vue';
import { TabItem } from '../types/TabItem';
import { PanelItem } from '../types/PanelItem';

const MIN_PANEL_WIDTH = 20
type SplitDirection = 'LEFT' | 'RIGHT'

const props = defineProps<{ id: string }>()

const tabs = inject<Ref<TabItem[]>>('panel-tabs')!
const panels = inject<Ref<PanelItem[]>>('panels')!
const panel = computed<PanelItem | undefined>(() => panels.value.find(panel => panel.id === props.id))
const availableTabs = computed<TabItem[]>(() => tabs.value.filter(tab => panel.value?.tabIds?.includes(tab.id)))
const activeTabId = computed<string | undefined>(() => panel.value?.activeTabId)
const dragOverItemId = ref<string>("")
const dragging = inject<Ref<boolean>>('panels-tab-dragging')!

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
  dragging.value = true
}

function handleItemDrop(args: DragEvent, targetTabId: string) {
  dragging.value = false
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
  let nextIdx: number
  if (targetTabId === 'END') {
    nextIdx = tabs.value.length - 1
  } else {
    nextIdx = tabs.value.findIndex(tab => tab.id === targetTabId)
  }
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
  if (!panel.value) {
    console.error("No current panel")
    return
  }
  const targetPanel = panels.value.find(p => p.id === targetPanelId)
  if (!targetPanel || targetPanel.tabIds.includes(tabId)) {
    console.debug("skipping panel move. Already inside")
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
    // Last Panel tab
    // -> Merge panel into current
    panel.value.width += prevPanel.width
    // -> Removing prev panel
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

function handleDragOver(item: TabItem) {
  if (item.id !== dragOverItemId.value) {
    dragOverItemId.value = item.id
  }
}

function handleDragEnd() {
  dragOverItemId.value = ""
  dragging.value = false
}

// Triggered when a tab is dragged over a 'split panel' preview element
function handleDragOverSplitPreview(args: DragEvent, inside: boolean) {
  // Check if we're currently dragging a tab item
  if (!dragging.value) {
    console.debug("Ignoring drag over event: Not a tab drag")
    return
  }
  const element = args.target as HTMLElement
  if (inside) {
    element.classList.add("hovering")
  } else {
    element.classList.remove("hovering")
  }
}

// Triggered when a tab is dropped over a 'split panel' preview element
function handleSplitDrop(args: DragEvent, direction: SplitDirection) {
  // Reset hover state
  const element = args.target as HTMLElement
  element.classList.remove("hovering")

  // Validate
  const droppedTabId = args.dataTransfer?.getData('itemID')
  if (!droppedTabId) {
    console.warn("Ignoring split: Did not receive tab id")
    return
  }
  if (panel.value?.tabIds.length === 1 && panel.value.tabIds[0] === droppedTabId) {
    console.error("Aborting split: Cannot split panel with exactly 1 tab")
    return
  }
  const newPanel = splitPanel(direction)
  if (newPanel !== null) {
    moveTabToPanel(droppedTabId, newPanel.id)
  }
}

// Splits a panel into two equally distributing its available width
function splitPanel(direction: SplitDirection): PanelItem | null {
  if (!panel.value) {
    console.error("No active panel")
    return null
  }
  // Calculate target size
  const newWidth = panel.value.width / 2
  if (newWidth < MIN_PANEL_WIDTH) {
    console.error("Cannot split panels any further. Below minimum width")
    return null
  }

  // Calculate insert position
  const currentPanelIdx = panels.value.findIndex(panel => panel.id === props.id)
  let insertIdx: number
  if (currentPanelIdx === -1) {
    // Insert at end
    insertIdx = panels.value.length
  } else if (direction === 'LEFT') {
    // Insert before current panel
    insertIdx = currentPanelIdx
  } else {
    // Insert after current panel
    insertIdx = currentPanelIdx + 1
  }

  // Resize current panel
  panel.value.width = newWidth

  // Create new panel
  const panelId = (Math.floor(Math.random() * 999999)).toString()
  const newPanel: PanelItem = { id: panelId, tabIds: [], width: newWidth }
  panels.value.splice(insertIdx, 0, newPanel)
  return newPanel
}
</script>

<template>
  <div class="panel-container">
    <div class="panel-navigation">
      <ul>
        <li v-for="item in availableTabs" :key="item.id" :id="`tab-${item.id}`"
          :class="{ active: item.id === activeTabId, 'drag-over': dragOverItemId === item.id }" draggable
          @dragstart="handleDragStart($event, item)" @drop="handleItemDrop($event, item.id)" @dragend="handleDragEnd"
          @dragover.prevent="handleDragOver(item)" @dragenter.prevent>
          <a href="#" @click="() => navigateToTab(item.id)">
            {{ item.title }}
          </a>
        </li>
        <div :class="{ 'drag-over': dragOverItemId === 'END' }" @dragover.prevent="() => dragOverItemId = 'END'"
          @drop="handleItemDrop($event, 'END')">
        </div>
      </ul>
    </div>
    <div class="panel-content" :id="`panel-content-${id}`">
      <slot />
      <div class="panels-overlay panels-overlay-left" @dragover.prevent="handleDragOverSplitPreview($event, true)"
        @dragleave.prevent="handleDragOverSplitPreview($event, false)" @drop="handleSplitDrop($event, 'LEFT')">
      </div>
      <div class="panels-overlay panels-overlay-right" @dragover.prevent="handleDragOverSplitPreview($event, true)"
        @dragleave.prevent="handleDragOverSplitPreview($event, false)" @drop="handleSplitDrop($event, 'RIGHT')">
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-container {
  border: 1px solid blue;
  min-width: 20%;
  overflow: auto;
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
  position: relative;
}

.panel-navigation>ul {
  list-style: none;
  display: flex;
  gap: 8px;
  padding-inline-start: 0;
}

.panel-navigation>ul>li {
  border-bottom: 2px solid #e0e0e0;
}

.panel-navigation>ul>li.active {
  border-bottom-color: #0f62fe;
  font-weight: bold;
}

.panel-navigation>ul>li:hover:not(.active) {
  border-bottom-color: #525252;
}

.panel-navigation>ul>li.drag-over,
.panel-navigation>ul>div.drag-over {
  border-left: 2px solid blue;
}

.panel-navigation>ul>div {
  flex-grow: 1;
}

.panels-overlay {
  position: absolute;
  width: 50%;
  height: calc(100% - 16px);
}

.panels-overlay.panels-overlay-right {
  left: 50%;
}

.panels-overlay.hovering {
  background-color: rgba(0, 0, 0, 0.5);
  border: 1px dashed blue;
}
</style>
