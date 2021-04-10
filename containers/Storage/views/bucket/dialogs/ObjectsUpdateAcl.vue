<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="this.params.title" :name="params.name || $t('dictionary.bucket')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-spin :spinning="getAclsLoading">
          <a-form-item :label="$t('storage.text_93')">
            <a-radio-group v-decorator="decorators.acl">
              <a-radio-button v-for="k in acls" :key="k" :value="k">{{$t('storageAclTypes')[k]}}</a-radio-button>
            </a-radio-group>
            <div slot="extra">
              <div v-for="k in acls" :key="k">
                {{$t('storageAclExtras')[k]}}<br />
              </div>
          </div>
          </a-form-item>
        </a-spin>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { formItemLayout } from '@Storage/constants/index.js'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ObjectsUpdateAclDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      getAclsLoading: false,
      formItemLayout,
      fileList: [],
      acls: [],
      form: {
        fc: this.$form.createForm(this),
      },
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    decorators () {
      return {
        acl: ['acl', {
          initialValue: this.params.data[0].acl,
        }],
      }
    },
  },
  created () {
    this.queryAcls()
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (err) return reject(err)
          resolve(values)
        })
      })
    },
    async queryAcls () {
      this.getAclsLoading = true
      const { bucket, type = 'bucket' } = this.params
      try {
        const ret = await new this.$Manager('cloudproviders', 'v2').getSpecific({
          id: bucket.manager_id,
          spec: 'canned-acls',
        })
        if (ret && ret.data) {
          this.acls = ret.data[`${type}_canned_acls`]
        }
      } catch (err) {
        throw err
      } finally {
        this.getAclsLoading = false
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const { acl } = await this.validateForm()
        const { bucket, data } = this.params
        const key = data.map(({ key }) => key).filter((t) => !!t)
        const params = {
          acl,
        }
        if (key && key.length > 0) {
          params.key = key
        }
        await new this.$Manager('buckets', 'v2').performAction({
          id: bucket.id,
          action: 'acl',
          data: params,
        })
        data.forEach(item => {
          item.acl = acl
        })
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
