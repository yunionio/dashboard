<template>
  <div>
    <a-form-item class="mb-0">
      <a-switch v-decorator="decorator.backupEnable" @change="change" :disabled="switchDisabled" />
    </a-form-item>
    <a-form-item class="mt-2" v-if="backupEnable">
      <base-select
        v-if="backupEnable"
        v-decorator="decorator.backup"
        resource="hosts"
        :need-params="true"
        :options.sync="hostList"
        :params="{ hypervisor: 'kvm', enabled: 1 }"
        :select-props="{ placeholder: '请选择备份机的宿主机' }"
        :disabled-items="disabledItems" />
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'

export default {
  name: 'Backup',
  props: {
    decorator: {
      type: Object,
      required: true,
      validator: val => R.is(Array, val.backupEnable) && R.is(Array, val.backup),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    disabledItems: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      hostList: [],
      backupEnable: false,
      switchDisabled: this.disabled,
    }
  },
  watch: {
    hostList (val) {
      if (!this.disabled) {
        this.switchDisabled = val.length < 2
      } else {
        this.switchDisabled = true
      }
    },
  },
  methods: {
    change (val) {
      this.backupEnable = val
    },
  },
}
</script>
