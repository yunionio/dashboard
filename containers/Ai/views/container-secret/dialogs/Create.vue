<template>
  <base-dialog :width="700" @cancel="cancelDialog">
    <div slot="header">{{ $t('common.create') }} - {{ $t('aice.container_secret') }}</div>
    <div slot="body">
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('common.name')">
          <a-input
            v-decorator="decorators.name"
            :placeholder="$t('common.tips.input', [$t('common.name')])" />
        </a-form-item>
        <a-form-item :label="$t('aice.container_secret')" :extra="$t('aice.container_secret.add_pair')">
          <div v-for="(item, index) in items" :key="item.id" class="d-flex align-items-start mb-2">
            <a-input
              v-model="item.key"
              :placeholder="$t('aice.container_secret.key')"
              class="mr-2"
              style="flex: 1; min-width: 0" />
            <span class="mr-2 mt-2">=</span>
            <a-input
              v-model="item.value"
              :placeholder="$t('aice.container_secret.value')"
              class="mr-2"
              style="flex: 1; min-width: 0" />
            <a-button
              type="danger"
              shape="circle"
              icon="delete"
              size="small"
              class="mt-1"
              :disabled="items.length <= 1"
              @click="removeRow(index)" />
          </div>
          <a-button type="dashed" block icon="plus" @click="addRow">
            {{ $t('aice.container_secret.add_pair') }}
          </a-button>
          <div v-if="blobError" class="text-danger mt-1">{{ blobError }}</div>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" :loading="loading" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { uuid } from '@/utils/utils'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ContainerSecretCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      blobError: '',
      items: [
        { id: uuid(), key: '', value: '' },
      ],
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {},
      },
      decorators: {
        name: [
          'name',
          {
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('common.name')]) },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 4 },
      },
    }
  },
  methods: {
    addRow () {
      this.items.push({ id: uuid(), key: '', value: '' })
      this.blobError = ''
    },
    removeRow (index) {
      if (this.items.length <= 1) return
      this.items.splice(index, 1)
      this.blobError = ''
    },
    buildBlob () {
      const blob = {}
      for (const item of this.items) {
        const k = (item.key || '').trim()
        const v = (item.value || '').trim()
        if (k) blob[k] = v
      }
      return blob
    },
    async handleConfirm () {
      this.blobError = ''
      const values = await this.form.fc.validateFields().catch(() => null)
      if (!values) return
      const blob = this.buildBlob()
      if (Object.keys(blob).length === 0) {
        this.blobError = this.$t('common.tips.input', [this.$t('aice.container_secret')])
        return
      }
      this.loading = true
      try {
        const manager = new this.$Manager('credentials', 'v1')
        await manager.create({
          data: {
            type: 'container_secret',
            name: values.name || '',
            blob,
          },
        })
        this.$message.success(this.$t('common.success'))
        this.params.callback && this.params.callback()
        this.cancelDialog()
      } catch (e) {
        throw e
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.mr-2 {
  margin-right: 8px;
}
.mb-2 {
  margin-bottom: 8px;
}
.mt-1 {
  margin-top: 4px;
}
.mt-2 {
  margin-top: 8px;
}
</style>
