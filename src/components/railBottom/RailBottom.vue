<template>
  <div class="rail-container">
    <UndoRedoControl
      :node-types="nodeTypes"
      :is-rendering="isRendering"
      @load-xml="$emit('load-xml')"
      @clearSelection="$emit('clearSelection')"
    />

    <div class="control-box">
      <div
        v-for="(control, index) in nodes" :key="index"
        class="control-item"
      >
        <div v-if="!['pool'].includes(control.label.toLowerCase())" class="control-more">
          <span />
        </div>
        <img :src="control.icon" :alt="$t(control.label)" class="control-node">
      </div>
    </div>
  </div>
</template>

<script>
import UndoRedoControl from '@/components/railBottom/undoRedoControl/UndoRedoControl.vue';

export default {
  components: {
    UndoRedoControl,
  },
  props: {
    nodeTypes: [],
    canvasDragPosition: {},
    cursor: {},
    paperManager: {},
    isRendering: {
      type: Boolean,
    },
  },
  computed: {
    nodes() {
      return this.nodeTypes
        .filter(nodeType => nodeType.control && nodeType.category === 'BPMN')
        .map(nodeType => {
          return {
            type: nodeType.id,
            icon: nodeType.icon,
            label: nodeType.label,
            bpmnType: nodeType.bpmnType,
            rank: nodeType.rank || 5000,
          };
        })
        .sort((node1, node2) => node1.rank - node2.rank);
    },
  },
};
</script>

<style lang="scss" scoped src="./railBottom.scss"></style>
