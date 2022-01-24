<template>
  <div>
    <page-header :title="$t('system.text_130', [$t('system.notify_channels')])" />
    <page-body>
      <a-form
        class="mt-3"
        :form="form.fc"
        v-bind="formItemLayout"
        hideRequiredMark>
        <scope-radio
          :decorators="decorators"
          :form="form"
          :hidden-scope="['project']"
          :label="$t('common_547', [])"
          @change="scopeChange"  />
        <a-form-item :label="$t('common.name')">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
          <name-repeated
              v-slot:extra
              res="notifyconfigs"
              version="v1"
              :name="form.fd.name" />
        </a-form-item>
        <a-form-item :label="$t('system.text_48')">
          <a-radio-group v-decorator="decorators.type">
            <a-radio-button
              v-for="item in typesOpts"
              :value="item.key"
              :key="item.key"
              :disabled="existTypes.includes(item.key)">{{ item.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
      </a-form>
      <component
        ref="typeRef"
        :is="form.fd.type"
        :form-item-layout="formItemLayout" />
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button @click="doTest()" :loading="testLoading">{{ $t('common_269') }}</a-button>
        <a-button class="ml-3 mr-3" type="primary" :loading="loading" @click="doOk()">{{ $t('dialog.ok') }}</a-button>
        <a-button @click="cancel">{{ $t('dialog.cancel') }}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import Email from './components/Email'
import Mobile from './components/Mobile'
import Dingtalk from './components/Dingtalk'
import Feishu from './components/Feishu'
import Workwx from './components/Workwx'
import NameRepeated from '@/sections/NameRepeated/index'
import ScopeRadio from '@/sections/ScopeRadio'

export default {
  name: 'NotifyconfigCreate',
  components: {
    ScopeRadio,
    NameRepeated,
    Email,
    Mobile,
    Dingtalk,
    Feishu,
    Workwx,
  },
  data () {
    const scope = this.$store.getters.scope
    return {
      testLoading: false,
      loading: false,
      existTypes: [],
      types: [
        { label: this.$t('system.text_302'), key: 'email' },
        { label: this.$t('system.text_144'), key: 'mobile' },
        { label: this.$t('system.text_136'), key: 'dingtalk' },
        { label: this.$t('system.text_133'), key: 'feishu' },
        { label: this.$t('system.wecom.1'), key: 'workwx' },
      ],
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fd: {
          scope,
          type: '',
        },
      },
      decorators: {
        scope: [
          'scope',
          {
            initialValue: scope,
          },
        ],
        domain: [
          'domain',
          {
            rules: [
              { required: true, message: `${this.$t('common.select')}` },
            ],
          },
        ],
        name: [
          'name',
          {
            rules: [
              { required: true, message: `${this.$t('common.placeholder')}${this.$t('common.name')}` },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        type: [
          'type',
          {
            rules: [
              { required: true, message: `${this.$t('common.select')}` },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    typesOpts () {
      if (this.form.fd.scope === 'system') return this.types
      return this.types.filter(v => !['email', 'mobile'].includes(v.key))
    },
  },
  created () {
    this.manager = new this.$Manager('notifyconfigs', 'v1')
    this.notifytemplatesManager = new this.$Manager('notifytemplates/save', 'v1')
    this.fetchTypes({ attribution: this.$store.getters.scope, scope: this.$store.getters.scope })
  },
  destroyed () {
    this.manager = null
    this.notifytemplatesManager = null
  },
  methods: {
    cancel () {
      this.$router.push('/notifyconfig')
    },
    scopeChange ({ scope, domain_id }) {
      if (domain_id) {
        this.fetchTypes({ attribution: scope, scope: this.$store.getters.scope, project_domain_id: domain_id })
      } else {
        this.fetchTypes({ attribution: scope, scope: this.$store.getters.scope })
      }
    },
    fetchTypes (params) {
      this.manager.list({ params }).then(res => {
        const { data } = res.data
        this.existTypes = data.map(v => v.type)
      }).catch(err => {
        console.error(err)
      })
    },
    doOk () {
      const { $refs: { typeRef } } = this
      const commonForm = new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (err) {
            reject(err)
            return
          }
          resolve(values)
        })
      })
      const typeForm = new Promise((resolve, reject) => {
        typeRef.form.fc.validateFields((err, values) => {
          if (err) {
            reject(err)
            return
          }
          resolve(values)
        })
      })
      Promise.all([commonForm, typeForm]).then(async values => {
        const [common, content] = values
        const { scope, domain, name, type } = common
        const { verifiyCode, alertsCode, errorCode, verifiyCodeUn, alertsCodeUn, errorCodeUn, ...rest } = content
        this.loading = true
        await this.manager.create({
          data: {
            content: rest,
            generate_name: name,
            type,
            attribution: scope,
            project_domain_id: domain,
          },
        })
        if (type === 'mobile') this.doCreateMobileTpl(verifiyCode, alertsCode, errorCode, verifiyCodeUn, alertsCodeUn, errorCodeUn)
        this.$router.push('/notifyconfig')
        this.loading = false
      }).catch((err) => {
        this.loading = false
        console.error(err)
      })
    },
    async doTest () {
      try {
        const { $refs: { typeRef } } = this
        const commonForm = new Promise((resolve, reject) => {
          this.form.fc.validateFields((err, values) => {
            if (err) {
              reject(err)
              return
            }
            resolve(values)
          })
        })
        const typeForm = new Promise((resolve, reject) => {
          typeRef.form.fc.validateFields((err, values) => {
            if (err) {
              reject(err)
              return
            }
            resolve(values)
          })
        })
        Promise.all([commonForm, typeForm]).then(async values => {
          const [common, content] = values
          const { type } = common
          this.testLoading = true
          const res = await this.manager.performClassAction({
            action: 'validate',
            data: {
              content,
              type: type,
            },
          })
          const { is_valid, message } = res.data
          if (is_valid) {
            this.$notification.success({
              message: this.$t('common_270'),
              description: this.$t('common_271'),
            })
          } else {
            this.$notification.error({
              message: message,
            })
          }
          this.testLoading = false
        }).catch((err) => {
          this.testLoading = false
          console.error(err)
        })
      } catch (err) {
        this.$message.error(this.$t('common_623', [this.$t('common_269')]))
        console.error(err)
      }
    },
    async doCreateMobileTpl (verifiyCode, alertsCode, errorCode, verifiyCodeUn, alertsCodeUn, errorCodeUn) {
      try {
        await this.notifytemplatesManager.create({
          data: {
            contact_type: 'mobile',
            force: true,
            templates: this.generateTemplates(verifiyCode, alertsCode, errorCode, verifiyCodeUn, alertsCodeUn, errorCodeUn),
          },
        })
      } catch (err) {
        console.error(err)
      }
    },
    generateTemplates (verifiyCode, alertsCode, errorCode, verifiyCodeUn, alertsCodeUn, errorCodeUn) {
      const tpls = [{
        lang: 'cn',
        topic: 'VERIFY',
        content: verifiyCode,
      }, {
        lang: 'cn',
        topic: 'MONITOR',
        content: alertsCode,
      }, {
        lang: 'cn',
        topic: 'USER_LOGIN_EXCEPTION',
        content: errorCode,
      }, {
        lang: 'en',
        topic: 'VERIFY',
        content: verifiyCodeUn,
      }, {
        lang: 'en',
        topic: 'MONITOR',
        content: alertsCodeUn,
      }, {
        lang: 'en',
        topic: 'USER_LOGIN_EXCEPTION',
        content: errorCodeUn,
      }]
      return tpls.map(v => {
        return {
          ...v,
          contact_type: 'mobile',
          template_type: 'remote',
        }
      })
    },
  },
}
</script>
