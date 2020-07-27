<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ action }}</div>
    <div slot="body">
      <page-list
        show-tag-filter
        show-tag-columns
        :list="list"
        :columns="columns"
        :single-actions="singleActions" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog" :loading="loading">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import serverProps from '../mixins/serverProps'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'AssociateVirtualMachineDialog',
  mixins: [DialogMixin, WindowsMixin, serverProps],
  data () {
    return {
      action: this.$t('compute.text_483', [this.$t('dictionary.server')]),
      loading: false,
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {},
}
</script>
