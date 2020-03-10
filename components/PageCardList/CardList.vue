<template>
  <div class="card-list d-flex flex-wrap">
    <div class="card-wrap my-3" v-for="(item, key) in list" :key="key">
      <component :is="cardType" :listItem="item" :listKey="key" :singleActions="singleActions" :cardFields="cardFields" :layoutDirection="layoutDirection"  />
    </div>
  </div>
</template>

<script>
import HorizontalCard from './HorizontalCard'
import LongitudinalCard from './LongitudinalCard'

export default {
  name: 'CardList',
  components: {
    HorizontalCard,
    LongitudinalCard,
  },
  props: {
    list: {
      type: Object,
      required: true,
    },
    singleActions: {
      type: Array,
    },
    cardFields: {
      type: Object,
      required: true,
      validator: val => val.url && val.title,
    },
    layoutDirection: {
      type: String,
      required: true,
      default: 'horizontal',
      validator: val => ['horizontal', 'longitudinal'].includes(val),
    },
  },
  computed: {
    cardType () {
      if (this.layoutDirection === 'longitudinal') {
        return 'longitudinal-card'
      }
      return 'horizontal-card'
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../../src/styles/variables';

.card-list {
  .card-wrap {
    margin-right: 16px;
  }
}
</style>
