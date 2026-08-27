<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('common.action.clone') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="skuName" :count="params.data.length" :action="$t('common.action.clone')" />
      <dialog-table :data="params.data" :columns="tableColumns" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('common.name')">
          <a-input v-decorator="decorators.name" />
          <template v-slot:extra>
            <name-repeated res="llm_skus" :name="form.fd.name" :default-text="$t('aice.name_repeat_extra')" />
          </template>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" :loading="loading" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
      <a-button :disabled="loading" @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { parseLlmRoute } from '@Ai/utils/llmRouteContext'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import NameRepeated from '@/sections/NameRepeated'

export default {
  name: 'LlmSkuCloneDialog',
  components: {
    NameRepeated,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const source = this.params.data[0] || {}
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {
          name: source.name ? `${source.name}-copy` : '',
        },
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: source.name ? `${source.name}-copy` : '',
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('common.name')]) },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: { span: 21 },
        labelCol: { span: 3 },
      },
    }
  },
  computed: {
    skuName () {
      const ctx = parseLlmRoute(this.$route.path)
      if (ctx.isDesktopType) return this.$t('aice.desktop_llm_sku')
      if (ctx.isApplyType) return this.$t('aice.app_llm_sku')
      return this.$t('aice.llm_sku')
    },
    tableColumns () {
      return (this.params.columns || []).slice(0, 3)
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const name = (values.name || '').trim()
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          managerArgs: {
            action: 'clone',
            data: {
              name,
              generate_name: name,
            },
          },
        })
        this.$message.success(this.$t('common.success'))
        if (this.params.refresh) this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
