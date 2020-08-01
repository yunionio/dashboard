<template>
  <div>
    <a-form-item class="mb-0">
      <a-switch checkedChildren="开" unCheckedChildren="关" v-decorator="decorator.backupEnable" @change="change" :disabled="switchDisabled" />
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
import { mapGetters } from 'vuex'
import * as R from 'ramda'

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
    domain: Object,
    availableHostCount: Number, // 可用的宿主机数量
    hostParams: {
      type: Object,
    },
  },
  data () {
    return {
      hostList: [],
      backupEnable: this.decorator.backupEnable[1].initialValue,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode']),
    switchDisabled () {
      if (this.diskType === 'gpfs') return true
      if (this.availableHostCount < 2) return true
      return false
    },
  },
  methods: {
    change (val) {
      this.backupEnable = val
      if (val) this.fetchBackupHosts()
    },
    async fetchBackupHosts () {
      if (!R.is(Object, this.hostParams)) return
      try {
        const { data: { data = [] } } = await new this.$Manager('hosts', 'v2').list({ params: this.hostParams })
        this.hostList = data
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
