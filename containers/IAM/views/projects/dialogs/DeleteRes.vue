<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('common_578')" :count="params.data.length" :action="this.params.title" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ProjectDeleteResDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      const userRoles = []
      const groupRoles = []
      this.params.data.forEach((item) => {
        const roles = item.roles
        roles.forEach((role) => {
          if (item.groupId && item.groupName) {
            const ret = {
              group: item.groupId,
              role: role.id,
            }
            groupRoles.push(ret)
          } else {
            const ret = {
              user: item.id,
              role: role.id,
            }
            userRoles.push(ret)
          }
        })
      })
      try {
        if (this.params.ok) {
          await this.params.ok()
        } else {
          const response = await new this.$Manager('projects', 'v1').performAction({
            id: this.params.projectId,
            action: 'leave',
            data: { user_roles: userRoles, group_roles: groupRoles },
          })
          if (this.params.success && R.is(Function, this.params.success)) {
            this.params.success(response)
          }
        }
        this.cancelDialog()
        this.$message.success(this.$t('system.text_455'))
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
