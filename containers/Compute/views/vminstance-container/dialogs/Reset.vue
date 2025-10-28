<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <template v-slot:message>
          <div>{{$t('compute.text_1227')}}</div>
          <div class="mt-2">{{$t('compute.text_1228')}}</div>
        </template>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.server_container')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
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
  name: 'VmContainerResetDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.text_354'),
    }
  },
  computed: {
    columns () {
      const showFields = ['name', 'ip', 'instance_type']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
  },
  methods: {
    async doResetSubmit () {
      const ids = this.params.data.map(item => item.id)
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: 'running',
        managerArgs: {
          action: 'reset',
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doResetSubmit()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
