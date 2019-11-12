<template>
  <div>
    <a-form-item label="类型" v-bind="formItemLayout">
      <a-radio-group :disabled="!!disableds.engine" v-decorator="decorators.engine || ['engine', { initialValue: 'redis' }]" @change="getVersion">
        <a-radio-button :key="item" :value="item" v-for="item in engines">{{item}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="版本" v-bind="formItemLayout">
      <a-radio-group :disabled="!!disableds.engine_version" v-decorator="decorators.engine_version || ['engine_version']" @change="getArcha">
        <a-radio-button :key="item" :value="item" v-for="item in versions">{{item}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="实例类型" v-bind="formItemLayout">
      <a-radio-group :disabled="!!disableds.local_category" v-decorator="decorators.local_category || ['local_category']" @change="getNodeTypes">
        <a-radio-button :key="item" :value="item" v-for="item in archs">{{ENGINE_ARCH[item] || item}}</a-radio-button>
      </a-radio-group>
      <div style="color:#888;font-size:12px;line-height:30px">
        {{archPoints(getFieldValue('local_category'))}}
      </div>
    </a-form-item>
     <a-form-item label="节点类型" v-bind="formItemLayout">
      <a-radio-group v-decorator="decorators.nodeType || ['node_type']" @change="eimtChange">
         <a-radio-button :key="item" :value="item" v-for="item in nodeTypes">{{NODE_TYPE[item]}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
     <a-form-item label="性能类型" v-bind="formItemLayout">
      <a-radio-group v-decorator="decorators.performance_type || ['performance_type', { initialValue: 'standard' }]" @change="getMemorys">
         <a-radio-button :key="item.value" :value="item.value" v-for="item in performanceTypes">{{item.key}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="内存" v-bind="formItemLayout" v-if="memorys && memorys.length > 0">
      <a-radio-group v-decorator="decorators.memory_size_mb || ['memory_size_mb']" @change="eimtChange()">
        <a-radio-button :key="size" :value="parseInt(size)" v-for="size in memorys">{{sizestr(size, 'M', 1024)}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
  </div>
</template>
<script>
import { CreateServerForm } from '@Compute/constants'
import { ENGINE_ARCH, NODE_TYPE } from '@DB/views/redis/constants'
import { sizestr } from '@/utils/utils'

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
      sizestr,
      NODE_TYPE,
      ENGINE_ARCH,
      versions: [],
      archs: [],
      nodeTypes: [],
      memorys: [],
      performanceTypes: [
        {
          key: '标准性能',
          value: 'standard',
        },
        {
          key: '增强性能',
          value: 'enhanced',
        },
      ],
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
      return engines
    },
  },
  created () {
    this.getVersion()
    this.getArcha()
  },
  methods: {
    getVersion (e) {
      const target = (e && e.target) ? e.target : {}
      const engine = target.value || this.getFieldValue('engine')
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
      this.$nextTick(() => {
        if (!this.decorators.engine_version) {
          this.FC.setFieldsValue({
            engine_version: (versions && versions.length > 0) ? versions[0] : undefined,
          })
        }
        this.getArcha()
      })
    },
    getArcha (e) {
      const target = (e && e.target) ? e.target : {}
      const engine = this.getFieldValue('engine')
      const version = target.value || this.getFieldValue('engine_version')
      const category = this.getFieldValue('local_category')
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
      if (archs.indexOf(category) === -1) {
        this.FC.setFieldsValue({
          local_category: archs && archs.length > 0 ? archs[0] : undefined,
        })
      }
      this.$nextTick(() => {
        this.getNodeTypes()
      })
    },
    getNodeTypes (e) {
      const target = (e && e.target) ? e.target : {}
      const engine = this.getFieldValue('engine')
      const version = this.getFieldValue('engine_version')
      const category = target.value || this.getFieldValue('local_category')
      const nodeType = this.getFieldValue('node_type')
      let nodeTypes = []
      if (this.filterParams[engine] && this.filterParams[engine][version] && this.filterParams[engine][version][category]) {
        nodeTypes = Object.keys(this.filterParams[engine][version][category])
      }
      this.nodeTypes = nodeTypes
      if (nodeTypes.indexOf(nodeType) === -1) {
        this.FC.setFieldsValue({
          node_type: nodeTypes && nodeTypes.length > 0 ? nodeTypes[0] : undefined,
        })
      }
      this.$nextTick(() => {
        this.getMemorys()
      })
    },
    getMemorys (e) {
      const target = (e && e.target) ? e.target : {}
      const engine = this.getFieldValue('engine')
      const version = this.getFieldValue('engine_version')
      const category = this.getFieldValue('local_category')
      const nodeType = target.value || this.getFieldValue('node_type')
      const memory = this.getFieldValue('memory_size_mb')

      let memorys = []
      if (this.filterParams[engine] && this.filterParams[engine][version] && this.filterParams[engine][version][category] && this.filterParams[engine][version][category][nodeType]) {
        memorys = Object.keys(this.filterParams[engine][version][category][nodeType])
      }
      this.memorys = memorys
      if (memorys.indexOf(memory) === -1) {
        this.FC.setFieldsValue({
          memory_size_mb: memorys && memorys.length > 0 ? parseInt(memorys[0]) : undefined,
        })
      }
      this.eimtChange()
    },
    archPoints (type) {
      // single': '基础版',
      // 'master': '高可用',
      // 'cluster': '集群',
      // 'rwsplit': '读写分离',
      const points = {
        'single': '数据单副本 | 不支持数据持久化 | 不承诺数据可靠性',
        'ha': '数据双副本 | 数据持久化 | 提供数据可靠性',
        'proxy': '大容量 | 高性能| 支持分片',
        'master': '数据双副本 | 数据持久化 | 提供数据可靠性',
        'cluster': '大容量 | 高性能| 支持分片',
        'rwsplit': '高可用| 高性能｜高灵活的读写分离服务',
      }
      return points[type]
    },
    eimtChange () {
      this.$emit('change')
    },
  },
}
</script>
