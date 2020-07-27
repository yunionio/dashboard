<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('network.text_19')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-checkbox class="mt-2" v-model="canDelete">{{$t('network.text_358')}}</a-checkbox>
    </div>
    <div slot="footer">
      <a-button :disabled="!canDelete" type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button  @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ClusterDeleteDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      canDelete: false,
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        this.loading = false
        if (this.params.data && this.params.data.length > 1) {
          const ids = this.params.data.map(({ id }) => id)
          await this.params.onManager('batchDelete', {
            id: ids,
          })
        } else {
          await this.params.onManager('delete', {
            id: this.params.data[0].id,
          })
        }
        this.cancelDialog()
        this.$message.success(this.$t('network.text_290'))
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
