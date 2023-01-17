import _ from 'lodash'
import { getDefinition } from '../util/get'

export default {
  props: {
    path: {
      type: Array,
      default: () => {
        return []
      },
    },
    influxdbUrl: String,
  },
  computed: {
    form () {
      return this.iForm
    },
    definition () {
      const { path, formDefinition } = this
      return getDefinition(path, formDefinition.definition)
    },
  },
  inject: [
    'form',
    'formDefinition',
    'model',
    'influxdbUrl',
  ],
  methods: {
    getFieldDefaultValue (key) {
      if (!key) {
        return
      }

      return _.get(this.model.value, key)
    },
    getPath (key) {
      if (!key) {
        return
      }

      const { path } = this
      return key.map((item, idx) => {
        return path[idx] || item
      })
    },
    getDecoratorId (key) {
      if (!key) {
        return
      }

      const id = this.getPath(key).join('.')

      return id.replace(/\.(\d+)(\.)?/g, '[$1]$2')
    },
  },
}
