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

const activeTab = computed<TabItem | undefined>(() => availableTabs.value.find(tab => tab.id === activeTabId.value))

function navigateToTab(tabId: string) {
  console.log("lets go to a different tab", tabId)
  activeTabId.value = tabId
}
</script>

<template>
  <div class="panel-container">
    <div class="panel-navigation">
      <ul>
        <a v-for="item in availableTabs" :key="item.id" href="#" @click="() => navigateToTab(item.id)"
          :class="{ active: item.id === activeTabId }">
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
}
</style>
