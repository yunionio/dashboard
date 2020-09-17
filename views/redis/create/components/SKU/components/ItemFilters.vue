<template>
  <div>
    <a-form-item :label="$t('db.text_61')" v-bind="formItemLayout">
      <a-radio-group :disabled="!!disableds.engine" v-decorator="decorators.engine || ['engine', { initialValue: 'redis' }]" @change="getVersion">
        <a-radio-button :key="item" :value="item" v-for="item in engines">{{item}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('db.text_236')" v-bind="formItemLayout">
      <a-radio-group :disabled="!!disableds.engine_version" v-decorator="decorators.engine_version || ['engine_version']" @change="getArcha">
        <a-radio-button :key="item" :value="item" v-for="item in engine_versions">{{item}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('db.text_119')" v-bind="formItemLayout">
      <a-radio-group :disabled="!!disableds.local_category" v-decorator="decorators.local_category || ['local_category']" @change="getNodeTypes">
        <a-radio-button :key="item" :value="item" v-for="item in local_categorys">{{ENGINE_ARCH[item] || item}}</a-radio-button>
      </a-radio-group>
      <div style="color:#888;font-size:12px;line-height:30px">
        {{archPoints(getFieldValue('local_category'))}}
      </div>
    </a-form-item>
     <a-form-item :label="$t('db.text_271')" v-bind="formItemLayout">
      <a-radio-group v-decorator="decorators.nodeType || ['node_type']" @change="getPerformanceTypes">
         <a-radio-button :key="item" :value="item" v-for="item in node_types">{{NODE_TYPE[item]}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
     <a-form-item :label="$t('db.text_272')" v-bind="formItemLayout">
      <a-radio-group v-decorator="decorators.performance_type || ['performance_type', { initialValue: 'standard' }]">
        <template v-for="item in performance_types">
           <a-radio-button v-if="item" :key="item" :value="item">{{PERFORMANCE_TYPE[item]}}</a-radio-button>
        </template>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('db.text_132')" v-bind="formItemLayout" v-if="memorys && memorys.length > 0">
      <a-radio-group v-decorator="decorators.memory_size_mb || ['memory_size_mb']">
        <a-radio-button :key="size" :disabled="getIsMemoryDisabled(size)" :value="size" v-for="size in memorys">{{sizestr(size, 'M', 1024)}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
  </div>
</template>
<script>
import * as R from 'ramda'
import { ENGINE_ARCH, NODE_TYPE, PERFORMANCE_TYPE_KEYS, PERFORMANCE_TYPE, ENGINE_KEYS, NODE_KEYS } from '@DB/views/redis/constants'
import { sizestr } from '@/utils/utils'
export default {
  name: 'SkuFilters',
  inject: ['form', 'redisItem'],
  props: {
    decorators: {
      type: Object,
      default: () => {
        return {}
      },
    },
    disableds: {
      type: Object,
      default: () => {
        return {
          engine: false,
          engine_version: false,
          local_category: false,
        }
      },
    },
  },
  data () {
    return {
      NODE_TYPE,
      ENGINE_ARCH,
      PERFORMANCE_TYPE,
      PERFORMANCE_TYPE_KEYS,
      sizestr,
      engines: [],
      engine_versions: [],
      local_categorys: [],
      node_types: [],
      performance_types: [],
      memorys: [],
      formItemLayout: {
        wrapperCol: {
          lg: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 21 },
        },
        labelCol: {
          lg: { span: 6 },
          xl: { span: 4 },
          xxl: { span: 3 },
        },
      },
      filterItems: {},
    }
  },
  computed: {
    FC () {
      if (this.form && this.form.fc) {
        return this.form.fc
      }
      return null
    },
    getFieldValue () {
      if (this.FC && this.FC.getFieldValue) {
        return this.FC.getFieldValue
      }
      return () => null
    },
  },
  watch: {
    filterItems () {
      this.getEngines()
    },
  },
  methods: {
    getIsMemoryDisabled (size) {
      if (this.redisItem && this.redisItem.capacity_mb) {
        const redisMb = this.redisItem.capacity_mb
        return redisMb >= size
      }
      return false
    },
    setInitValue (key, callback = () => {}) {
      const value = this.form.getFieldValue(key)
      const data = this[`${key}s`]
      let isNull = true
      let newVal = ''
      if (R.type(data) === 'Object') {
        newVal = Object.keys(data)[0]
        isNull = !data[value]
      }
      if (R.type(data) === 'Array') {
        newVal = data[0]
        isNull = data.indexOf(value) === -1
      }
      if (!value || isNull) {
        this.form.setFieldsValue({
          [key]: newVal,
        }, callback)
      } else {
        this.$nextTick(() => {
          callback && callback()
        })
      }
    },
    getEngines () {
      this.engines = R.keys(this.filterItems)
      this.setInitValue('engine', () => {
        this.getVersion()
      })
    },
    getVersion (e) {
      const target = (e && e.target) ? e.target : {}
      const engine = target.value || this.getFieldValue('engine')
      this.engine_versions = R.keys(this.filterItems[engine])
        .sort((a, b) => a - b)
        .filter((v) => {
          return v !== '3.0'
        })
      this.setInitValue('engine_version', () => {
        this.getArcha()
      })
    },
    getArcha (e) {
      const target = (e && e.target) ? e.target : {}
      const keys = ['engine', 'engine_version']
      const data = this.FC.getFieldsValue(keys)
      data.engine_version = target.value || data.engine_version
      const arr = R.keys(R.pathOr({}, R.values(data), this.filterItems))
      this.local_categorys = ENGINE_KEYS.filter((k) => {
        return arr.indexOf(k) > -1
      })
      this.setInitValue('local_category', () => {
        this.getNodeTypes()
      })
    },
    getNodeTypes (e) {
      const target = (e && e.target) ? e.target : {}
      const keys = ['engine', 'engine_version', 'local_category']
      const data = this.FC.getFieldsValue(keys)
      data.local_category = target.value || data.local_category
      const arr = R.keys(R.pathOr({}, R.values(data), this.filterItems))
      this.node_types = NODE_KEYS.filter((k) => {
        return arr.indexOf(k) > -1
      })
      this.setInitValue('node_type', () => {
        this.getPerformanceTypes()
      })
    },
    getPerformanceTypes (e) {
      const target = (e && e.target) ? e.target : {}
      const keys = ['engine', 'engine_version', 'local_category', 'node_type']
      const data = this.FC.getFieldsValue(keys)
      data.node_type = target.value || data.node_type
      const arr = R.pathOr([], R.values(data), this.filterItems)
      this.performance_types = PERFORMANCE_TYPE_KEYS.filter(k => {
        return arr.indexOf(k) > -1
      })
      this.setInitValue('performance_type', () => {})
    },
    archPoints (type) {
      const points = {
        single: this.$t('db.text_273'),
        ha: this.$t('db.text_274'),
        proxy: this.$t('db.text_275'),
        master: this.$t('db.text_274'),
        cluster: this.$t('db.text_275'),
        rwsplit: this.$t('db.text_276'),
      }
      return points[type]
    },
    async fetchSpecs (params) {
      const instanceSpecsManager = new this.$Manager('elasticcacheskus/instance-specs')
      try {
        const { data } = await instanceSpecsManager.batchGet({ params })
        this.memorys = data.mems_mb
        this.$nextTick(() => {
          if (this.memorys && this.redisItem && this.redisItem.capacity_mb) {
            const redisMb = this.redisItem.capacity_mb
            const index = this.memorys.indexOf(redisMb)
            this.FC.setFieldsValue({
              memory_size_mb: index > -1 ? this.memorys[index + 1] : this.memorys[index],
            })
          } else if (this.memorys && this.memorys.length > 0 && this.memorys.indexOf(this.getFieldValue('memory_size_mb')) === -1) {
            this.FC.setFieldsValue({
              memory_size_mb: this.memorys[0],
            })
          }
        })
      } catch (err) {
        throw err
      }
    },
    async fetchCapability (params) {
      const capabilityManager = new this.$Manager('elasticcacheskus/capability')
      params.engine = 'redis'
      try {
        const { data: { redis } } = await capabilityManager.batchGet({ params })
        this.filterItems = { redis }
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
