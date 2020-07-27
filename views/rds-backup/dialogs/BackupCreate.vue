<template>
  <base-dialog @cancel="cancelDialog" :width="900">
    <div slot="header">{{$t('db.text_215')}}</div>
    <a-form slot="body" :form="form.fc" class="mt-3">
      <a-form-item  v-bind="formItemLayout" :label="$t('db.text_60')">
        <a-input v-decorator="decorators.name" :placeholder="$t('db.text_216')" />
        <name-repeated v-slot:extra res="dbinstancebackups" :name="form.fc.getFieldValue('name')" />
      </a-form-item>
        <a-form-item v-bind="formItemLayout" :label="$t('db.text_217')" v-if="!params.rdsItem">
        <a-select v-decorator="decorators.dbinstance" :placeholder="$t('db.text_218')" :loading="rdsListLoading">
          <a-select-option :key="item.id" v-for="item in rdsList">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item v-bind="formItemLayout" :label="$t('db.text_219')">
        <a-textarea :autosize="{ minRows: 2, maxRows: 6 }" v-decorator="decorators.description" :placeholder="$t('db.text_220')" />
      </a-form-item>
    </a-form>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { CreateServerForm } from '@Compute/constants'
import NameRepeated from '@/sections/NameRepeated'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import validateForm from '@/utils/validate'

export default {
  name: 'RDSBackupCreate',
  components: {
    NameRepeated,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      rdsListLoading: false,
      rdsList: [],
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    decorators () {
      const decorators = {
        name: [
          'generate_name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('db.text_136') },
              { validator: validateForm('serverName') },
            ],
          },
        ],
        description: [
          'description',
          {
            rules: [
              { max: 200 },
            ],
          },
        ],
        dbinstance: [
          'dbinstance',
          {
            rules: [
              { required: true, message: this.$t('db.text_136') },
            ],
          },
        ],
      }
      return decorators
    },
  },
  created () {
    if (!this.params.rdsItem) {
      this.fetchQueryRDSList()
    }
  },
  methods: {
    async fetchQueryRDSList () {
      const manager = new this.$Manager('dbinstances', 'v2')
      this.rdsListLoading = true
      try {
        const { data } = await manager.list({
          params: {
            scope: this.$store.getters.scope,
            limit: 0,
            status: 'running',
          },
        })
        this.rdsList = data.data
      } catch (err) {
        throw err
      } finally {
        this.rdsListLoading = false
      }
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            if (this.params.rdsItem) {
              values.dbinstance_id = this.params.rdsItem.id
              values.dbinstance = this.params.rdsItem.id
            }
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        await this.params.list.onManager('create', {
          managerArgs: {
            data: values,
          },
        })
        this.cancelDialog()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
