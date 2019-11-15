<template>
  <div v-if="dbInstance">
     <a-form-item label="数据库引擎" v-bind="formItemLayout">
      <a-radio-group v-decorator="['engine']" @change="getVersion">
        <a-radio-button :key="engine" :value="engine" v-for="(value, engine) of engines">{{engine}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="数据库版本" v-bind="formItemLayout">
      <a-radio-group v-decorator="['engine_version']" @change="getCategory">
        <a-radio-button :key="key" :value="key" v-for="(value, key) of engine_versions"> {{form.getFieldValue('engine') === 'SQLServer' ? versionCn(key) : key }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="实例类型" v-bind="formItemLayout">
      <a-radio-group v-decorator="['category']"  @change="getStorage">
        <a-radio-button :key="key" :value="key" v-for="(value, key) of categorys">{{formatCategoryLabel(key)}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="存储类型" v-bind="formItemLayout">
      <a-radio-group v-decorator="['storage_type']">
        <a-radio-button :key="item" :value="item" v-for="item of storage_types">{{formatStorageLabel(item)}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
  </div>
</template>
<script>
import * as R from 'ramda'
import { DBINSTANCE_CATEGORY, DBINSTANCE_STORAGE_TYPE, ENGINR_VERSION } from '@DB/views/rds/constants'

export default {
  name: 'rdsSkuFilter',
  inject: ['form', 'formItemLayout'],
  data () {
    return {
      dbInstance: undefined,
      engines: {},
      engine_versions: {},
      categorys: {},
      storage_types: [],
    }
  },
  created () {
    this.fetchQueryData()
  },
  methods: {
    versionCn (key) {
      const _arr = key.split('_')
      if (_arr && _arr.length > 0) {
        const t = ENGINR_VERSION[_arr.pop()]
        if (t) {
          return `${_arr.join(' ')} ${t}`
        }
      }
      return ENGINR_VERSION[key] || key
    },
    formatCategoryLabel (key) {
      return DBINSTANCE_CATEGORY[key] || key
    },
    formatStorageLabel (key) {
      return DBINSTANCE_STORAGE_TYPE[key] || key
    },
    setInitValue (key) {
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
        })
      }
    },
    getEngine () {
      this.engines = this.dbInstance
      this.setInitValue('engine')
      this.getVersion()
    },
    getVersion (e) {
      const target = (e && e.target) ? e.target : {}
      const _engine = target.value || this.form.getFieldValue('engine')
      this.engine_versions = this.dbInstance[_engine]
      this.setInitValue('engine_version')
      this.$nextTick(() => {
        this.getCategory()
      })
    },
    getCategory (e) {
      const target = (e && e.target) ? e.target : {}
      // eslint-disable-next-line camelcase
      const { engine, engine_version } = this.form.getFieldsValue(['engine', 'engine_version'])
      // eslint-disable-next-line camelcase
      const version = target.value || engine_version
      this.categorys = this.dbInstance[engine][version]
      this.setInitValue('category')
      this.$nextTick(() => {
        this.getStorage()
      })
    },
    getStorage (e) {
      const target = (e && e.target) ? e.target : {}
      // eslint-disable-next-line camelcase
      const { engine, engine_version, category } = this.form.getFieldsValue(['engine', 'engine_version', 'category'])
      // eslint-disable-next-line camelcase
      const _category = target.value || category
      this.storage_types = this.dbInstance[engine][engine_version][_category]
      this.setInitValue('storage_type')
      this.$emit('change')
    },
    async fetchQueryData (regionId) {
      const params = {
        resource_type: 'shared',
        show_emulated: true,
        scope: this.$scope,
      }
      const { data } = await new this.$Manager('cloudregions', 'v2').getSpecific({ id: '462f113c-976b-406c-8b58-00ceede5b322', spec: 'capability', params })
      this.dbInstance = data && data.db_instance ? data.db_instance : {}
      this.getEngine()
    },
  },
}
</script>
