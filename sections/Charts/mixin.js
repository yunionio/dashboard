import * as R from 'ramda'
import { mergeWith } from 'lodash'

export default {
  props: {
    width: {
      type: [Number, String],
      default: 600,
    },
    height: {
      type: [Number, String],
      default: 400,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    chartStyles () {
      const width = R.is(Number, this.width) ? `${this.width}px` : this.width
      const height = R.is(Number, this.height) ? `${this.height}px` : this.height
      return {
        width,
        height,
      }
    },
  },
  methods: {
    mergeOptions (o1, o2) {
      return mergeWith(o1, o2)
    },
  },
}
