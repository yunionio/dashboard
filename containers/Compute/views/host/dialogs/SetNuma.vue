<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.set_numa')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.host')" :count="params.data.length" :action="$t('compute.set_numa')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 2)" />
      <a-form-model :form="form" :rules="rules" v-bind="formItemLayout">
        <a-form-model-item :label="$t('compute.sched_numa')" :extra="extraInfo">
          <a-switch v-model="form.enable_numa_allocate" :checkedChildren="$t('table.title.on')" :unCheckedChildren="$t('table.title.off')" />
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>
<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'HostSetNumaDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      form: {
        enable_numa_allocate: this.params.data[0].enable_numa_allocate || false,
      },
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
    }
  },
  computed: {
    enableHostAgentNumaAllocate () {
      return this.params.data[0].sys_info?.host_agent_cpu_numa_allocate
    },
    extraInfo () {
      return this.form.enable_numa_allocate ? '' : (this.enableHostAgentNumaAllocate ? this.$t('compute.sched_numa_extra_info_1') : this.$t('compute.sched_numa_extra_info_2'))
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        await this.params.onManager('update', {
          id: this.params.data[0].id,
          managerArgs: {
            data: {
              enable_numa_allocate: this.form.enable_numa_allocate,
            },
          },
        })
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
