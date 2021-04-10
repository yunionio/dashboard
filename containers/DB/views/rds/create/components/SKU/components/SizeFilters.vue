<template>
  <div>
    <a-form-item :label="$t('db.text_131')" v-bind="formItemLayout">
      <a-radio-group v-decorator="['vcpu_count']" @change="getMemsMb">
        <a-radio-button :key="cpu" :value="cpu" v-for="cpu in cpus">{{$t('db.text_125', [cpu])}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('db.text_132')" v-bind="formItemLayout">
      <a-radio-group v-decorator="['vmem_size_mb']" @change="$emit('change')">
        <a-radio-button :key="size" :value="size" v-for="size in mems_mbs">{{sizestr(size, 'M', 1024)}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('db.text_133')" v-bind="formItemLayout">
      <slot name="zone" v-if="$slots.zone" />
      <a-radio-group v-else v-decorator="['zones']" @change="$emit('change')">
        <a-radio-button :key="id" :value="id" v-for="(zone, id) of zones">{{zone}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
  </div>
</template>
<script>
import { sizestr } from '@/utils/utils'

export default {
  name: 'rdsSizeFilter',
  inject: ['form', 'formItemLayout', 'scopeParams'],
  props: {
    rdsItem: {
      type: Object,
    },
  },
  data () {
    return {
      cpus: [],
      mems_mbs: [],
      zones: {},
      cpu_mems_mb: {},
    }
  },
  methods: {
    sizestr,
    initCpu () {
      const count = this.form.getFieldValue('vcpu_count')
      if (!count || this.cpus.indexOf(count) === -1) {
        this.form.setFieldsValue({
          vcpu_count: this.cpus[0],
        }, this.getMemsMb)
      } else {
        this.$nextTick(() => {
          this.getMemsMb()
        })
      }
    },
    initZone () {
      const zones = this.form.getFieldValue('zones')
      if (!zones || this.cpus.indexOf(zones) === -1) {
        this.form.setFieldsValue({
          zones: Object.keys(this.zones)[0],
        })
      }
    },
    getMemsMb (e) {
      const target = e && e.target ? e.target : {}
      const cpu = target.value || this.form.getFieldValue('vcpu_count')
      this.mems_mbs = this.cpu_mems_mb[cpu] || {}
      const mbCount = this.form.getFieldValue('vmem_size_mb')
      if (!mbCount || this.mems_mbs.indexOf(mbCount) === -1) {
        this.form.setFieldsValue({
          vmem_size_mb: this.mems_mbs[0],
        })
      }
      this.$emit('change')
    },
    getSpecsParams () {
      const { getFieldsValue } = this.form
      const paramsKeys = ['provider', 'cloudregion', 'engine', 'engine_version', 'category', 'storage_type']
      const PARASM = getFieldsValue(paramsKeys)
      PARASM.cloudregion_id = PARASM.cloudregion
      for (let i = 0; i < paramsKeys.length; i++) {
        const k = paramsKeys[i]
        if (!PARASM[k]) {
          return null
        }
      }
      return { ...PARASM, ...this.scopeParams }
    },
    async fetchSpecs () {
      const PARAMS = this.getSpecsParams()
      if (!PARAMS) return false
      try {
        const manager = new this.$Manager('dbinstance_skus/instance-specs', 'v2')
        const { data = {} } = await manager.list({ params: PARAMS })
        this.cpus = data.cpus
        this.cpu_mems_mb = data.cpu_mems_mb
        const { zones } = data
        if (zones) {
          this.zones = zones.zones || {}
          this.initZone()
        }
        this.initCpu()
        return data
      } catch (err) {}
    },
  },
}
</script>
