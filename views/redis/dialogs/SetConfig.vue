<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.elasticcaches')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc">
        <s-k-u :disableds="disableds" ref="REF_SKU" :decorators="decorators" :filterSkuCallback="filterSkuCallback" />
      </a-form>
    </div>
    <div slot="footer">
      <a-button :loading="loading" @click="handleConfirm" type="primary">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import SKU from '../create/components/SKU'
import changeMinxin from '../create/changeMinxin'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RedisSetConfigDialog',
  components: {
    SKU,
  },
  mixins: [DialogMixin, WindowsMixin, changeMinxin],
  data () {
    return {
      loading: false,
      disableds: {
        engine: true,
        engine_version: true,
        local_category: true,
      },
    }
  },
  computed: {
    redisItem () {
      const { data } = this.params
      const redisItem = data && data.length > 0 ? data[0] : {}
      return redisItem
    },
    decorators () {
      return {
        engine: [
          'engine',
          {
            initialValue: this.redisItem.engine.toLowerCase(),
          },
        ],
        engine_version: [
          'engine_version',
          {
            initialValue: this.redisItem.engine_version,
          },
        ],
        local_category: [
          'local_category',
          {
            initialValue: this.redisItem.local_category || this.redisItem.arch_type,
          },
        ],
      }
    },
    scopeParams () {
      if (this.$store.getters.isAdminMode) {
        return {
          project_domain: this.redisItem.domain_id,
        }
      } else {
        return {
          scope: this.$store.getters.scope,
        }
      }
    },
  },
  async created () {
    const redisKeys = ['billing_type', 'provider', 'cloudregion', 'zone']
    redisKeys.forEach(k => {
      const value = this.redisItem[`${k}_id`] || this.redisItem[k]
      this.form.fc.getFieldDecorator(k, { initialValue: value, preserve: true })
    })
    await this.$nextTick()
    this.area_change()
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const sku = this.form.fc.getFieldValue('sku') || {}
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          steadyStatus: 'running',
          managerArgs: {
            action: 'change-spec',
            data: {
              sku: sku.id,
            },
          },
        })
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    filterSkuCallback (row) {
      const mdSize = this.redisItem.memory_size_mb || this.redisItem.capacity_mb
      if (mdSize < row.memory_size_mb) {
        return true
      }
      return false
    },
  },
}
</script>
