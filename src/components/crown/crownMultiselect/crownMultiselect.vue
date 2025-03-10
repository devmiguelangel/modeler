<template>
  <div
    class="crown-config crown-multiselect"
    :style="style"
    v-if="isMultiSelect"
    role="menu"
  >
    <slot />

    <button
      v-for="button in availableButtons"
      :key="button.label"
      :aria-label="button.label"
      class="btn"
      :title="button.label"
      :data-test="button.testId"
      :role="button.role"
      @mousedown.stop.prevent
      @click.stop.prevent="button.action"
    >
      <i :class="`fa fa-${button.icon} text-white`" />
    </button>
  </div>
</template>

<script>
import store from '@/store';
import runningInCypressTest from '@/runningInCypressTest';

export default {
  props: {
    paper: Object,
    hasPools: Boolean,
  },
  data() {
    return {
      runningInCypressTest: runningInCypressTest(),
      showCrown: false,
      savePositionOnPointerupEventSet: false,
      style: null,
      taskDropdownInitiallyOpen: this.paperNotRendered(),
      showReplaceModal: false,
      nodeToReplace: null,
      buttons: [
        {
          label: 'Copy Selection',
          icon: 'clipboard',
          testId: 'copy-button',
          role: 'menuitem',
          action: this.copySelection,
        },
        {
          label: 'Clone Selection',
          icon: 'copy',
          testId: 'clone-button',
          role: 'menuitem',
          action: this.cloneSelection,
        },
        {
          label: 'Delete Element',
          icon: 'trash-alt',
          testId: 'delete-button',
          role: 'menuitem',
          action: this.deleteElement,
        },
        // add more buttons as necessary
      ],
    };
  },
  created() {
    this.$t = this.$t.bind(this);
  },
  computed: {
    isMultiSelect() {
      const countSelected = store.getters.highlightedShapes.length;
      return countSelected > 1;
    },
    highlightedShapes: () => store.getters.highlightedShapes,
    availableButtons() {
      const hasPoolsSelected = this.hasPools;
      return this.buttons.filter(button => {
        if (button.testId === 'copy-button') {
          return !hasPoolsSelected;
        }
        if (button.testId === 'clone-button') {
          return !hasPoolsSelected;
        }
        return true;
      });
    },
  },
  methods: {
    copySelection() {
      this.$emit('copy-selection');
    },
    cloneSelection() {
      this.$emit('clone-selection');
    },
    deleteElement() {
      this.$emit('remove-nodes');
    },
    paperNotRendered() {
      return !this.isRendering;
    },
    setNodePosition() {
      this.shape.stopListening(
        this.paper,
        'element:pointerup',
        this.setNodePosition
      );
      this.savePositionOnPointerupEventSet = false;

      if (!store.getters.allowSavingElementPosition) {
        return;
      }

      this.$emit('save-state');
    },
    paperDoneRendering() {
      if (!this.isRendering) {
        return;
      }

      return new Promise((resolve) => this.paper.once('render:done', resolve));
    },
    setUpCrownConfig() {
      this.paper.on(
        'render:done scale:changed translate:changed',
        this.repositionCrown
      );
    },
    setUpPositionHandling() {},
  },
  async mounted() {
    await this.$nextTick();
    await this.paperDoneRendering();
    this.setUpCrownConfig();
  },
};
</script>

<style scoped>
.crown-multiselect {
  top: -38px;
  left: 50%;
  pointer-events: auto;
}
.btn {
  border: none;
  padding: 0;
  margin-top: 0;
  display: flex;
}
img {
  margin: 0px 10px;
  height: 15px;
}
i {
  margin: 0px 10px;
  font-size: 15px;
}
</style>
