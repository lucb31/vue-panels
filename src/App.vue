<script setup lang="ts">
import PanelContainer from './components/PanelContainer.vue';
import PanelTab from './components/PanelTab.vue';
</script>

<template>
  <div style="display: flex; flex-direction: column; width: 100%; height: 100%">
    <h3>Panel Container Demo</h3>
    <div style="flex-grow: 1;">
      <PanelContainer>
        <PanelTab id="1" title="First tab">
          <p>Lorem ipsum dolor sit amet</p>
        </PanelTab>
        <PanelTab id="2" title="Second tab">
          <p>Bli bla blue</p>
        </PanelTab>
        <PanelTab id="3" title="Third tab">
          <p>3 bla blue</p>
        </PanelTab>
        <PanelTab id="4" title="Fourth tab">
          <p>4 bla blue</p>
        </PanelTab>
      </PanelContainer>
    </div>
  </div>
</template>

<style scoped></style>
