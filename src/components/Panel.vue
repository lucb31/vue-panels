<script setup lang="ts">
import { computed, ref } from 'vue';

type TabItem = {
  id: string
  title: string
  content: string
}
const availableTabs = ref<TabItem[]>([
  { id: '1', title: 'First tab', content: 'Lorem ipsum' },
  { id: '2', title: 'second tab', content: 'dolor sit' },
  { id: '3', title: 'third tab', content: 'amet', }])
const activeTabId = ref<string>(availableTabs.value[0]?.id)
const dragOverItemId = ref<string>("")

const activeTab = computed<TabItem | undefined>(() => availableTabs.value.find(tab => tab.id === activeTabId.value))

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

  const prevIdx = availableTabs.value.findIndex(tab => tab.id === tabId)
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

Array.prototype.move = function (from: number, to: number) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};
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
