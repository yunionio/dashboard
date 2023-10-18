<template>
  <a-popover
    v-model="visible"
    destroy-tooltip-on-hide
    overlay-class-name="ip-supplement-wrap"
    trigger="click">
    <template slot="title">
      <div class="d-flex align-items-center">
        <div class="flex-fill">{{$t('common_164')}}</div>
      </div>
    </template>
    <template slot="content">
      <ip-supplement-edit-form
        label="IP"
        :loading="loading"
        @submit="onSubmit"
        @cancel="this.hideForm" />
    </template>
    <span class="oc-popover-desc">-<a-icon class="setup-icon" type="tool" />{{$t('common_165')}}</span>
  </a-popover>
</template>

<script>
import IpSupplementEditForm from './Form'

export default {
  name: 'IpSupplement',
  components: {
    IpSupplementEditForm,
  },
  props: {
    row: {
      type: Object,
      required: true,
    },
    field: {
      type: String,
      default: 'ips',
    },
    // 是否需要显示成功信息
    showSuccessMessage: {
      type: Boolean,
      default: true,
    },
    vm: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      visible: false,
      loading: false,
    }
  },
  methods: {
    hideForm () {
      this.visible = false
    },
    async onSubmit (values) {
      this.loading = true
      try {
        const onManager = this.vm.onManager || this.vm.list.onManager
        await onManager('performAction', {
          id: this.row.id,
          steadyStatus: ['running', 'ready'],
          managerArgs: {
            action: 'sync-fix-nics',
            data: {
              ip: [values.input],
            },
          },
        })
        this.$bus.$emit('VMInstanceListSingleUpdate', [this.row.id])
        if (this.showSuccessMessage) {
          this.$message.success(this.$t('common.success'))
        }
      } finally {
        this.loading = false
        this.visible = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.oc-popover-desc{
  font-size: 12px;
  color: #1890ff;
  cursor: pointer;
}
.setup-icon{
  padding: 0 2px;
  font-size: 14px;
}
</style>
