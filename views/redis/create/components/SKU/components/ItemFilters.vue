<template>
  <div>
    <a-form-item label="类型" v-bind="formItemLayout">
      <a-radio-group v-decorator="['engine']" @change="getVersion">
        <a-radio-button :key="item" :value="item" v-for="item in engines">{{item}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="版本" v-bind="formItemLayout">
      <a-radio-group v-decorator="['engine_version']" @change="getArcha">
        <a-radio-button :key="item" :value="item" v-for="item in versions">{{item}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="实例类型" v-bind="formItemLayout">
      <a-radio-group v-decorator="['engine_arch']" @change="eimtChange()">
        <a-radio-button :key="item" :value="item" v-for="item in archs">{{item}}</a-radio-button>
      </a-radio-group>
      <div style="color:#888;font-size:12px">
        {{archPoints(getFieldValue('engine_arch'))}}
      </div>
    </a-form-item>
  </div>
</template>
<script>
import { CreateServerForm } from '@Compute/constants'

export default {
  name: 'SkuFilters',
  inject: ['form'],
  props: {
    filterParams: {
      type: Object,
    },
  },
  data () {
    return {
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
      return Object.keys(this.filterParams)
    },
  },
  created () {
    this.getVersion()
    this.getArcha()
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
