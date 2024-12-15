<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { TabItem } from './TabItem';

const props = defineProps<{
  tabs: TabItem[]
}>()
const emit = defineEmits<{ (e: 'tab-dropped', id: string, nextIdx: number): void }>()

const availableTabs = ref<TabItem[]>(props.tabs)
const activeTabId = ref<string>(availableTabs.value[0]?.id)
const dragOverItemId = ref<string>("")

const activeTab = computed<TabItem | undefined>(() => availableTabs.value.find(tab => tab.id === activeTabId.value))

watch(() => props.tabs, (newTabs: TabItem[]) => availableTabs.value = newTabs)

function navigateToTab(tabId: string) {
  activeTabId.value = tabId
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

function handleItemDrop(args: DragEvent, nextIdx: number) {
  const tabId = args.dataTransfer?.getData('itemID')
  if (!tabId) {
    console.error("Did not receive tab id")
    return
  }

  const prevIdx = availableTabs.value.findIndex(tab => tab.id === tabId)
  if (prevIdx === -1) {
    console.warn("Cross panel DnD")
    emit('tab-dropped', tabId, nextIdx)
    return
  }
  if (prevIdx === nextIdx) {
    console.debug("Skipping drop event: No changes")
  }
  availableTabs.value.move(prevIdx, nextIdx)
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
        <a v-for="item, idx in availableTabs" :key="item.id" :id="`tab-${item.id}`" href="#"
          @click="() => navigateToTab(item.id)"
          :class="{ active: item.id === activeTabId, 'drag-element': true, 'drag-over': dragOverItemId === item.id }"
          draggable @dragstart="handleDragStart($event, item)" @drop="handleItemDrop($event, idx)"
          @dragend="handleDragEnd" @dragover.prevent="handleDragOver(item)" @dragenter.prevent>
          <li>{{ item.title }}</li>
        </a>
      </ul>
    </div>
    <div class="panel-content">
      {{ activeTab?.content }}
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
