<template>
  <div>
    <a-form-item label="类型" v-bind="formItemLayout">
      <a-radio-group :disabled="!!disableds.engine" v-decorator="decorators.engine || ['engine']" @change="getVersion">
        <a-radio-button :key="item" :value="item" v-for="item in engines">{{item}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="版本" v-bind="formItemLayout">
      <a-radio-group :disabled="!!disableds.engine_version" v-decorator="decorators.engine_version || ['engine_version']" @change="getArcha">
        <a-radio-button :key="item" :value="item" v-for="item in versions">{{item}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="实例类型" v-bind="formItemLayout">
      <a-radio-group :disabled="!!disableds.local_category" v-decorator="decorators.local_category || ['local_category']" @change="eimtChange()">
        <a-radio-button :key="item" :value="item" v-for="item in archs">{{ENGINE_ARCH[item] || item}}</a-radio-button>
      </a-radio-group>
      <div style="color:#888;font-size:12px">
        {{archPoints(getFieldValue('local_category'))}}
      </div>
    </a-form-item>
  </div>
</template>
<script>
import { CreateServerForm } from '@Compute/constants'
import { ENGINE_ARCH } from '@DB/views/redis/constants'

export default {
  name: 'SkuFilters',
  inject: ['form'],
  props: {
    filterParams: {
      type: Object,
    },
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
      ENGINE_ARCH,
      versions: [],
      archs: [],
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
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
    engines () {
      const engines = Object.keys(this.filterParams)
      if (engines && engines.length === 1) {
        this.FC.setFieldsValue({
          engine: engines[0],
        })
      }
      return engines
    },
  },
  created () {
    this.getVersion()
    this.getArcha()
  },
  mounted () {
    this.eimtChange()
  },
  methods: {
    getVersion () {
      const engine = this.getFieldValue('engine')
      let versions = []
      if (engine) {
        versions = Object.keys(this.filterParams[engine])
      } else {
        const _versions = {}
        Object.keys(this.filterParams).forEach(k => {
          for (let key in this.filterParams[k]) {
            _versions[key] = key
          }
        })
        versions = Object.keys(_versions)
      }
      this.versions = versions
      this.eimtChange()
    },
    getArcha () {
      const engine = this.getFieldValue('engine')
      const version = this.getFieldValue('engine_version')
      const category = this.getFieldValue('local_category')
      console.log(category)
      let archs = []
      if (engine) {
        if (version) {
          archs = Object.keys(this.filterParams[engine][version])
        } else {
          const _archs = {}
          Object.keys(this.filterParams[engine]).forEach(v => {
            for (let key in this.filterParams[engine][v]) {
              _archs[key] = key
            }
          })
          archs = Object.keys(_archs)
        }
      } else {
        const _archs = {}
        Object.keys(this.filterParams).forEach(k => {
          Object.keys(this.filterParams[k]).forEach(v => {
            for (let key in this.filterParams[k][v]) {
              _archs[key] = key
            }
          })
        })
        archs = Object.keys(_archs)
      }
      if (archs.indexOf('category') === -1) {
        this.FC.setFieldsValue({
          local_category: undefined,
        })
      }
      this.archs = archs
      this.eimtChange()
    },
    archPoints (type) {
      const points = {
        'single': '数据双副本 | 数据持久化 | 提供数据可靠性',
        'ha': '数据单副本 | 不支持数据持久化 | 不承诺数据可靠性',
        'proxy': '数据双副本 | 数据持久化| 提供数据可靠性｜支持分片',
      }
      return points[type]
    },
    eimtChange () {
      this.$emit('change')
    },
  },
}
</script>
