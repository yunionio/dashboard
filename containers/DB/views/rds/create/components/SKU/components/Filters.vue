<template>
  <div v-if="dbInstance">
     <a-form-item :label="$t('db.text_57')" v-bind="formItemLayout">
      <a-radio-group v-decorator="['engine']" :disabled="!!disableds.engine" @change="onEngineChange">
        <a-radio-button :key="engine" :value="engine" v-for="(value, engine) of engines">{{engine}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('db.text_63')" v-bind="formItemLayout">
      <a-radio-group v-decorator="['engine_version']" :disabled="!!disableds.engine_version" @change="onVersionChange">
        <a-radio-button :key="key" :value="key" v-for="key in engine_versions"> {{versionCn(key)}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('db.text_119')" v-bind="formItemLayout">
      <a-radio-group v-decorator="['category']" @change="onCategoryChange" :disabled="!!disableds.category">
        <a-radio-button :key="key" :value="key" v-for="key in categorys">{{formatCategoryLabel(key)}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('db.text_120')" v-bind="formItemLayout">
      <a-radio-group v-decorator="['storage_type']" @change="onStorageChange" :disabled="!!disableds.storage_type">
        <a-radio-button :key="item" :value="item" v-for="item of storage_types">{{formatStorageLabel(item)}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
  </div>
</template>
<script>
import { DBINSTANCE_CATEGORY, ENGINR_VERSION_POSTGRE_KYES, DBINSTANCE_CATEGORY_KEYS, DBINSTANCE_STORAGE_TYPE, DBINSTANCE_STORAGE_TYPE_KEYS, ENGINR_VERSION_SERVER_ALIYUN_KYES, ENGINR_VERSION_SERVER_HUAWEI_KYES, ENGINR_VERSION } from '@DB/views/rds/constants'

const VERSION_SORT = {
  PostgreSQL: ENGINR_VERSION_POSTGRE_KYES,
  SQLServer: ENGINR_VERSION_SERVER_ALIYUN_KYES,
}

/**
 * 约定：options / 拉取数据变化时，草稿命中可选值则回填，否则取第一项；
 * 程序化 setFieldsValue 不落盘；落盘仅提交校验通过后由页面 flush。
 */
export default {
  name: 'rdsSkuFilter',
  inject: {
    form: { default: null },
    formItemLayout: { default: null },
    disableds: { default: null },
    scopeParams: { default: null },
    getCreateFormDraftPreferred: { default: undefined },
  },
  props: {
    rdsItem: {
      type: Object,
    },
  },
  data () {
    return {
      dbInstance: undefined,
      engines: {},
      engine_versions: [],
      categorys: [],
      storage_types: [],
    }
  },
  created () {
    this._ignoreRadioChange = false
  },
  methods: {
    versionCn (key) {
      if (this.form.getFieldValue('provider') === 'Aws' && this.form.getFieldValue('engine') === 'SQLServer') {
        const _arr = key.split('.')
        if (_arr && _arr[0]) {
          let ret = key
          switch (_arr[0]) {
            case '12':
              ret = `2014_${key}`
              break
            case '13':
              ret = `2016_${key}`
              break
            case '14':
              ret = `2017_${key}`
              break
            case '15':
              ret = `2019_${key}`
          }
          return ret
        }
      }
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
    normalizeDraftScalar (val) {
      if (val == null || val === '') return val
      if (typeof val === 'object') {
        if (val.key != null) return val.key
        if (val.value != null) return val.value
        if (val.id != null) return val.id
      }
      return typeof val === 'string' ? val.trim() : val
    },
    readDraft (formField) {
      const preferred = typeof this.getCreateFormDraftPreferred === 'function'
        ? this.getCreateFormDraftPreferred()
        : null
      if (!preferred) return null
      return this.normalizeDraftScalar(preferred[formField])
    },
    /** options 变化后：草稿命中则回填，否则第一项 */
    pickFromOptions (options, draftVal) {
      const list = Array.isArray(options)
        ? options
        : (options && typeof options === 'object' ? Object.keys(options) : [])
      if (!list.length) return undefined
      const draft = this.normalizeDraftScalar(draftVal)
      if (draft != null && draft !== '') {
        const hit = list.find(item => item === draft || String(item) === String(draft))
        if (hit != null) return hit
      }
      return list[0]
    },
    setCascading (v) {
      this._ignoreRadioChange = !!v
    },
    /** 程序化写表单：不落盘 */
    setFieldQuiet (fields, callback) {
      this._ignoreRadioChange = true
      const setter = (this.form && this.form.fc && this.form.fc.setFieldsValue) ||
        (this.form && this.form.setFieldsValue)
      if (!setter) {
        callback && callback()
        return
      }
      setter.call(this.form.fc || this.form, fields, () => {
        Object.keys(fields || {}).forEach((k) => {
          if (this.form.fd) this.$set(this.form.fd, k, fields[k])
        })
        this.$nextTick(() => {
          callback && callback()
        })
      })
    },
    onEngineChange (e) {
      if (this._ignoreRadioChange) return
      const val = e && e.target ? e.target.value : this.form.getFieldValue('engine')
      this.setCascading(true)
      this.refreshVersions(val)
    },
    onVersionChange (e) {
      if (this._ignoreRadioChange) return
      const val = e && e.target ? e.target.value : this.form.getFieldValue('engine_version')
      this.setCascading(true)
      this.refreshCategories(val)
    },
    onCategoryChange (e) {
      if (this._ignoreRadioChange) return
      const val = e && e.target ? e.target.value : this.form.getFieldValue('category')
      this.setCascading(true)
      this.refreshStorages(val)
    },
    onStorageChange (e) {
      if (this._ignoreRadioChange) return
      this.$emit('change', this.buildSpecsPayload())
    },
    /** capability 就绪：引擎 options 变化 → 尝试草稿回填 */
    applyEngines () {
      if (!this.dbInstance || typeof this.dbInstance !== 'object') {
        this.engines = {}
        this.engine_versions = []
        this.categorys = []
        this.storage_types = []
        this.setCascading(false)
        return
      }
      this.engines = this.dbInstance
      const engine = this.pickFromOptions(this.engines, this.readDraft('engine'))
      if (engine == null) {
        this.setCascading(false)
        return
      }
      this.$nextTick(() => {
        this.setFieldQuiet({ engine }, () => this.refreshVersions(engine))
      })
    },
    refreshVersions (engineVal) {
      const engine = engineVal || this.form.getFieldValue('engine') || this.readDraft('engine')
      const provider = this.form.getFieldValue('provider')
      const engineMap = (this.dbInstance && engine) ? this.dbInstance[engine] : null
      if (!engineMap || typeof engineMap !== 'object') {
        this.engine_versions = []
        this.finishCascade()
        return
      }
      let versions = Object.keys(engineMap).sort((a, b) => a - b)
      if (provider === 'Huawei' && engine === 'SQLServer') {
        versions = ENGINR_VERSION_SERVER_HUAWEI_KYES.filter(k => versions.indexOf(k) > -1)
      } else if (VERSION_SORT[engine]) {
        const sorted = VERSION_SORT[engine].filter(k => versions.indexOf(k) > -1)
        const rest = versions.filter(k => sorted.indexOf(k) === -1)
        versions = sorted.concat(rest)
      }
      this.engine_versions = versions
      const version = this.pickFromOptions(versions, this.readDraft('engine_version'))
      this.$nextTick(() => {
        if (version == null) {
          this.finishCascade()
          return
        }
        this.setFieldQuiet({ engine_version: version }, () => this.refreshCategories(version))
      })
    },
    refreshCategories (versionVal) {
      const engine = this.form.getFieldValue('engine') || this.readDraft('engine')
      const version = versionVal || this.form.getFieldValue('engine_version') || this.readDraft('engine_version')
      const categoryMap = this.dbInstance && engine && version
        ? (this.dbInstance[engine] && this.dbInstance[engine][version])
        : null
      this.categorys = DBINSTANCE_CATEGORY_KEYS.filter(k => categoryMap && categoryMap[k])
      for (const k in (categoryMap || {})) {
        if (this.categorys.indexOf(k) === -1) this.categorys.push(k)
      }
      const category = this.pickFromOptions(this.categorys, this.readDraft('category'))
      this.$nextTick(() => {
        if (category == null) {
          this.finishCascade()
          return
        }
        this.setFieldQuiet({ category }, () => this.refreshStorages(category))
      })
    },
    refreshStorages (categoryVal) {
      const engine = this.form.getFieldValue('engine') || this.readDraft('engine')
      const engineVersion = this.form.getFieldValue('engine_version') || this.readDraft('engine_version')
      const category = categoryVal || this.form.getFieldValue('category') || this.readDraft('category')
      const storages = (this.dbInstance && engine && engineVersion && category &&
        this.dbInstance[engine] &&
        this.dbInstance[engine][engineVersion] &&
        this.dbInstance[engine][engineVersion][category]) || []
      const storageList = Array.isArray(storages) ? storages : []
      this.storage_types = DBINSTANCE_STORAGE_TYPE_KEYS.filter(k => storageList.indexOf(k) > -1)
      storageList.forEach(k => {
        if (this.storage_types.indexOf(k) === -1) this.storage_types.push(k)
      })
      const storageType = this.pickFromOptions(this.storage_types, this.readDraft('storage_type'))
      this.$nextTick(() => {
        if (storageType == null) {
          this.finishCascade()
          return
        }
        this.setFieldQuiet({ storage_type: storageType }, () => this.finishCascade())
      })
    },
    finishCascade () {
      const payload = this.buildSpecsPayload()
      this.setCascading(false)
      this.$nextTick(() => this.$emit('change', payload))
    },
    buildSpecsPayload () {
      const fd = (this.form && this.form.fd) || {}
      const pick = (key) => {
        const v = this.form.getFieldValue(key)
        if (v != null && v !== '') return v
        if (fd[key] != null && fd[key] !== '') return fd[key]
        return this.readDraft(key)
      }
      return {
        provider: pick('provider'),
        cloudregion: pick('cloudregion'),
        engine: pick('engine'),
        engine_version: pick('engine_version'),
        category: pick('category'),
        storage_type: pick('storage_type'),
      }
    },
    async fetchFilters (cloudregionId = this.form.getFieldValue('cloudregion')) {
      if (!cloudregionId) return false
      const params = {
        resource_type: 'shared',
        show_emulated: true,
        ...this.scopeParams,
      }
      try {
        this.setCascading(true)
        const { data } = await new this.$Manager('cloudregions', 'v2').getSpecific({ id: cloudregionId, spec: 'capability', params })
        this.dbInstance = data && data.db_instance ? data.db_instance : {}
        if (this.form.getFieldValue('provider') === 'Qcloud' || (this.rdsItem && this.rdsItem.provider === 'Qcloud')) {
          this.dbInstance = this.dbInstance.MySQL ? { MySQL: this.dbInstance.MySQL } : {}
        }
        // capability 拉取完成 → options 变化 → 按草稿回填
        this.applyEngines()
        return await data
      } catch (err) {
        this.dbInstance = {}
        this.setCascading(false)
        throw err
      }
    },
  },
}
</script>
