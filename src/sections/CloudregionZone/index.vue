<template>
  <div class="cloudregion-zone-select-wrapper">
    <a-row :gutter="8">
      <a-col :span="12">
        <a-form-item :wrapperCol="{ span: 24 }">
          <cloudregion v-decorator="decorator.cloudregion" @change="handleChange" :options="regionOpts" :disabledRegion="disabledRegion" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item :wrapperCol="{ span: 24 }">
          <zone v-decorator="decorator.zone" @change="handleZoneChange" :options="zoneOpts" />
        </a-form-item>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { Manager } from '@/utils/manager'
import { cloudregionFilterByCapability } from '@/utils/common/capability'
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'
import Cloudregion from './components/Cloudregion'
import Zone from './components/Zone'

export default {
  name: 'RegionZoneSelect',
  components: {
    Cloudregion,
    Zone,
  },
  mixins: [createFormFieldDraftMixin],
  props: {
    decorator: {
      type: Object,
      required: true,
      validator: obj => R.is(Array, obj.cloudregion) && R.is(Array, obj.zone),
    },
    cloudregionParams: {
      type: Object,
      default: () => ({}),
    },
    zoneParams: {
      type: Object,
      default: () => ({}),
    },
    // 选择过滤掉哪些资源的只读云
    filterBrandResource: String,
    disabledRegion: Boolean,
    formDraftKey: {
      type: String,
      default: '',
    },
    /** selection：radio/单选 select/switch 类，local + session 双写、可跨 tab 回填 */
    formDraftKind: {
      type: String,
      default: 'selection',
    },
  },
  inject: {
    form: { default: undefined },
  },
  data () {
    return {
      regionOpts: [],
      zoneOpts: [],
    }
  },
  computed: mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable', 'capability']),
  watch: {
    cloudregionParams: {
      deep: true,
      handler (val, oldVal) {
        if (!R.equals(val, oldVal)) {
          this.fetchRegions()
        }
      },
    },
  },
  created () {
    // 勿放 data：vue/no-reserved-keys 禁止 data 里用 _ 前缀
    this._regionZoneWriting = false
    // 字段级 touched：zone 手改不挡 region；region 手改可清 zone touched 再试草稿
    this._regionZoneFieldTouched = {
      region: false,
      zone: false,
    }
    this._fetchRegionsSeq = 0
    this._fetchZonesSeq = 0
    this.zonesM = new Manager('zones', 'v2')
    this.cloudregionsM = new Manager('cloudregions', 'v2')
    this.fetchRegions()
  },
  methods: {
    isRzFieldTouched (field) {
      return !!this._regionZoneFieldTouched?.[field]
    },
    markRzFieldTouched (field) {
      if (this._regionZoneWriting) return
      if (!this._regionZoneFieldTouched) return
      this._regionZoneFieldTouched[field] = true
      this.markFormFieldDraftTouched()
    },
    withRzWriting (fn) {
      this._regionZoneWriting = true
      try {
        fn()
      } finally {
        this.$nextTick(() => {
          this._regionZoneWriting = false
        })
      }
    },
    getFieldKey (field) {
      const v = this.form?.fc?.getFieldValue?.(field)
      if (v == null || v === '') return undefined
      if (R.is(Object, v)) return v.key || undefined
      return v
    },
    findOptById (list, id) {
      if (id == null || id === '') return null
      const arr = Array.isArray(list) ? list : []
      return arr.find(item => String(item.id) === String(id)) || null
    },
    setRegionZoneFields (values) {
      if (!this.form?.fc || !values) return
      this.withRzWriting(() => {
        const keys = Object.keys(values)
        const hasUndef = keys.some(k => values[k] === undefined)
        if (hasUndef) {
          // setFieldsValue 对部分场景丢 undefined；setFields 可真正清空并触发 onValuesChange
          const fields = {}
          keys.forEach((key) => {
            fields[key] = { value: values[key] }
          })
          this.form.fc.setFields(fields)
          this.syncFormFieldValuesToFd(values)
        } else {
          this.applyFormFieldValues(values)
        }
      })
    },
    clearZoneField () {
      this.emit({}, 'zone')
      if (this.form?.fc) {
        this.setRegionZoneFields({ zone: undefined })
      }
    },
    clearRegionAndZoneFields () {
      this.emit({}, 'cloudregion')
      this.emit({}, 'zone')
      this.zoneOpts = []
      if (this.form?.fc) {
        this.setRegionZoneFields({
          cloudregion: undefined,
          zone: undefined,
        })
      }
    },
    pickRegionCandidate () {
      const draft = this.canRestoreFormFieldDraft() ? this.readFormFieldDraft() : null
      const draftRegion = draft
        ? this.matchFormFieldDraftInOptions(this.regionOpts, draft.cloudregion)
        : null
      const initialVal = this.decorator.cloudregion?.[1]?.initialValue
      const initialRegion = (initialVal && this.findOptById(this.regionOpts, initialVal.key))
        ? this.findOptById(this.regionOpts, initialVal.key)
        : null
      return draftRegion || initialRegion || this.regionOpts[0] || null
    },
    pickZoneCandidate (cloudregionId) {
      const draft = this.canRestoreFormFieldDraft() ? this.readFormFieldDraft() : null
      let draftZone = null
      if (draft?.zone) {
        // 必须草稿 region 与当前一致才回填 zone，避免跨 region 错填
        const draftRegionKey = draft.cloudregion?.key ?? draft.cloudregion
        if (draftRegionKey && String(draftRegionKey) === String(cloudregionId)) {
          draftZone = this.matchFormFieldDraftInOptions(this.zoneOpts, draft.zone)
        }
      }
      const initialVal = this.decorator.zone?.[1]?.initialValue
      const initialZone = (initialVal && this.findOptById(this.zoneOpts, initialVal.key))
        ? this.findOptById(this.zoneOpts, initialVal.key)
        : null
      return draftZone || initialZone || this.zoneOpts[0] || null
    },
    emit (item, emitStr) {
      const opts = this.regionOpts.concat(this.zoneOpts)
      let itemObj = {}
      if (R.is(String, item)) {
        itemObj = opts.find(val => val.id === item) || {}
      } else if (R.is(Object, item) && (item.id || item.key)) {
        itemObj = opts.find(val => val.id === (item.id || item.key)) || {}
      }
      this.$emit(`update:${emitStr}`, itemObj)
    },
    fetchRegions () {
      const params = {
        ...this.cloudregionParams,
      }
      if (this.isAdminMode && !params.project_domain) {
        params.project_domain = this.userInfo.projectDomainId
        delete params.scope
        delete params.domain_id
      }
      if (this.filterBrandResource && !params.hasOwnProperty('read_only')) {
        params.read_only = false
      }
      // 不再在请求前无条件清空表单，避免 params 抖动覆盖用户手选
      const seq = ++this._fetchRegionsSeq
      this.cloudregionsM.list({ params })
        .then(({ data: { data = [] } }) => {
          if (seq !== this._fetchRegionsSeq) return
          // 根据全局capability剔除掉只读云的cloudregion
          if (this.filterBrandResource) {
            this.regionOpts = cloudregionFilterByCapability({
              capability: this.capability,
              resource: 'compute_engine',
              dataList: data,
            })
          } else {
            this.regionOpts = data
          }
          this.$emit('update:closeregionOpts', this.regionOpts)
          if (!this.form) return

          if (!this.regionOpts.length) {
            this.clearRegionAndZoneFields()
            return
          }

          const curId = this.getFieldKey('cloudregion')
          const curStillValid = this.findOptById(this.regionOpts, curId)

          let nextRegion = null
          if (curStillValid) {
            // 当前值仍在 opts：保留手选 / 已回填值
            nextRegion = curStillValid
          } else if (!this.isRzFieldTouched('region')) {
            // 未手改：draft || initial || 第一项
            nextRegion = this.pickRegionCandidate()
          } else {
            // 已手改但当前值失效：清空，不再强行盖第一项
            this.clearRegionAndZoneFields()
            return
          }

          if (!nextRegion) return

          const regionChanged = !curId || String(curId) !== String(nextRegion.id)
          if (regionChanged) {
            // 程序化换 region：下游 zone 可再试草稿
            this._regionZoneFieldTouched.zone = false
            this.setRegionZoneFields({
              cloudregion: { key: nextRegion.id, label: nextRegion.name },
              zone: undefined,
            })
          }
          this.emit(nextRegion, 'cloudregion')
          this.fetchZones(nextRegion.id)
        })
        .catch(() => {
          // 失败保留当前表单值，不清空手选
        })
    },
    fetchZones (cloudregionId) {
      let zoneUsable = false
      if (this.cloudregionParams && this.cloudregionParams.usable) {
        zoneUsable = true
      }
      const params = Object.assign({}, this.zoneParams, { cloudregion_id: cloudregionId, usable: zoneUsable, order_by: 'created_at', order: 'asc' })
      if (!params.cloudregion_id) {
        this.zoneOpts = []
        this.clearZoneField()
        return
      }
      if (this.filterBrandResource && !params.hasOwnProperty('read_only')) {
        params.read_only = false
      }
      // 请求前不清空 zoneOpts/表单，避免短暂「有值无选项」闪烁
      const seq = ++this._fetchZonesSeq
      this.zonesM.list({ params })
        .then(({ data: { data = [] } }) => {
          if (seq !== this._fetchZonesSeq) return
          this.zoneOpts = data
          if (!this.form) return

          if (!this.zoneOpts.length) {
            this.clearZoneField()
            return
          }

          const curId = this.getFieldKey('zone')
          const curStillValid = this.findOptById(this.zoneOpts, curId)

          let nextZone = null
          if (curStillValid) {
            nextZone = curStillValid
          } else if (!this.isRzFieldTouched('zone')) {
            nextZone = this.pickZoneCandidate(cloudregionId)
          } else {
            // 已手改且不在 opts：清空
            this.clearZoneField()
            return
          }

          if (!nextZone) return

          if (!curId || String(curId) !== String(nextZone.id)) {
            this.setRegionZoneFields({
              zone: { key: nextZone.id, label: nextZone.name },
            })
          }
          this.emit(nextZone, 'zone')
        })
        .catch(() => {
          // 失败保留当前表单值，不清空手选
        })
    },
    handleChange (value) {
      if (this._regionZoneWriting) return
      // 手改 region：标记 region；清 zone touched，便于按新 region 再试草稿 zone
      this.markRzFieldTouched('region')
      this._regionZoneFieldTouched.zone = false

      let cloudregionId
      if (R.is(String, value)) {
        cloudregionId = value
      } else if (R.is(Object, value)) {
        cloudregionId = value.key
      }
      if (!cloudregionId) {
        this.emit({}, 'cloudregion')
        this.clearZoneField()
        return
      }
      const selectedRegionOption = this.findOptById(this.regionOpts, cloudregionId)
      this.emit(selectedRegionOption || {}, 'cloudregion')
      // 换 region 先清 zone，再拉新列表回填
      this.setRegionZoneFields({ zone: undefined })
      this.fetchZones(cloudregionId)
    },
    handleZoneChange (value) {
      if (this._regionZoneWriting) {
        this.emit(value, 'zone')
        return
      }
      this.markRzFieldTouched('zone')
      this.emit(value, 'zone')
    },
    serializeFormFieldDraft () {
      if (!this.form?.fc) return undefined
      const cloudregion = this.form.fc.getFieldValue('cloudregion')
      const zone = this.form.fc.getFieldValue('zone')
      if (!cloudregion?.key && !zone?.key) return undefined
      return {
        cloudregion: cloudregion?.key ? { key: cloudregion.key, label: cloudregion.label } : null,
        zone: zone?.key ? { key: zone.key, label: zone.label } : null,
      }
    },
  },
}
</script>
