<template>
  <div class="loading-content">
    <a-row v-for="(item1, idx1) of layout" :gutter="gutter" :key="idx1">
      <a-col v-for="(item2, idx2) of item1" :span="item2" :key="`${idx1}-${idx2}`">
        <div class="loading-block" />
      </a-col>
    </a-row>
  </div>
</template>

<script>
export default {
  name: 'LoadingBlock',
  props: {
    gutter: {
      type: Number,
      default: 8,
    },
    layout: {
      type: Array,
      default: () => ([
        [22],
        [8, 15],
        [6, 18],
        [13, 9],
        [4, 3, 16],
        [8, 6, 8],
      ]),
    },
  },
}
</script>

<style lang="scss" scoped>
.loading-block {
  height: 14px;
  margin: 4px 0;
  border-radius: 2px;
  background: linear-gradient(
    90deg,
    rgba(207, 216, 220, 0.2),
    rgba(207, 216, 220, 0.4),
    rgba(207, 216, 220, 0.2)
  );
  animation: card-loading 1.4s ease infinite;
  background-size: 600% 600%;
}
@keyframes card-loading {
  0%,
  100% {
    background-position: 0 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>
