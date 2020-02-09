<template>
  <div>
    <a-form-item class="mb-0">
      <a-switch v-decorator="decorator.backupEnable" @change="change" :disabled="switchDisabled" />
    </a-form-item>
    <a-form-item class="mt-2" v-if="backupEnable && $store.getters.isAdminMode">
      <base-select
        v-decorator="decorator.backup"
        :options="hostList"
        :select-props="{ placeholder: '请选择备份机的宿主机' }"
        :disabled-items="disabledItems" />
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import { Manager } from '@/utils/manager'

export default {
  name: 'Backup',
  props: {
    decorator: {
      type: Object,
      required: true,
      validator: val => R.is(Array, val.backupEnable) && R.is(Array, val.backup),
    },
    disabledItems: {
      type: Array,
      default: () => [],
    },
    diskType: { // 系统盘磁盘类型
      type: String,
    },
  },
  data () {
    return {
      hostList: [],
      backupEnable: this.decorator.backupEnable[1].initialValue,
    }
  },
  computed: {
    switchDisabled () {
      if (this.diskType === 'gpfs') return true
      if (this.hostList.length < 2) return true
      return false
    },
  },
  created () {
    this.getBackupHosts()
  },
  methods: {
    change (val) {
      this.backupEnable = val
    },
    getBackupHosts () {
      new Manager('hosts', 'v2')
        .list({ params: { hypervisor: 'kvm', enabled: 1 } })
        .then(({ data: { data = [] } }) => {
          this.hostList = data
        })
    },
  },
}
</script>
