<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.wire.merge')}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">{{$t('network.text_755')}}</div>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.wire')" :count="params.data.length" :action="$t('network.wire.merge')" />
      <dialog-table :data="params.data" :columns="columns" :expandConfig="expandConfig" />
      <a-checkbox @change="onChange">
        {{ $t('network.wire.merge.subnet') }}
        <a-tooltip placement="top">
          <template slot="title">
            <span>{{ $t('network.wire.merge.tooltip')}}</span>
          </template>
          <a-icon type="question-circle" />
        </a-tooltip>
      </a-checkbox>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { getHostsTableColumn } from '../utils/columns'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'WireMergeDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      mergeSubnet: false,
    }
  },
  computed: {
    columns () {
      const cols = this.params.columns.filter((col) => { return ['name', 'networks'].indexOf(col.field) >= 0 })
      cols.push(getHostsTableColumn())
      return cols
    },
    expandConfig () {
      return this.params.expandConfig
    },
  },
  methods: {
    onChange (e) {
      this.mergeSubnet = e.target.checked
    },
    async handleConfirm () {
      this.loading = true
      try {
        await new this.$Manager('wires').performAction({
          id: this.params.data[0].id,
          action: 'merge-from',
          data: {
            sources: this.params.data.slice(1).map((item) => { return item.id }),
            merge_network: this.mergeSubnet,
          },
        })
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>

</style>
