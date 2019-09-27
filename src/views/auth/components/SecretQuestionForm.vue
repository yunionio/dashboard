<template>
  <a-card>
    <h5 class="text-center mb-4">{{ title }}</h5>
    <a-form :form="form.fc" @submit.prevent="handleSubmit">
      <template v-for="(questionGroup, idx) of questionGroupKeys">
        <div :key="idx">
          <a-form-item :label="`问题${idx + 1}`" v-bind="formItemLayout">
            <a-select placeholder="选择问题" v-decorator="decorators[`question${idx}`]" :disabled="isVerify">
              <a-select-option
                v-for="question of questionOptions[questionGroup]"
                :key="question.label"
                :value="question.label">{{ question.label }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="答案" v-bind="formItemLayout">
            <a-input placeholder="请输入答案，15个字以内" v-decorator="decorators[`answer${idx}`]" />
          </a-form-item>
        </div>
      </template>
      <a-form-item>
        <div class="text-center">
          <a-button @click="$router.back()">返回</a-button>
          <a-button class="ml-2" type="primary" html-type="submit" :loading="loading">{{ submitText }}</a-button>
        </div>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script>
import { SECRET_QUESTION_OPTIONS } from '../constants'

export default {
  name: 'SecretQuestionForm',
  props: {
    title: {
      type: String,
      default: '请回答以下安全问题，用以身份验证',
    },
    loading: Boolean,
    questions: Array,
    submitText: {
      type: String,
      default: '开启MFA认证',
    },
  },
  data () {
    const questionGroupKeys = Object.keys(SECRET_QUESTION_OPTIONS)
    const decorators = {}
    for (let i = 0, len = questionGroupKeys.length; i < len; i++) {
      let initQuestion = SECRET_QUESTION_OPTIONS[questionGroupKeys[i]][0]['label']
      if (this.questions && this.questions.length) {
        initQuestion = this.questions[i]
      }
      decorators[`question${i}`] = [`question${i}`, {
        initialValue: initQuestion,
      }]
      decorators[`answer${i}`] = [`answer${i}`, {
        rules: [
          { required: true, min: 1, max: 15, message: '请输入合法答案，1 至 15个字符' },
        ],
      }]
    }
    return {
      form: {
        fc: this.$form.createForm(this),
      },
      questionOptions: SECRET_QUESTION_OPTIONS,
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
