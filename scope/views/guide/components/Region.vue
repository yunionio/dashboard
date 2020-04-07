<template>
  <a-form :form="form.fc" v-bind="formItemLayout">
    <a-form-item label="名称">
      <a-input v-decorator="decorators.name" placeholder="请输入名称" />
    </a-form-item>
    <a-form-item label="备注">
      <a-input v-decorator="decorators.description" placeholder="请输入备注" />
    </a-form-item>
  </a-form>
</template>

<script>
export default {
  name: 'GuideRegionCreate',
  inject: ['formItemLayout'],
  data () {
    return {
      loading: false,
      region: {},
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入区域名称' },
            ],
          },
        ],
        description: [
          'description',
          {
            rules: [
              { max: 600, message: '备注最长不能超过600个字符' },
            ],
          },
        ],
      },
    }
  },
  created () {
    this.manager = new this.$Manager('cloudregions')
    this.fetchRegion()
  },
  methods: {
    async fetchRegion () {
      try {
        const { data = {} } = await this.manager.list({
          params: {
            id: 'default',
          },
        })
        const list = (data.data || [])
        if (list.length > 0) {
          const item = list[0]
          this.region = item
          this.form.fc.setFieldsValue({
            name: item.name,
            description: item.description,
          })
        }
      } catch (error) {
        throw error
      }
    },
    async doSubmit () {
      try {
        const values = await this.form.fc.validateFields()
        const { data } = await this.manager.update({
          id: this.region.id,
          data: values,
        })
        return ['region', data]
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
