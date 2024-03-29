
<template>
  <div>
    <page-header :title="$t('storage.text_183')" />
    <page-body needMarginBottom>
      <dialog-selected-tips :name="$t('storage.text_18')" :count="1" :action="$t('storage.text_183')" />
      <dialog-table class="mb-2" :data="currentItem" :columns="bucketColumns" />
      <a-divider />
      <a-form :form="form.fc">
        <a-form-item :label="$t('storage.text_41')" v-bind="formItemLayout">
          <a-switch v-decorator="decorators.status" :checked-children="$t('storage.text_184')" :un-checked-children="$t('storage.text_185')" @change="handleStatusChange" />
        </a-form-item>
        <template v-if="status">
          <div>
            <a-form-item :label="$t('storage.text_186')" v-bind="formItemLayout" :extra="$t('storage.text_187')">
              <a-input v-decorator="decorators.index" />
            </a-form-item>
            <a-form-item :label="$t('storage.text_188')" v-bind="formItemLayout" :extra="$t('storage.text_189')">
              <a-input v-decorator="decorators.error_document" />
            </a-form-item>
          </div>
        </template>
      </a-form>
    </page-body>
    <page-footer>
      <template #right>
        <div>
          <a-button class="mr-2" type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
          <a-button @click="handleCancel">{{ $t('dialog.cancel') }}</a-button>
        </div>
      </template>
    </page-footer>
  </div>
</template>

<script>
import { getNameDescriptionTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'SetStaticWebsit',
  data () {
    return {
      loading: false,
      status: !!this.$route.query.url,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        labelCol: { span: 3 },
        wrapperCol: { span: 21 },
      },
      decorators: {
        status: [
          'status',
          {
            valuePropName: 'checked',
            initialValue: !!this.$route.query.url,
          },
        ],
        index: [
          'index',
          {
            initialValue: this.$route.query.index || '',
            rules: [
              { required: true, message: this.$t('storage.text_190') },
            ],
          },
        ],
        error_document: [
          'error_document',
          {
            initialValue: this.$route.query.error_document || '',
            rules: [
              { required: true, message: this.$t('storage.text_190') },
            ],
          },
        ],
      },
      currentItem: [],
      bucketColumns: [
        getNameDescriptionTableColumn(),
        getStatusTableColumn({ statusModule: 'bucket' }),
        {
          field: 'storage_class',
          title: this.$t('storage.text_38'),
          width: 120,
          formatter: ({ row }) => {
            return row.storage_class || '-'
          },
        },
      ],
    }
  },
  async created () {
    const { data: { data } } = await this.fetchBucketData(this.$route.query.id)
    this.currentItem = data
  },
  methods: {
    fetchBucketData (id) {
      return new this.$Manager('buckets').list({
        params: {
          id,
          batchGet: true,
        },
      })
    },
    doSet (data) {
      return new this.$Manager('buckets').performAction({
        id: this.$route.query.id,
        action: 'set-website',
        data: {
          ...data,
          protocol: 'http',
        },
      })
    },
    doDelete () {
      return new this.$Manager('buckets').performAction({
        id: this.$route.query.id,
        action: 'delete-website',
      })
    },
    handleStatusChange (val) {
      this.status = val
    },
    handleCancel () {
      this.$router.back()
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (this.status) {
          const values = await this.form.fc.validateFields()
          await this.doSet(values)
        } else {
          await this.doDelete()
        }
        this.loading = false
        this.$message.success(this.$t('storage.text_191'))
        this.$router.push('/bucket')
      } catch (err) {
        this.loading = false
      }
    },
  },
}
</script>
