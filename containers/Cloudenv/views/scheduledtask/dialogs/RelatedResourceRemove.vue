<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_452')}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="$t('cloudenv.text_452')" :name="$t('cloudenv.text_469')" />
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
  name: 'RelatedResourceRemoveDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  computed: {
    columns () {
      const fields = ['name', 'status']
      return this.params.columns.filter(item => {
        const { field } = item
        return fields.indexOf(field) > -1
      })
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      const { data } = this.params
      const manager = new this.$Manager('scheduledtasks', 'v1')
      try {
        const ids = data.map(({ id }) => id)
        const labels = this.params.resData.labels.filter((item) => !ids.includes(item))
        const res = await manager.performAction({
          id: this.params.resData.id,
          action: 'set-labels',
          data: {
            labels,
          },
        })
        this.cancelDialog()
        this.$bus.$emit('ScheduledtasksListSingleRefresh', [this.params.resData.id])
        this.params.success(res.data.labels)
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
