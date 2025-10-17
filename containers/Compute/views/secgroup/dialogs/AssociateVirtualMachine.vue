<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ action }}</div>
    <div slot="body">
      <page-list
        show-tag-filter
        show-tag-columns
        :list="list"
        :columns="columns"
        :single-actions="singleActions"
        :enableVirtualScroll="false" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog" :loading="loading">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import serverProps from '../mixins/serverProps'

export default {
  name: 'AssociateVirtualMachineDialog',
  mixins: [DialogMixin, WindowsMixin, serverProps],
  data () {
    return {
      action: this.$t('compute.associated_instances'),
      loading: false,
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {},
}
</script>
