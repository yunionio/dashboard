<template>
  <div>
    <a-form-item :label="$t('network.text_368')">
      <a-switch v-decorator="decorators.redirect" @change="handleRedirectChange" />
    </a-form-item>
    <template v-if="form.fc.getFieldValue('redirect') || form.fc.getFieldValue('redirect') === 'off'">
      <a-form-item :label="$t('network.text_369')">
        <a-radio-group v-decorator="decorators.redirect_code">
          <a-radio-button v-for="(item, k) in $t('redirect_code')" :value="parseInt(k)" :key="k">
              {{item.name}}
              <a-tooltip placement="right" :title="item.description">
                <icon type="question" />
              </a-tooltip>
            </a-radio-button>
          </a-radio-group>
      </a-form-item>
      <a-form-item :label="$t('network.text_370')">
        <a-input v-show="false" v-decorator="decorators.check" />
        <a-input-group compact>
          <a-row class="w-100">
            <a-col :span="4">
              <a-form-item class="mb-0">
                <a-select class="w-100" v-decorator="decorators.redirect_scheme">
                  <a-select-option value="http">HTTP</a-select-option>
                  <a-select-option value="https">HTTPS</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item class="mb-0">
                <a-input v-decorator="decorators.redirect_host" :placeholder="$t('network.text_371')" />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item class="mb-0">
                <a-input v-decorator="decorators.redirect_path" :placeholder="$t('network.text_372')" />
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
        redirect: ['redirect', {
          valuePropName: 'checked',
        }],
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
                  _callback(new Error(this.$t('network.text_373')))
                }
                _callback()
              },
              trigger: ['blur', 'change'],
            },
          ],
        }],
        check: ['check', {
          rules: [
            {
              validator: (rule, value, _callback) => {
                const { validateFields } = this.form.fc
                this.$nextTick(() => {
                  validateFields(['redirect_scheme', 'redirect_host', 'redirect_path', 'listener_type'], (errs, vals) => {
                    const { listener_type, redirect_scheme, redirect_host, redirect_path } = vals
                    if (errs || !listener_type) {
                      _callback()
                    }
                    if (listener_type === redirect_scheme && !redirect_host && !redirect_path) {
                      return _callback(new Error(this.$t('network.text_374')))
                    } else {
                      _callback()
                    }
                  })
                })
              },
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
