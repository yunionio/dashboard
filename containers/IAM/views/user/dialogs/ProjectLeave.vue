<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.project')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
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
  name: 'UserProjectLeaveDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      const manager = new this.$Manager('users', 'v1')
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
        const params = {
          group: true,
          project_roles: pids,
        }
        await manager.performAction({
          id: this.params.uid,
          action: 'leave',
          data: params,
        })
        this.cancelDialog()
        this.$bus.$emit('UserSidepageProjectsListRefresh')
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
