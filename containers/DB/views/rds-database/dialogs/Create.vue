<template>
  <base-dialog @cancel="cancelDialog" :width="900">
    <div slot="header">{{params.title}}</div>
    <a-form slot="body" :form="form.fc" class="mt-3" v-bind="formItemLayout">
      <a-form-item :label="$t('db.text_232')">
        <a-input :placeholder="$t('validator.dbName')" v-decorator="decorators.name" />
      </a-form-item>
      <a-form-item :label="$t('db.text_233')">
        <a-select allowClear showSearch :placeholder="$t('db.text_234')" v-decorator="decorators.character_set">
          <a-select-option
            v-for="item in CHARACTER_SET"
            :key="item"
            :value="item">{{ item }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('db.text_188')" v-if="this.params.rdsItem.brand !== 'Google'">
        <database-privileges :rdsItem="params.rdsItem" />
      </a-form-item>
    </a-form>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DatabasePrivileges from '../components/DatabasePrivileges'
import { RDS_ACCOUNT_PRIVILEGES } from '@DB/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import validateForm from '@/utils/validate'

const CHARACTER_SET = ['utf8', 'gbk', 'latin1', 'utf8mb4', 'euckr', 'armscii8', 'ascii', 'big5', 'binary', 'cp1250', 'cp1251', 'cp1256', 'cp1257', 'cp850', 'cp852', 'cp866', 'cp932', 'dec8', 'eucjpms', 'gb2312', 'geostd8', 'greek', 'hebrew', 'hp8', 'keybcs2', 'koi8r', 'koi8u', 'latin2', 'latin5', 'latin7', 'macce', 'macroman', 'sjis', 'swe7', 'tis620', 'ucs2', 'ujis', 'utf16', 'utf16le', 'utf32']
export default {
  name: 'RDSDatabaseCreateDialog',
  components: {
    DatabasePrivileges,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      CHARACTER_SET,
      privileges: RDS_ACCOUNT_PRIVILEGES,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 4 },
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
      const { initialValues = {} } = this.params
      const decorators = {
        name: [
          'name',
          {
            initialValue: initialValues.name,
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('db.text_136') },
              { validator: validateForm('dbName') },
            ],
          },
        ],
        character_set: [
          'character_set',
          {
            initialValue: 'utf8',
            rules: [{ required: true, message: this.$t('db.text_234') }],
          },
        ],
      }
      return decorators
    },
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
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
        const params = {
          ...values,
          dbinstance: this.params.rdsItem.id,
        }
        await this.params.onManager('create', {
          managerArgs: {
            data: params,
          },
        })
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
