<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('k8s.vc_set_labels') }}</div>
    <div slot="body">
      <div class="mb-2">{{ $t('k8s.vc_set_labels_hint') }}</div>
      <div v-for="(row, index) in rows" :key="index" class="d-flex align-items-center mb-2">
        <a-input v-model="row.key" :placeholder="$t('k8s.vc_label_key')" class="mr-2" />
        <a-input v-model="row.value" :placeholder="$t('k8s.vc_label_value')" class="mr-2" />
        <a-button type="link" @click="rows.splice(index, 1)">{{ $t('k8s.vc_remove') }}</a-button>
      </div>
      <a-button type="dashed" @click="rows.push({ key: '', value: '' })">{{ $t('k8s.text_81', [$t('k8s.text_82')]) }}</a-button>
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
  name: 'K8SNodeSetLabelsDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const labels = (this.params.data[0] && this.params.data[0].labels) || {}
    const rows = Object.keys(labels).sort().map(key => ({
      key,
      value: labels[key],
    }))
    return {
      loading: false,
      rows: rows.length ? rows : [{ key: '', value: '' }],
    }
  },
  methods: {
    async handleConfirm () {
      const obj = this.params.data[0]
      const labels = {}
      this.rows.forEach(row => {
        const key = (row.key || '').trim()
        if (!key) return
        labels[key] = row.value == null ? '' : String(row.value)
      })
      this.loading = true
      try {
        await new this.$Manager('k8s_nodes', 'v1').performAction({
          id: obj.id,
          action: 'set-labels',
          data: {
            cluster: obj.cluster,
            labels,
          },
        })
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
