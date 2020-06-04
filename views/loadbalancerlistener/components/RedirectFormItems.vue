<template>
  <div>
    <a-form-item label="重定向">
      <a-switch @change="handleRedirectChange" v-decorator="decorators.redirect" />
    </a-form-item>
    <template v-if="form.fc.getFieldValue('redirect') || form.fc.getFieldValue('redirect') === 'off'">
      <a-form-item label="重定向方式">
        <a-radio-group v-decorator="decorators.redirect_code">
          <a-radio-button v-for="(item, k) in $t('redirect_code')" :value="parseInt(k)" :key="k">
              {{item.name}}
              <a-tooltip placement="right" :title="item.description">
                <icon type="question" />
              </a-tooltip>
            </a-radio-button>
          </a-radio-group>
      </a-form-item>
      <a-form-item label="重定向至" class="mb-0">
        <a-input-group compact>
          <a-row class="w-100">
            <a-col :span="4">
              <a-form-item>
                <a-select class="w-100" v-decorator="decorators.redirect_scheme">
                  <a-select-option value="http">HTTP</a-select-option>
                  <a-select-option value="https">HTTPS</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item>
                <a-input v-decorator="decorators.redirect_host" placeholder="请输入域名或IP地址（端口号）" />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item>
                <a-input v-decorator="decorators.redirect_path" placeholder="请输入URL路径（可选）" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-input-group>
      </a-form-item>
    </template>
  </div>
</template>

<script>
export default {
  name: 'LbRedirect',
  props: {
    form: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      loading: false,
      isGoogle: false,
      decorators: {
        redirect: ['redirect'],
        redirect_code: ['redirect_code', {
          initialValue: 301,
        }],
        redirect_scheme: ['redirect_scheme', {
          initialValue: 'http',
        }],
        redirect_host: ['redirect_host'],
        redirect_path: ['redirect_path', {
          rules: [
            {
              validator: (rule, value, _callback) => {
                /* eslint-disable no-useless-escape */
                if (value && !/^\/(\w+\/?)+$/.test(value)) {
                  _callback(new Error('请输入以“/”开头的正确路径'))
                }
                _callback()
              },
              trigger: ['blur', 'change'],
            },
          ],
        }],
      },
    }
  },
  methods: {
    handleRedirectChange (bool) {
      const { redirectChange } = (this.$listeners || {})
      if (redirectChange) {
        return redirectChange(bool)
      }
      this.$store.dispatch('common/updateObject', {
        name: 'lbRedirected',
        data: {
          isLbRedirected: bool,
        },
      })
    },
  },
}
</script>
