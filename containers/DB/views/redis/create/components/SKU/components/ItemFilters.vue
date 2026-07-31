<template>
  <div>
    <a-form-item :label="$t('db.text_61')" v-bind="formItemLayout">
      <a-radio-group :disabled="!!disableds.engine" v-decorator="decorators.engine || ['engine', { initialValue: 'redis' }]" @change="onEngineChange">
        <a-radio-button :key="item" :value="item" v-for="item in engines">{{item}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('db.text_236')" v-bind="formItemLayout">
      <a-radio-group :disabled="!!disableds.engine_version" v-decorator="decorators.engine_version || ['engine_version']" @change="onVersionChange">
        <a-radio-button :key="item" :value="item" v-for="item in engine_versions">{{item}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('db.text_119')" v-bind="formItemLayout">
      <a-radio-group :disabled="!!disableds.local_category" v-decorator="decorators.local_category || ['local_category']" @change="onCategoryChange">
        <a-radio-button :key="item" :value="item" v-for="item in local_categorys">{{ENGINE_ARCH[item] || item}}</a-radio-button>
      </a-radio-group>
      <div style="color:#888;font-size:12px;line-height:30px">
        {{archPoints(getFieldValue('local_category'))}}
      </div>
    </a-form-item>
     <a-form-item :label="$t('db.text_271')" v-bind="formItemLayout">
      <a-radio-group v-decorator="decorators.nodeType || ['node_type']" @change="onNodeTypeChange">
         <a-radio-button :key="item" :value="item" v-for="item in node_types">{{NODE_TYPE[item] || item}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
     <a-form-item :label="$t('db.text_272')" v-bind="formItemLayout">
      <a-radio-group v-decorator="decorators.performance_type || ['performance_type', { initialValue: 'standard' }]" @change="onPerformanceChange">
        <template v-for="item in performance_types">
           <a-radio-button v-if="item" :key="item" :value="item">{{PERFORMANCE_TYPE[item] || item}}</a-radio-button>
        </template>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('db.text_132')" v-bind="formItemLayout" v-if="memorys && memorys.length > 0">
      <a-radio-group v-decorator="decorators.memory_size_mb || ['memory_size_mb']" @change="onMemoryChange">
        <a-radio-button v-for="size in memorys" :key="size" :value="size" v-show="(size / 1024) < max || !showMore" :disabled="getIsMemoryDisabled(size)">{{sizestr(size, 'M', 1024)}}</a-radio-button>
        <a-radio-button v-if="showMore" @click="showMore = !showMore">...</a-radio-button>
      </a-radio-group>
    </a-form-item>
  </div>
</template>
<script>
import * as R from 'ramda'
import { ENGINE_ARCH, NODE_TYPE, PERFORMANCE_TYPE } from '@DB/views/redis/constants'
import { sizestr } from '@/utils/utils'
export default {
  name: 'SkuFilters',
  inject: {
    form: { default: null },
    redisItem: { default: null },
    getCreateFormDraftPreferred: { default: undefined },
    persistRedisSkuDraftField: { default: undefined },
  },
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
    max: {
      type: Number,
      default: 32,
    },
  },
  data () {
    return {
      NODE_TYPE,
      ENGINE_ARCH,
      PERFORMANCE_TYPE,
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
      showMore: false,
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
    memorys (newValue) {
      const max = Math.max.apply(null, newValue) / 1024
      this.showMore = max > this.max
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
    readDraft (formField) {
      const preferred = typeof this.getCreateFormDraftPreferred === 'function'
        ? this.getCreateFormDraftPreferred()
        : null
      if (!preferred || preferred[formField] == null || preferred[formField] === '') return null
      return preferred[formField]
    },
    /** options 变化后：草稿命中则回填，否则第一项 */
    pickFromOptions (list, draftVal) {
      if (!Array.isArray(list) || !list.length) return undefined
      if (draftVal != null && draftVal !== '') {
        const hit = list.find(item => item === draftVal || String(item) === String(draftVal))
        if (hit != null) return hit
      }
      return list[0]
    },
    persistSkuField (formField, val) {
      if (typeof this.persistRedisSkuDraftField === 'function') {
        this.persistRedisSkuDraftField(formField, val)
      }
    },
    onMemoryChange (e) {
      const val = e && e.target ? e.target.value : this.getFieldValue('memory_size_mb')
      this.persistSkuField('memory_size_mb', val)
    },
    onEngineChange (e) {
      const val = e && e.target ? e.target.value : this.getFieldValue('engine')
      this.persistSkuField('engine', val)
      this.getVersion(e)
    },
    onVersionChange (e) {
      const val = e && e.target ? e.target.value : this.getFieldValue('engine_version')
      this.persistSkuField('engine_version', val)
      this.getArcha(e)
    },
    onCategoryChange (e) {
      const val = e && e.target ? e.target.value : this.getFieldValue('local_category')
      this.persistSkuField('local_category', val)
      this.getNodeTypes(e)
    },
    onNodeTypeChange (e) {
      const val = e && e.target ? e.target.value : this.getFieldValue('node_type')
      this.persistSkuField('node_type', val)
      this.getPerformanceTypes(e)
    },
    onPerformanceChange (e) {
      const val = e && e.target ? e.target.value : this.getFieldValue('performance_type')
      this.persistSkuField('performance_type', val)
    },
    setInitValue (key, callback = () => {}) {
      const draft = this.readDraft(key)
      const value = draft != null ? draft : this.form.getFieldValue(key)
      const data = this[`${key}s`]
      let isNull = true
      let newVal = ''
      let hit = value
      if (R.type(data) === 'Object') {
        newVal = Object.keys(data)[0]
        isNull = value == null || value === '' || !data[value]
      }
      if (R.type(data) === 'Array') {
        newVal = data[0]
        hit = data.find(item => item === value || String(item) === String(value))
        isNull = value == null || value === '' || hit == null
      }
      if (!value || isNull) {
        this.form.setFieldsValue({
          [key]: newVal,
        }, callback)
      } else {
        // options 就绪后写一次，保证 radio 回显（含数字/字符串兼容）
        const finalVal = (hit != null && R.type(data) === 'Array') ? hit : value
        this.form.setFieldsValue({
          [key]: finalVal,
        }, callback)
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
      this.setInitValue('engine_version', () => {
        this.getArcha()
      })
    },
    getArcha (e) {
      const target = (e && e.target) ? e.target : {}
      const keys = ['engine', 'engine_version']
      const data = this.FC.getFieldsValue(keys)
      data.engine_version = target.value || data.engine_version
      this.local_categorys = R.keys(R.pathOr({}, R.values(data), this.filterItems))
      this.setInitValue('local_category', () => {
        this.getNodeTypes()
      })
    },
    getNodeTypes (e) {
      const target = (e && e.target) ? e.target : {}
      const keys = ['engine', 'engine_version', 'local_category']
      const data = this.FC.getFieldsValue(keys)
      data.local_category = target.value || data.local_category
      this.node_types = R.keys(R.pathOr({}, R.values(data), this.filterItems))
      this.setInitValue('node_type', () => {
        this.getPerformanceTypes()
      })
    },
    getPerformanceTypes (e) {
      const target = (e && e.target) ? e.target : {}
      const keys = ['engine', 'engine_version', 'local_category', 'node_type']
      const data = this.FC.getFieldsValue(keys)
      data.node_type = target.value || data.node_type
      this.performance_types = R.pathOr([], R.values(data), this.filterItems)
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
      return points[type] || type
    },
    /** specs 拉取完成 → 内存 options 变化 → 按草稿回填 */
    applyMemoryFromOptions () {
      if (!this.memorys || !this.memorys.length) return
      let next
      if (this.redisItem && this.redisItem.capacity_mb) {
        const redisMb = this.redisItem.capacity_mb
        const index = this.memorys.findIndex((m) => m > redisMb)
        next = index > -1 ? this.memorys[index] : this.memorys[this.memorys.length - 1]
      } else {
        next = this.pickFromOptions(this.memorys, this.readDraft('memory_size_mb'))
      }
      if (next == null) return
      this.FC.setFieldsValue({ memory_size_mb: next })
      if (this.form.fd) this.$set(this.form.fd, 'memory_size_mb', next)
    },
    async fetchSpecs (params) {
      const instanceSpecsManager = new this.$Manager('elasticcacheskus/instance-specs')
      try {
        const { data } = await instanceSpecsManager.batchGet({ params })
        this.memorys = data.mems_mb || []
        this.$nextTick(() => {
          this.applyMemoryFromOptions()
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
        // 内存等 specs options 就绪后再回填；此处只预置级联字段偏好
        const preferred = typeof this.getCreateFormDraftPreferred === 'function'
          ? this.getCreateFormDraftPreferred()
          : null
        if (preferred) {
          const vals = {}
          ;['engine', 'engine_version', 'local_category', 'node_type', 'performance_type'].forEach(k => {
            if (preferred[k] != null && preferred[k] !== '') vals[k] = preferred[k]
          })
          if (Object.keys(vals).length) this.form.setFieldsValue(vals)
        }
        this.filterItems = { redis }
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
