<template>
  <div v-if="dbInstance">
     <a-form-item label="数据库引擎" v-bind="formItemLayout">
      <a-radio-group v-decorator="['engine']" :disabled="!!disableds.engine" @change="getVersion">
        <a-radio-button :key="engine" :value="engine" v-for="(value, engine) of engines">{{engine}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="数据库版本" v-bind="formItemLayout">
      <a-radio-group v-decorator="['engine_version']" :disabled="!!disableds.engine_version" @change="getCategory">
        <a-radio-button :key="key" :value="key" v-for="key in engine_versions"> {{versionCn(key)}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="实例类型" v-bind="formItemLayout">
      <a-radio-group v-decorator="['category']"  @change="getStorage" :disabled="!!disableds.category">
        <a-radio-button :key="key" :value="key" v-for="key in categorys">{{formatCategoryLabel(key)}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="存储类型" v-bind="formItemLayout">
      <a-radio-group v-decorator="['storage_type']" @change="handleStorage" :disabled="!!disableds.storage_type">
        <a-radio-button :key="item" :value="item" v-for="item of storage_types">{{formatStorageLabel(item)}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
  </div>
</template>
<script>
import * as R from 'ramda'
import { DBINSTANCE_CATEGORY, DBINSTANCE_CATEGORY_KEYS, DBINSTANCE_STORAGE_TYPE, DBINSTANCE_STORAGE_TYPE_KEYS, ENGINR_VERSION_POSTGRE_KYES, ENGINR_VERSION_SERVER_ALIYUN_KYES, ENGINR_VERSION_SERVER_HUAWEI_KYES, ENGINR_VERSION } from '@DB/views/rds/constants'

const VERSION_SORT = {
  PostgreSQL: ENGINR_VERSION_POSTGRE_KYES,
  SQLServer: ENGINR_VERSION_SERVER_ALIYUN_KYES,
}
export default {
  name: 'rdsSkuFilter',
  inject: ['form', 'formItemLayout', 'disableds', 'scopeParams'],
  data () {
    return {
      dbInstance: undefined,
      engines: {},
      engine_versions: [],
      categorys: [],
      storage_types: [],
    }
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
    getEngine () {
      this.engines = this.dbInstance
      this.setInitValue('engine', this.getVersion)
    },
    getVersion (e) {
      const target = (e && e.target) ? e.target : {}
      const _engine = target.value || this.form.getFieldValue('engine')
      const provider = this.form.getFieldValue('provider')
      let versions = Object.keys(this.dbInstance[_engine]).sort((a, b) => a - b)
      if (provider === 'Huawei' && _engine === 'SQLServer') {
        versions = ENGINR_VERSION_SERVER_HUAWEI_KYES.filter(k => versions.indexOf(k) > -1)
      } else if (VERSION_SORT[_engine]) {
        versions = VERSION_SORT[_engine].filter(k => {
          return versions.indexOf(k) > -1
        })
      }
      this.engine_versions = versions
      this.setInitValue('engine_version', this.getCategory)
    },
    getCategory (e) {
      const target = (e && e.target) ? e.target : {}
      // eslint-disable-next-line camelcase
      const { engine, engine_version } = this.form.getFieldsValue(['engine', 'engine_version'])
      // eslint-disable-next-line camelcase
      const version = target.value || engine_version
      const categorys = this.dbInstance[engine][version]
      this.categorys = DBINSTANCE_CATEGORY_KEYS.filter(k => {
        if (categorys && categorys[k]) {
          return true
        }
      })
      for (const k in categorys) {
        if (this.categorys.indexOf(k) === -1) {
          this.categorys.push(k)
        }
      }
      this.setInitValue('category', this.getStorage)
    },
    getStorage (e) {
      const target = (e && e.target) ? e.target : {}
      // eslint-disable-next-line camelcase
      const { engine, engine_version, category } = this.form.getFieldsValue(['engine', 'engine_version', 'category'])
      // eslint-disable-next-line camelcase
      const _category = target.value || category
      const storages = this.dbInstance[engine][engine_version][_category]
      this.storage_types = DBINSTANCE_STORAGE_TYPE_KEYS.filter(k => {
        return storages.indexOf(k) > -1
      })
      storages.forEach(k => {
        if (this.storage_types.indexOf(k) === -1) {
          this.storage_types.push(k)
        }
      })
      this.setInitValue('storage_type', () => {
        this.$emit('change')
      })
    },
    handleStorage () {
      this.$emit('change')
    },
    async fetchFilters (cloudregionId = this.form.getFieldValue('cloudregion')) {
      const params = {
        resource_type: 'shared',
        show_emulated: true,
        ...this.scopeParams,
      }
      try {
        const { data } = await new this.$Manager('cloudregions', 'v2').getSpecific({ id: cloudregionId, spec: 'capability', params })
        this.dbInstance = data && data.db_instance ? data.db_instance : {}
        this.form.setFieldsValue({
          engine: undefined,
          engine_version: undefined,
          category: undefined,
          storage_type: undefined,
        }, this.getEngine)
        return await data
      } catch (err) {
        this.dbInstance = {}
        throw err
      }
    },
  },
}
</script>
