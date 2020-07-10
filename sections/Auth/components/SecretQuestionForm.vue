<template>
  <a-card style="border: none;">
    <h5 class="text-center mb-4">{{ title }}</h5>
    <a-form :form="form.fc" @submit.prevent="handleSubmit">
      <template v-for="(questionGroup, idx) of questionGroupKeys">
        <div :key="idx">
          <a-form-item :label="`${$t('common.text00113')}${idx + 1}`" v-bind="formItemLayout">
            <a-select :placeholder="$t('common.text00114')" v-decorator="decorators[`question${idx}`]" :disabled="isVerify">
              <a-select-option
                v-for="question of questionOptions[questionGroup]"
                :key="question.label"
                :value="question.label">{{ question.label }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :label="$t('common.text00115')" v-bind="formItemLayout">
            <a-input :placeholder="$t('auth.question.answer.placeholder')" v-decorator="decorators[`answer${idx}`]" />
          </a-form-item>
        </div>
      </template>
      <a-form-item>
        <div class="text-center">
          <a-button @click="$router.back()">{{ $t('common.text00116') }}</a-button>
          <a-button class="ml-2" type="primary" html-type="submit" :loading="loading">{{ submitText }}</a-button>
        </div>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script>
import i18n from '@/locales'

export default {
  name: 'SecretQuestionForm',
  props: {
    title: {
      type: String,
      default: i18n.t('auth.mfa.title'),
    },
    loading: Boolean,
    questions: Array,
    submitText: {
      type: String,
      default: i18n.t('auth.mfa.submit'),
    },
  },
  data () {
    const authSecretQuestion = this.$t('authSecretQuestion')
    const questionGroupKeys = Object.keys(authSecretQuestion)
    const decorators = {}
    for (let i = 0, len = questionGroupKeys.length; i < len; i++) {
      let initQuestion = authSecretQuestion[questionGroupKeys[i]][0].label
      if (this.questions && this.questions.length) {
        initQuestion = this.questions[i]
      }
      decorators[`question${i}`] = [`question${i}`, {
        initialValue: initQuestion,
      }]
      decorators[`answer${i}`] = [`answer${i}`, {
        rules: [
          { required: true, min: 1, max: 15, message: this.$t('auth.question.answer.validate') },
        ],
      }]
    }
    return {
      form: {
        fc: this.$form.createForm(this),
      },
      questionOptions: authSecretQuestion,
      questionGroupKeys,
      formItemLayout: {
        wrapperCol: {
          md: { span: 21 },
          xl: { span: 21 },
          xxl: { span: 21 },
        },
        labelCol: {
          md: { span: 3 },
          xl: { span: 3 },
          xxl: { span: 3 },
        },
      },
      decorators,
    }
  },
  computed: {
    isVerify () {
      return this.questions && this.questions.length > 0
    },
  },
  methods: {
    handleSubmit () {
      this.form.fc.validateFields((err, values) => {
        if (err) return
        const data = []
        for (let i = 0, len = this.questionGroupKeys.length; i < len; i++) {
          data.push({
            question: values[`question${i}`],
            answer: values[`answer${i}`],
          })
        }
        this.$emit('submit', data)
      })
    },
  },
}
</script>
