<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="params.title" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc">
        <s-k-u :disableds="disableds" :decorators="decorators" :filterSkuCallback="filterSkuCallback" />
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RedisSetConfigDialog',
  components: {
    SKU,
  },
  mixins: [DialogMixin, WindowsMixin],
  provide () {
    return {
      form: this.form,
    }
  },
  data () {
    return {
      loading: false,
      disableds: {
        engine: true,
        engine_version: true,
        local_category: true,
      },
      form: {
        fc: this.$form.createForm(this),
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
  },
  created () {
    this.form.fc.getFieldDecorator('provider', { initialValue: this.redisItem.provider })
    this.form.fc.getFieldDecorator('region', { initialValue: this.redisItem.cloudregion_id })
    this.form.fc.getFieldDecorator('zone', { initialValue: this.redisItem.zone_id })
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        this.loading = false
        const sku = this.form.fc.getFieldValue('sku') || {}
        await this.params.list.onManager('performAction', {
          id: this.params.data[0].id,
          steadyStatus: 'running',
          managerArgs: {
            action: 'change-spec',
            data: {
              sku: sku.id,
            },
          },
        })
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
