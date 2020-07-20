<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">合并安全组</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.secgroup')" :count="params.data.length" action="合并" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="指定要合并安全组" v-bind="formItemLayout">
          <a-select v-decorator="decorators.name" mode="multiple">
            <a-select-option v-for="item in secgroupOps" :key="item.id" :value="item.id">
              {{item.name}}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
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
  name: 'ConcatSecgroupDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            rules: [
              { required: true, message: '请选择要合并的安全组名称' },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
      secgroupOps: [],
    }
  },
  computed: {
    scope () {
      return this.$store.getters.scope
    },
  },
  created () {
    this.remoteMethod()
  },
  methods: {
    remoteMethod () {
      const params = {
        details: true,
        equals: this.params.data[0].id,
        limit: 0,
        scope: this.scope,
      }
      new this.$Manager('secgroups').list({ params })
        .then(({ data: { data = [] } }) => {
          this.secgroupOps = data.filter(val => val.id !== this.params.data[0].id)
        })
    },
    doConcat (data) {
      return new this.$Manager('secgroups').performAction({
        id: this.params.data[0].id,
        action: 'merge',
        data: {
          secgroups: data.name,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doConcat(values)
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
