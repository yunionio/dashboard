<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ form.fd.name || $t('dashboard.text_6') }}
          <a-icon class="ml-2" type="loading" v-if="loading" />
          <span v-if="isUsageKeyDeny" class="ml-2">
            <a-tooltip class="mr-2"><template slot="title">{{ $t('dashboard.usage_key_deny_tips') }}</template><icon type="help" /></a-tooltip>
            <a-icon class="warning-color mr-1" type="warning" />
            {{ $t('dashboard.usage_key_deny_tips_2') }}
          </span>
        </div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
        </div>
      </div>
      <div class="dashboard-card-body d-flex align-items-center justify-content-center">
        <div class="d-flex align-items-baseline">
          <div class="number-card-number mr-1">{{ isUsageKeyDeny ? '-' : this.usage.usage }}</div>
          <div class="number-card-unit">{{ this.usage.unit }}</div>
        </div>
      </div>
    </div>
    <base-drawer class="drawer-wrapper" @update:visible="updateVisible" :visible="visible" :title="$t('dashboard.text_5')" @ok="handleSubmit" @cancel="cancel">
      <slot />
      <a-form
        hideRequiredMark
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('dashboard.text_6')">
          <a-input v-decorator="decorators.name" />
        </a-form-item>
        <identity-config
          :fc="form.fc"
          :decorators="decorators"
          :usage-label="$t('dashboard.text_20')"
          @update:usage_key="setDefaultName" />
      </a-form>
    </base-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import IdentityConfig from '@Dashboard/sections/IdentityConfig'
import { USAGE_CONFIG } from '@Dashboard/constants'
import { fetchDashboardUsage } from '@Dashboard/utils/fetchUsage'
import { isIdentityUsageKey, isIdentityUsageAllowed } from '@Dashboard/utils/usageSource'
import { getRequestT } from '@/utils/utils'
import mixin from './mixin'

export default {
  name: 'NumberCardIdentity',
  components: {
    BaseDrawer,
    IdentityConfig,
  },
  mixins: [mixin],
  props: {
    parmas: Object,
    edit: Boolean,
  },
  data () {
    const initialUsageKey = 'domains'
    const initialNameValue = ((this.params && this.params.type === 'identity') && this.params.name) || this.$t('usage')[initialUsageKey]
    const initialUsageKeyValue = ((this.params && this.params.type === 'identity') && this.params.usage_key) || initialUsageKey
    return {
      data: {},
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fd: {
          name: initialNameValue,
          usage_key: initialUsageKeyValue,
        },
        fi: {
          nameTouched: false,
        },
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: initialNameValue,
            rules: [
              { required: true, message: this.$t('dashboard.text_8') },
            ],
          },
        ],
        usage_key: [
          'usage_key',
          {
            initialValue: initialUsageKeyValue,
            rules: [
              { required: true, message: this.$t('dashboard.text_22') },
            ],
          },
        ],
      },
      currentUsageKey: initialUsageKeyValue,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode']),
    isUsageKeyDeny () {
      if (!this.isAdminMode) return true
      const key = this.form.fd.usage_key
      if (!key || !isIdentityUsageKey(key)) return true
      return !isIdentityUsageAllowed(this.isAdminMode, key)
    },
    usage () {
      const usageKey = this.form.fd.usage_key
      const usage = (!this.isUsageKeyDeny && this.data && this.data[usageKey]) || 0
      const ret = { usage }
      const config = USAGE_CONFIG[usageKey]
      if (config && config.unit) {
        ret.unit = config.unit
      }
      return ret
    },
  },
  watch: {
    'form.fd' () {
      this.fetchUsage()
    },
  },
  created () {
    if (this.params && this.params.type === 'identity') {
      this.form.fd = { ...this.params }
    }
    this.fetchUsage()
  },
  methods: {
    refresh () {
      return this.fetchUsage()
    },
    genUsageParams () {
      return {
        scope: 'system',
        $t: getRequestT(),
      }
    },
    async fetchUsage () {
      if (this.isUsageKeyDeny) return
      this.loading = true
      try {
        const params = this.genUsageParams()
        const usageKeys = [this.form.fd.usage_key]
        this.data = await fetchDashboardUsage(params, usageKeys)
      } finally {
        this.loading = false
      }
    },
    handleEdit () {
      this.updateVisible(true)
    },
    updateVisible (val) {
      this.$emit('update:visible', val)
    },
    async handleSubmit () {
      try {
        const values = await this.form.fc.validateFields()
        this.form.fd = values
        this.$emit('update', this.options.i, { type: 'identity', ...values })
        this.updateVisible(false)
      } catch (error) {
        throw error
      }
    },
  },
}
</script>

<style lang="less" scoped>
.number-card-number {
  font-size: 60px;
  line-height: 48px;
  color: #000000;
}
.number-card-unit {
  font-size: 14px;
  color: #000000;
  margin-left: 5px;
}
@media screen and (max-width: 1441px) {
  .number-card-number {
    font-size: 40px;
  }
}
.drawer-wrapper {
  &::v-deep.ant-drawer.ant-drawer-open .ant-drawer-mask {
    animation: none;
  }
}
</style>
