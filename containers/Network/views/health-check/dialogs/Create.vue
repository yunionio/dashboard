<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{formType === 'update' ? $t('table.action.modify') : $t('network.health_check.create')}}</div>
    <div slot="body">
      <a-form-model :model="form" :rules="rules" ref="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-form-model-item :label="$t('network.text_199')" prop="cloudregion_id">
          <base-select
            v-model="form.cloudregion_id"
            resource="cloudregions"
            filterable
            remote
            :params="cloudregionParams"
            :select-props="{placeholder: $t('common.tips.select', [$t('network.text_199')])}"
            :disabled="formType === 'update'" />
        </a-form-model-item>
        <a-form-model-item :label="$t('table.title.name')" prop="name">
          <a-input v-model="form.name" :placeholder="$t('common.tips.input', [$t('table.title.name')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('network.text_420')" prop="health_check_type">
          <a-select v-model="form.health_check_type" :disabled="formType === 'update'" :placeholder="$t('common.tips.select', [$t('network.text_420')])">
            <a-select-option value="HTTP">HTTP</a-select-option>
            <a-select-option value="TCP">TCP</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item :label="$t('network.waf.rate_limit_rule_type.http.request.uri.path')" prop="health_check_uri">
          <a-input v-model="form.health_check_uri" :placeholder="$t('common.tips.input', [$t('network.waf.rate_limit_rule_type.http.request.uri.path')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('network.text_165')" prop="health_check_port">
          <a-input-number class="w-50" v-model="form.health_check_port" :placeholder="$t('common.tips.input', [$t('network.text_165')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('network.text_156')" prop="health_check_domain">
          <a-input v-model="form.health_check_domain" :placeholder="$t('common.tips.input', [$t('network.text_156')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('network.health_check.method')" prop="health_check_method">
          <a-select v-model="form.health_check_method" :placeholder="$t('common.tips.select', [$t('network.health_check.method')])">
            <a-select-option value="GET">GET</a-select-option>
            <a-select-option value="HEAD">HEAD</a-select-option>
            <a-select-option value="POST">POST</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item :label="$t('network.health_check.http_code')" prop="health_check_http_code" :extra="$t('network.health_check.http_code_extra')">
          <a-input v-model="form.health_check_http_code" :placeholder="$t('common.tips.input', [$t('network.health_check.http_code')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('network.health_check.interval')" prop="health_check_interval">
          <a-input-number class="w-50" v-model="form.health_check_interval" :placeholder="$t('common.tips.input', [$t('network.health_check.interval')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('network.health_check.timeout')" prop="health_check_timeout">
          <a-input-number class="w-50" v-model="form.health_check_timeout" :placeholder="$t('common.tips.input', [$t('network.health_check.timeout')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('network.health_check.healthy_threshold')" prop="health_check_rise">
          <a-input-number class="w-50" v-model="form.health_check_rise" :placeholder="$t('common.tips.input', [$t('network.health_check.healthy_threshold')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('network.health_check.unhealthy_threshold')" prop="health_check_fall">
          <a-input-number class="w-50" v-model="form.health_check_fall" :placeholder="$t('common.tips.input', [$t('network.health_check.unhealthy_threshold')])" />
        </a-form-model-item>
        <!-- <a-form-model-item :label="$t('network.health_check.req')" prop="health_check_req">
          <a-input v-model="form.health_check_req" :placeholder="$t('common.tips.input', [$t('network.health_check.req')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('network.health_check.res')" prop="health_check_res">
          <a-input v-model="form.health_check_res" :placeholder="$t('common.tips.input', [$t('network.health_check.res')])" />
        </a-form-model-item> -->
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('network.text_33') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { validateModelForm } from '@/utils/validate'
export default {
  name: 'HealthCheckCreateDialog',
  components: {
  },
  mixins: [DialogMixin, WindowsMixin],
  props: {
    parmas: Object,
  },
  data () {
    const { data, type } = this.params
    const initForm = data.length > 0 ? data[0] : {}
    return {
      loading: false,
      form: {
        cloudregion_id: initForm.cloudregion_id || undefined,
        name: initForm.name || undefined,
        health_check_type: initForm.health_check_type || 'HTTP',
        health_check_uri: initForm.health_check_uri || '/',
        health_check_port: initForm.health_check_port || 80,
        health_check_domain: initForm.health_check_domain || undefined,
        health_check_method: initForm.health_check_method || 'GET',
        health_check_http_code: initForm.health_check_http_code || '200',
        health_check_interval: initForm.health_check_interval || 60,
        health_check_timeout: initForm.health_check_timeout || 5,
        health_check_rise: initForm.health_check_rise || 3,
        health_check_fall: initForm.health_check_fall || 15,
        // health_check_req: undefined,
        // health_check_res: undefined,
      },
      formType: type,
      rules: {
        cloudregion_id: [{ required: true, message: this.$t('common.tips.select', [this.$t('network.text_199')]) }],
        name: [{ required: true, validator: this.$validate('resourceName') }],
        health_check_type: [{ required: true, message: this.$t('common.tips.select', [this.$t('network.text_420')]) }],
        health_check_uri: [{ required: true, message: this.$t('common.tips.input', [this.$t('network.waf.rate_limit_rule_type.http.request.uri.path')]) }],
        health_check_port: [{ required: true, message: this.$t('common.tips.input', [this.$t('network.text_165')]) }],
        health_check_domain: [{
          required: true,
          validator: this.$validate('domain'),
        }],
        health_check_method: [{ required: true, message: this.$t('common.tips.select', [this.$t('network.health_check.method')]) }],
        health_check_http_code: [{ required: true, message: this.$t('common.tips.input', [this.$t('network.health_check.http_code')]) }],
        health_check_interval: [{ required: true, message: this.$t('common.tips.input', [this.$t('network.health_check.interval')]) }],
        health_check_timeout: [{ required: true, message: this.$t('common.tips.input', [this.$t('network.health_check.timeout')]) }],
        health_check_rise: [{ required: true, message: this.$t('common.tips.input', [this.$t('network.health_check.healthy_threshold')]) }],
        health_check_fall: [{ required: true, message: this.$t('common.tips.input', [this.$t('network.health_check.unhealthy_threshold')]) }],
        // health_check_req: [{ required: true, message: this.$t('common.tips.input', [this.$t('network.health_check.req')]) }],
        // health_check_res: [{ required: true, message: this.$t('common.tips.input', [this.$t('network.health_check.res')]) }],
      },
    }
  },
  computed: {
    cloudregionParams () {
      return {
        limit: 20,
        provider: 'Cloudflare',
        show_emulated: true,
        scope: this.$store.getters.scope,
      }
    },
  },
  methods: {
    genParams () {
      const ret = {
        ...this.form,
      }
      return ret
    },
    async handleConfirm () {
      try {
        this.loading = true
        await validateModelForm(this.$refs.form)
        const data = this.genParams()
        if (this.formType === 'update') {
          await this.params.onManager('update', {
            id: this.params.data[0].id,
            managerArgs: { data },
          })
        } else {
          await this.params.onManager('create', {
            managerArgs: { data },
          })
        }
        this.loading = false
        this.cancelDialog()
      } catch (e) {
        this.loading = false
        throw e
      }
    },
  },
}
</script>
