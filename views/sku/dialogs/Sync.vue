<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('commpute.sku_sync_title') }}</div>
    <div slot="body">
      <a-alert :message="$t('commpute.sku_sync_label')" banner />
      <a-form
        class="mt-3"
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item :label="$t('compute.text_176')">
          <a-select v-decorator="decorators.provider">
            <a-select-option v-for="item in providerList" :key="item.key">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import _ from 'lodash'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { typeClouds } from '@/utils/common/hypervisor'

export default {
  name: 'SkuSyncDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const providerList = this.$store.getters.capability.brands.filter(val => {
      const brandItem = typeClouds.brandMap[val]
      return _.get(brandItem, 'env') === 'public'
    }).map(val => ({ key: val, label: _.get(typeClouds.brandMap, `${val}.label`) }))
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        provider: [
          'provider',
          {
            initialValue: _.get(providerList, '[0].key'),
            rules: [
              { required: true, message: this.$t('compute.text_215') },
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
      providerList,
    }
  },
  methods: {
    doAction (data) {
      return new this.$Manager('cloudregions')
        .performAction({
          id: 'sync-skus',
          action: '',
          data: {
            provider: data.provider,
            resource: 'serversku',
          },
        })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const { data } = await this.doAction(values)
        const { timeUnit, tasksTime } = this.getTime(data)
        this.loading = false
        this.cancelDialog()
        this.$message.success(this.$t('commpute.sku_sync_result', [`${tasksTime}${timeUnit}`]))
      } catch (error) {
        this.loading = false
      }
    },
    getTime (data) {
      const tasksLen = data.tasks.length
      let timeUnit = this.$t('common_time.second')
      let tasksTime = tasksLen * 2 // 一个任务2秒的时间
      if (tasksTime >= 60) { // 够60s换算成分钟
        timeUnit = this.$t('common_time.minute')
        tasksTime = Math.round(tasksTime / 60)
      }
      return { timeUnit, tasksTime }
    },
  },
}
</script>
