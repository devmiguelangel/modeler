<template>
  <div class="zoom-box">
    <div
      class="zoom-button"
      @click="paperManager.scale = Math.max(minimumScale, paperManager.scale.sx -= scaleStep)"
      data-test="zoom-out"
      v-b-tooltip.hover
      :title="$t('Zoom Out')"
    >
      <font-awesome-icon :icon="minusIcon" />
    </div>

    <div v-if="paperManager" class="zoom-text">
      {{ Math.round(paperManager.scale.sx*100) }}%
    </div>

    <div
      class="zoom-button"
      @click="paperManager.scale = paperManager.scale.sx + scaleStep"
      data-test="zoom-in"
      v-b-tooltip.hover
      :title="$t('Zoom In')"
    >
      <font-awesome-icon :icon="plusIcon" />
    </div>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

export default ({
  components: {
    FontAwesomeIcon,
  },
  props: {
    paperManager: {},
  },
  data() {
    return {
      initialScale: 1,
      minimumScale: 0.2,
      scaleStep: 0.1,
      minusIcon: faMinus,
      plusIcon: faPlus,
    };
  },
});

</script>

<style lang="scss" scoped src="./zoomControl.scss"></style>
