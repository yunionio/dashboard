<template>
  <div class="container1">
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
            title: this.$t('helm.text_48'),
          },
          phone: {
            type: 'string',
            title: this.$t('helm.text_49'),
            pattern: '^1[3578]\\d{9}$',
            description: this.$t('helm.text_50'),
          },
          hobby: {
            title: this.$t('helm.text_51'),
            type: 'array',
            items: {
              type: 'string',
              title: this.$t('helm.text_51'),
              enum: [this.$t('helm.text_52'), this.$t('helm.text_53'), this.$t('helm.text_54')],
            },
          },
          contacts: {
            type: 'array',
            title: this.$t('helm.text_55'),
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  title: this.$t('helm.text_48'),
                },
                phone: {
                  type: 'string',
                  title: this.$t('helm.text_49'),
                  pattern: '^1[3578]\\d{9}$',
                  description: this.$t('helm.text_50'),
                },
                sex: {
                  type: 'string',
                  title: this.$t('helm.text_56'),
                  enum: ['1', '2'],
                },
              },
              required: ['name', 'phone'],
            },
          },
          birthday: {
            type: 'string',
            title: this.$t('helm.text_57'),
            format: 'date',
          },
          job: {
            type: 'string',
            title: this.$t('helm.text_58'),
            enums: ['IT', 'Teacher', 'Doctor'],
          },
          agree: {
            type: 'boolean',
            title: this.$t('helm.text_59'),
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
          title: this.$t('helm.text_60'),
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
        name: this.$t('helm.text_61'),
        hobby: [this.$t('helm.text_53'), this.$t('helm.text_52')],
        contacts: [
          {
            name: this.$t('helm.text_62'),
            phone: '15268801392',
            sex: '2',
          },
          {
            name: this.$t('helm.text_63'),
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
        name: this.$t('helm.text_61'),
        hobby: [this.$t('helm.text_53'), this.$t('helm.text_52')],
        contacts: [
          {
            name: this.$t('helm.text_62'),
            phone: '15268801392',
            sex: '2',
          },
          {
            name: this.$t('helm.text_63'),
            phone: '15268801391',
            sex: '1',
          },
          {
            name: this.$t('helm.text_64'),
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
.container1 {
  margin: 40px auto;
  width: 1300px;
}
</style>
