<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <div v-loading="loading" style="min-height:100px">
        <a-form-item v-bind="formItemLayout" :label="key" v-for="(value, key) in infoJson" :key="key">
          {{value}}
          <copy
            class="ml-1"
            :message="value" />
        </a-form-item>
      </div>
    </div>
    <div slot="footer">
      <a-button type="primary" :loading="loading" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import 'codemirror/theme/monokai.css'
import 'codemirror/mode/htmlmixed/htmlmixed.js'

export default {
  name: 'IdpBaseConfigDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      infoJson: {},
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  created () {
    this.authManager = new this.$Manager('auth/idp', 'v1')
    this.queryMetadata()
  },
  methods: {
    async queryMetadata () {
      this.loading = true
      try {
        const { data } = await this.authManager.getSpecific({
          id: this.params.data[0].id,
          spec: 'info',
        })
        this.infoJson = data
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
