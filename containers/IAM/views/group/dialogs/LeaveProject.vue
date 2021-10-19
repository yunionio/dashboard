<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('system.text_197', [$t('dictionary.group')]) }}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="$t('system.text_196', [$t('dictionary.group')])" :name="$t('dictionary.project')" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'GroupLeaveProjectDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('groups', 'v1')
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const pids = []
        this.params.data.forEach(p => {
          p.roles.forEach(r => {
            pids.push({
              project: p.id,
              role: r.id,
            })
          })
        })
        const values = {
          project_roles: pids,
        }
        await this.manager.performAction({
          id: this.params.resId,
          action: 'leave',
          data: values,
        })
        this.loading = false
        this.params.success()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
