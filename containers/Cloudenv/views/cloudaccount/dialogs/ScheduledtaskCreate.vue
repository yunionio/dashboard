<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('cloudenv.text_432') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('cloudenv.text_12')" class="mt-3" :count="params.data.length" :action="$t('cloudenv.text_432')" />
      <dialog-table v-if="columns && columns.length" :data="params.data" :columns="columns" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import {
  getStatusTableColumn,
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ScheduledtaskCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      columns: [
        {
          field: 'name',
          title: this.$t('table.title.name'),
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              return row.name
            },
          },
        },
        getStatusTableColumn({ statusModule: 'cloudaccount', minWidth: 90 }),
        getEnabledTableColumn({ minWidth: 90 }),
      ],
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        console.log('新建')
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
