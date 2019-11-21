<template>
  <div v-if="cpu_mems_mb">
    <a-form-item label="CPU核数" v-bind="formItemLayout">
      <a-radio-group v-decorator="['vcpu_count']" @change="getMemsMb">
        <a-radio-button :key="cpu" :value="cpu" v-for="cpu in cpus">{{cpu}}核</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="内存" v-bind="formItemLayout">
      <a-radio-group v-decorator="['vmem_size_mb']" @change="$emit('change')">
        <a-radio-button :key="size" :value="size" v-for="size in mems_mbs">{{sizestr(size, 'M', 1024)}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="可用区" v-bind="formItemLayout">
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
  inject: ['form', 'formItemLayout'],
  data () {
    return {
      cpus: [],
      mems_mbs: [],
      zones: {},
      cpu_mems_mb: undefined,
    }
  },
  created () {
    console.log(this.$slots)
  },
  methods: {
    sizestr,
    initCpu () {
      const count = this.form.getFieldValue('vcpu_count')
      if (!count || this.cpus.indexOf(count) === -1) {
        this.form.setFieldsValue({
          vcpu_count: this.cpus[0],
        })
      }
    },
    initZone () {
      const zones = this.form.getFieldValue('zones')
      if (!zones) {
        this.form.setFieldsValue({
          zones: Object.keys(this.zones)[0],
        })
      }
    },
    getMemsMb (e) {
      const target = e && e.target ? e.target : {}
      const cpu = target.value || this.form.getFieldValue('vcpu_count')
      this.mems_mbs = this['cpu_mems_mb'][cpu] || {}
      this.$nextTick(() => {
        const mbCount = this.form.getFieldValue('vmem_size_mb')
        if (!mbCount || this.mems_mbs.indexOf(mbCount) === -1) {
          this.form.setFieldsValue({
            vmem_size_mb: this.mems_mbs[0],
          })
        }
        this.$emit('change')
      })
    },
    getSpecsParams () {
      const { getFieldsValue } = this.form
      const paramsKeys = ['provider', 'cloudregion', 'engine', 'engine_version', 'category', 'storage_type']
      return new Promise((resolve, reject) => {
        this.$nextTick(() => {
          const PARASM = getFieldsValue(paramsKeys)
          PARASM['cloudregion_id'] = PARASM['cloudregion']
          resolve(PARASM)
        })
      })
    },
    async fetchSpecs () {
      const PARAMS = await this.getSpecsParams()
      try {
        const manager = new this.$Manager('dbinstance_skus/instance-specs', 'v2')
        const { data = {} } = await manager.list({ params: PARAMS })
        this.cpus = data['cpus']
        this.cpu_mems_mb = data['cpu_mems_mb']
        this.initCpu()
        this.getMemsMb()
        const { zones } = data
        if (zones) {
          this.zones = zones.zones || {}
        }
        this.initZone()
        return data
      } catch (err) {}
    },
  },
}
</script>
