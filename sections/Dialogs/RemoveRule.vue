<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('k8s.text_68')}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :name="$t('k8s.text_378')" :action="$t('common.delete')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'K8SRemoveRuleDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      data: this.params.data[0],
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        if (!R.is(Number, this.params.rowIndex)) return
        const { rulesPath } = this.params
        let rules = (_.get(this.params.resourceData, rulesPath) || []).slice(0)
        rules.splice(this.params.rowIndex, 1)
        rules = rules.map(val => ({ apiGroups: val.apiGroups, resources: val.resources, verbs: val.verbs }))
        await this.params.onManager('update', {
          id: this.params.resourceData.id,
          managerArgs: {
            data: {
              rules,
            },
          },
        })
        this.loading = false
        this.params.success && this.params.success()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
