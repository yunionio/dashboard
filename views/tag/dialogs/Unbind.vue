<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">解绑</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="解绑" name="资源" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'TagUnbindDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    async handleConfirm () {
      const bindedTags = {}
      R.forEachObjIndexed((value, key) => {
        if (key.startsWith('ext:') || key.startsWith('ext:')) {
          bindedTags[key] = value
        }
      }, this.params.data.metadata)
      delete bindedTags[this.params.tagData.key]
      const data = {}
      R.forEachObjIndexed((value, key) => {
        const _key = R.replace(/(ext:|user:)/, '', key)
        data[_key] = value
      }, bindedTags)
      this.loading = true
      try {
        this.loading = true
        const ids = this.params.data.map(item => item.id)
        await this.params.list.onManager('batchPerformAction', {
          id: ids,
          managerArgs: {
            action: 'set-user-metadata',
            data,
          },
        })
        await this.params.list.refresh()
        this.$bus.$emit('TagListUnbindResourceCallback', {
          tagData: this.params.tagData,
        })
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
