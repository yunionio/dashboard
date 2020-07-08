<template>
  <div class="container">
    <json-schema-form ref="vueForm" :schema="schema" :definition="definition" :default-value="model" :hide-reset="false" @submit="onSubmit" />
  </div>
</template>

<script>
// import moment from 'moment'
export default {
  data () {
    return {
      schema: {
        title: 'basic',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            title: '姓名',
          },
          phone: {
            type: 'string',
            title: '手机',
            pattern: '^1[3578]\\d{9}$',
            description: '请输入正确的手机号码',
          },
          hobby: {
            title: '爱好',
            type: 'array',
            items: {
              type: 'string',
              title: '爱好',
              enum: ['乒乓球', '足球', '篮球'],
            },
          },
          contacts: {
            type: 'array',
            title: '通讯录',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  title: '姓名',
                },
                phone: {
                  type: 'string',
                  title: '手机',
                  pattern: '^1[3578]\\d{9}$',
                  description: '请输入正确的手机号码',
                },
                sex: {
                  type: 'string',
                  title: '性别',
                  enum: ['1', '2'],
                },
              },
              required: ['name', 'phone'],
            },
          },
          birthday: {
            type: 'string',
            title: '出生日期',
            format: 'date',
          },
          job: {
            type: 'string',
            title: '职业',
            enums: ['IT', 'Teacher', 'Doctor'],
          },
          agree: {
            type: 'boolean',
            title: '同意协议',
          },
        },
        required: ['name', 'phone', 'hobby', 'contacts', 'birthday', 'agree'],
      },
      definition: [
        {
          type: 'html',
          key: 'html',
          formItem: {
            label: '111',
          },
          input: {
            html: '<a href="##">####</a>',
          },
        },
        'name',
        {
          title: '联系方式',
          key: 'phone',
        },
        'hobby',
        'contacts',
        {
          key: 'birthday',
          // input: {
          //   disabledDate: function (current) {
          //     return current && current < moment().endOf('day')
          //   }
          // }
        },
        {
          key: 'agree',
          type: 'a-checkbox',
        },
        {
          key: 'job',
          type: 'a-radio',
        },
      ],
      model: {
        name: '王昌彬',
        hobby: ['足球', '乒乓球'],
        contacts: [
          {
            name: '王瑶',
            phone: '15268801392',
            sex: '2',
          },
          {
            name: '王瑶1',
            phone: '15268801391',
            sex: '1',
          },
        ],
        birthday: '1989-05-14',
        agree: true,
        job: 'Teacher',
      },
    }
  },
  methods: {
    onSubmit (data) {
      console.log('submit: ', data)
      const model = {
        name: '王昌彬',
        hobby: ['足球', '乒乓球'],
        contacts: [
          {
            name: '王瑶',
            phone: '15268801392',
            sex: '2',
          },
          {
            name: '王瑶1',
            phone: '15268801391',
            sex: '1',
          },
          {
            name: '王瑶2',
            phone: '15268801391',
            sex: '1',
          },
        ],
        birthday: '1989-05-14',
        agree: true,
        job: 'Teacher',
      }
      this.model = model
      this.$nextTick(() => {
        this.$refs.vueForm.form.setFieldsValue(model)
      })
    },
  },
}
</script>

<style lang="scss">
.container {
  margin: 40px auto;
  width: 1300px;
}
</style>
