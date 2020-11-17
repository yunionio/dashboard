<template>
  <a-form-item :extra="extra">
    <a-radio-group v-decorator="decorator" @change="change" :disabled="disabled">
      <a-radio-button v-for="item in options" :value="item" :key="item" v-show="item < max || !showMore" :disabled="disableOptionHandle(item)">{{$t('compute.text_120', [ item ])}}</a-radio-button>
      <a-radio-button v-if="showMore" @click="showMore = !showMore">...</a-radio-button>
    </a-radio-group>
  </a-form-item>
</template>

<script>
export default {
  name: 'CpuRadio',
  props: {
    decorator: {
      type: Array,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    disableOptions: {
      type: Array,
      default: () => [],
    },
    max: {
      type: Number,
      default: 32,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    extra: {
      type: String,
      default: '',
    },
  },
  data () {
    const max = Math.max.apply(null, this.options)
    const showMore = max > this.max
    return {
      showMore,
      opta: this.options,
    }
  },
  watch: {
    options () {
      const max = Math.max.apply(null, this.options)
      this.showMore = max > this.max
    },
  },
  methods: {
    change (e) {
      this.$emit('change', e.target.value)
    },
    disableOptionHandle (item) {
      return this.disableOptions.includes(item)
    },
  },
}
</script>
