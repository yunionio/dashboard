<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'edit' ? $t('table.action.modify') : $t('common.create') }}</div>
    <div slot="body">
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-model-item :label="$t('common.name')" prop="name">
          <a-input v-model="form.name" :placeholder="$t('common.tips.input', [$t('common.name')])" />
          <template v-slot:extra>
            <name-repeated res="llms" :name="form.name" />
          </template>
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.llm_sku')" prop="llm_sku_id">
          <base-select
            v-model="form.llm_sku_id"
            resource="llm_skus"
            :select-props="{
              placeholder: $t('common.tips.select', [$t('aice.llm_sku')]),
            }"
            :params="llmSkuParams" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.bandwidth_mb')" prop="bandwidth_mb">
          <a-input-number
            v-model="form.bandwidth_mb"
            :min="1"
            :max="10000"
            :step="1"
            :precision="0" />
        </a-form-model-item>
        <a-form-model-item :label="$t('dictionary.host')" prop="prefer_host">
          <base-select
            v-model="form.prefer_host"
            resource="hosts"
            :select-props="{
              placeholder: $t('common.tips.select', [$t('dictionary.host')]),
            }"
            :params="hostParams" />
        </a-form-model-item>
        <a-form-model-item :label="$t('compute.text_494')" :extra="$t('compute.text_495')">
          <a-switch v-model="form.auto_start" :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" />
        </a-form-model-item>
      </a-form-model>
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
import { validateModelForm } from '@/utils/validate'
import NameRepeated from '@/sections/NameRepeated'

export default {
  name: 'LlmCreateDialog',
  components: {
    NameRepeated,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        name: undefined,
        bandwidth_mb: 30,
        llm_sku_id: undefined,
        prefer_host: undefined,
        auto_start: false,
      },
      rules: {
        name: [{ required: true, validator: this.$validate('resourceName') }],
        bandwidth_mb: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.bandwidth_mb')]) }],
        llm_sku_id: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_sku')]) }],
        prefer_host: [{ required: false, message: this.$t('common.tips.select', [this.$t('dictionary.host')]) }],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 5,
        },
      },
      desktopParams: {
        limit: 20,
        scope: this.$store.getters.scope,
      },
    }
  },
  computed: {
    llmSkuParams () {
      return {
        limit: 20,
        scope: this.$store.getters.scope,
      }
    },
    hostParams () {
      return {
        limit: 20,
        scope: this.$store.getters.scope,
        host_status: 'online',
        host_type: 'container',
      }
    },
  },
  methods: {
    async handleConfirm () {
      try {
        await validateModelForm(this.$refs.form)
        await this.params.onManager('create', {
          managerArgs: {
            data: { ...this.form, generate_name: this.form.name },
          },
        })
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
