<template>
  <div class="spec">
    <a-form-item>
      <a-select v-decorator="decorator" placeholder="请选择规格" label-in-value>
        <a-select-option v-for="item in specOpts" :key="item.key">{{ item.label }}</a-select-option>
      </a-select>
    </a-form-item>
  </div>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import { sizestr } from '@/utils/utils'

export default {
  name: 'Spec',
  props: {
    decorator: {
      type: Array,
      required: true,
    },
  },
  data () {
    return {
      specs: {},
      specOpts: [],
    }
  },
  inject: ['fi', 'form'],
  watch: {
    'fi.capability' (data, oldData) {
      if (!R.equals(data, oldData)) {
        this.loadSpecOpts(data.specs.hosts)
      }
    },
  },
  methods: {
    genSpecObj (data) {
      let specs = {}
      let entries = Object.entries(data)
      entries = entries.map(item => {
        let newKey = item[0].replace(/model:.+\//, '')
        return [newKey, item[1]]
      })
      entries.forEach(item => {
        specs[item[0]] = item[1]
      })
      return specs
    },
    genSpecOpts (specs) {
      let options = []
      for (let k in specs) {
        let spec = {
          label: this._getSpecification(specs[k]),
          key: k,
        }
        options.push(spec)
      }
      return options
    },
    loadSpecOpts (data) {
      this.specs = this.genSpecObj(data)
      this.$bus.$emit('VMInstanceCreateUpdateFi', { specs: this.specs }) // 广播事件
      this.specOpts = this.genSpecOpts(this.specs)
      if (this.specOpts && this.specOpts.length) { // 默认选择下拉第一个
        this.form.setFieldsValue({
          spec: _.get(this.specOpts, '[0]', { key: '', label: '' }),
        })
      }
    },
    _getSpecification (spec) {
      let cpu = spec.cpu
      let mem = sizestr(spec.mem, 'M', 1024)
      // 按类型和容量归并磁盘信息
      let disksObj = {}
      _.forEach(spec.disk, function (adapters, driver) {
        _.forEach(adapters, function (disks, adapter) {
          _.forEach(disks, function (disk) {
            disksObj[disk.type] = disksObj[disk.type] || {}
            disksObj[disk.type][disk.size] = disksObj[disk.type][disk.size] || 0
            disksObj[disk.type][disk.size] += disk.count
          })
        })
      })
      // disk string
      let disksStr = ''
      _.forEach(disksObj, function (diskTypeValue, diskType) {
        disksStr += '_' + diskType
        let sizes = []
        _.forEach(diskTypeValue, function (num, disksize) {
          sizes.push(sizestr(disksize, 'M', 1024) + 'x' + num)
        })
        disksStr += sizes.join('_')
      })
      return `${cpu}C${mem}${disksStr}`
    },
  },
}
</script>
