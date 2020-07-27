<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{config.action}}</div>
    <div slot="body">
      <a-alert v-if="config.message" class="mb-2" type="warning" :message="config.message" />
      <dialog-selected-tips :count="params.data.length" :action="config.action" :name="name" />
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
  name: 'EnabledSwitchDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  computed: {
    columns () {
      const fields = this.params.fields || ['name', 'enabled', 'status']
      return this.params.columns.filter(item => {
        const { field } = item
        return fields.indexOf(field) > -1
      })
    },
    name () {
      const { resourceName, resource } = this.params
      if (resourceName) {
        return resourceName
      }
      const txt = this.$t(`dictionary.${resource}`)
      if (txt && txt.indexOf('dictionary') === -1) {
        return txt
      } else {
        const _k = resource.substring(0, resource.length - 1)
        const txt = this.$t(`dictionary.${_k}`)
        return txt.indexOf('dictionary') === -1 ? txt : this.$t('common_92')
      }
    },
    config () {
      const { action, resource } = this.params
      const message = this.$t('enabledSwitchMessage')[`${resource}.${action}`]
      const opthions = {
        enable: {
          action: this.$t('status.enabled').true,
          message,
        },
        disable: {
          action: this.$t('status.enabled').false,
          message,
        },
      }
      return opthions[action]
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      const { action, onOk } = this.params
      try {
        if (onOk) {
          await onOk()
        } else {
          await this.params.onManager('batchPerformAction', {
            id: this.params.data.map(item => item.id),
            managerArgs: {
              action,
            },
          })
        }
        this.cancelDialog()
        this.$message.success(this.$t('common_93'))
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
