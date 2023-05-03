<template>
  <div class="ur-box">
    <button type="button"
      class="ur-button"
      :disabled="!canUndo"
      data-test="undo"
      v-b-tooltip.hover
      :title="$t('Undo')"
      @click="undo"
    >
      <font-awesome-icon :icon="undoIcon" />
    </button>

    <div class="ur-divider" />

    <button type="button"
      class="ur-button"
      :disabled="!canRedo"
      data-test="redo"
      v-b-tooltip.hover
      :title="$t('Redo')"
      @click="redo"
    >
      <font-awesome-icon :icon="redoIcon" />
    </button>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faRedo, faUndo } from '@fortawesome/free-solid-svg-icons';
import undoRedoStore from '@/undoRedoStore';

export default ({
  components: {
    FontAwesomeIcon,
  },
  props: {
    isRendering: {
      type: Boolean,
    },
  },
  data() {
    return {
      undoIcon: faUndo,
      redoIcon: faRedo,
    };
  },
  watch: {
    canUndo(canUndo) {
      if (!canUndo) {
        this.$root.$emit('bv::hide::tooltip');
      }
    },
    canRedo(canRedo) {
      if (!canRedo) {
        this.$root.$emit('bv::hide::tooltip');
      }
    },
  },
  computed: {
    canUndo() {
      return undoRedoStore.getters.canUndo;
    },
    canRedo() {
      return undoRedoStore.getters.canRedo;
    },
  },
  methods: {
    undo() {
      this.$emit('clearSelection');
      if (this.isRendering) {
        return;
      }
      undoRedoStore
        .dispatch('undo')
        .then(() => this.$emit('load-xml'));
    },
    redo() {
      this.$emit('clearSelection');
      if (this.isRendering) {
        return;
      }
      undoRedoStore
        .dispatch('redo')
        .then(() => this.$emit('load-xml'));
    },
  },
});
</script>

<style lang="scss" scoped src="./undoRedoControl.scss"></style>
