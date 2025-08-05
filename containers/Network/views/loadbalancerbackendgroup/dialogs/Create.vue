<template>
  <base-dialog @cancel="cancelDialog" :width="1000">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <a-form-model
        :model="form"
        ref="form">
        <a-form-model-item :label="$t('network.text_21')" prop="name" :rules="rules.name" v-bind="formItemLayout">
          <a-input v-model="form.name" :placeholder="$t('validator.resourceName')" />
        </a-form-model-item>
        <a-form-model-item v-if="form.backends.length" class="mb-0" :label="$t('network.text_140')" prop="backends" :rules="rules.backends" v-bind="formItemLayout">
          <div v-for="(backend, idx) in form.backends" :key="idx" class="d-flex">
            <a-form-model-item style="flex: 0 0 30%" :prop="`backends[${idx}].name`" :rules="rules.lname">
              <a-input v-model="backend.name" :placeholder="$t('common.name')" />
            </a-form-model-item>
            <a-form-model-item class="ml-2" style="flex: 0 0 30%" :prop="`backends[${idx}].address`" :rules="rules.address">
              <a-input v-model="backend.address" :placeholder="$t('network.ip_or_domain')" />
            </a-form-model-item>
            <a-form-model-item class="ml-2" style="width:100%;flex: 0 0 15%" :prop="`backends[${idx}].port`" :rules="rules.port">
              <a-input v-model="backend.port" :placeholder="$t('network.text_165')" />
            </a-form-model-item>
            <a-form-model-item class="ml-2" style="width:100%;flex: 0 0 15%" :prop="`backends[${idx}].weight`" :rules="rules.weight">
              <a-input-number style="width:100%" v-model="backend.weight" :min="1" :max="100" :placeholder="$t('network.text_166')" />
            </a-form-model-item>
            <a-form-model-item class="ml-2">
              <a-button @click="handleRemove(idx)" shape="circle" icon="minus" size="small" class="mt-2 ml-2" :disabled="form.backends.length === 1 && isCloudflare" />
            </a-form-model-item>
          </div>
        </a-form-model-item>
        <a-button type="link" @click="addRule">{{ $t('network.add_backend_server') }}</a-button>
        <a-form-model-item class="mt-2" v-if="isCloudflare" :label="$t('network.enable_health_check')" prop="enable_health_check" v-bind="formItemLayout">
          <a-switch v-model="form.enable_health_check" />
        </a-form-model-item>
        <a-form-model-item v-if="form.enable_health_check" :label="$t('network.health_check')" prop="health_check" :rules="rules.health_check" v-bind="formItemLayout">
          <base-select v-model="form.health_check" resource="loadbalancer_health_checks" isDefaultSelect :params="healthCheckParams" />
        </a-form-model-item>
      </a-form-model>
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
import regexp from '@/utils/regexp'
import { validateModelForm } from '@/utils/validate'
export default {
  name: 'LoadbalancerbackendgroupsCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        name: undefined,
        backends: [
          {
            name: undefined,
            address: undefined,
            port: undefined,
            weight: 1,
          },
        ],
        enable_health_check: false,
        health_check: undefined,
      },
      rules: {
        name: [
          { required: true, validator: this.$validate('resourceName') },
        ],
        backends: [
          { required: true, message: this.$t('network.text_141') },
        ],
        lname: [
          { required: true, validator: this.$validate('resourceName') },
        ],
        address: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error(this.$t('common.tips.input', [this.$t('network.ip_or_domain')])))
              }
              if (!regexp.isIPOrDomain(value)) {
                callback(new Error(this.$t('common.tips.input', [this.$t('network.ip_or_domain')])))
              }
              callback()
            },
          },
        ],
        port: [
          { required: true, message: this.$t('network.text_165') },
        ],
        weight: [
          { required: true, message: this.$t('network.text_166') },
        ],
        health_check: [
          { required: true, message: this.$t('network.health_check') },
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
    isCloudflare () {
      return this.params.lbData.provider === 'Cloudflare'
    },
    healthCheckParams () {
      return {
        scope: this.$store.getters.scope,
        limit: 20,
        provider: this.params.lbData.provider,
      }
    },
  },
  methods: {
    addRule () {
      this.form.backends.push({
        name: undefined,
        address: undefined,
        port: undefined,
        weight: 1,
      })
    },
    handleRemove (idx) {
      this.form.backends = this.form.backends.filter((_, i) => i !== idx)
    },
    async doCreate () {
      const data = {
        name: this.form.name,
        loadbalancer: this.params.loadbalancer,
      }
      if (this.form.backends.length) {
        data.backends = this.form.backends.map(backend => ({
          name: backend.name,
          address: backend.address,
          port: backend.port,
          weight: backend.weight,
          backend_type: 'address',
        }))
      }
      if (this.form.enable_health_check && this.form.health_check) {
        data.loadbalancer_health_check_id = this.form.health_check
      }
      await new this.$Manager('loadbalancerbackendgroups').create({
        data,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await validateModelForm(this.$refs.form)
        await this.doCreate()
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
