<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('cloudenv.text_454') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.schedtag')" :count="params.data.length" :action="$t('cloudenv.text_454')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('cloudenv.text_384')" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.resource_type">
            <a-radio-button
              :value="resType.key"
              :key="resType.key">{{ resType.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_454')" v-bind="formItemLayout">
          <base-select
              v-decorator="decorators.resource"
              :resource="resource"
              version="v1"
              remote
              :params="resourceParams"
              :remote-fn="q => ({ filter: `name.contains(${q})` })">
              <template v-slot:optionTemplate="{ options }">
                <a-select-option v-for="item in options" :key="item.id" :value="item.id" :disabled="item.__disabled">
                  <div class="d-flex">
                    <span class="text-truncate flex-fill">{{ item.access_ip ? `${item.name}(${item.access_ip})` : item.name }}</span>
                  </div>
                </a-select-option>
              </template>
          </base-select>
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
import { mapGetters } from 'vuex'
import { RES_TYPES } from '../utils'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'AssociatedResourcesDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        resource_type: [
          'resource_type',
          {
            initialValue: this.params.data[0].resource_type || '',
          },
        ],
        resource: [
          'resource',
          {
            initialValue: '',
            rules: [
              { required: true, message: this.$t('cloudenv.text_284', [this.$t('cloudenv.text_454')]) },
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
    ...mapGetters(['scope']),
    selectedItem () {
      return this.params.data && this.params.data[0]
    },
    resType () {
      return {
        key: this.selectedItem.resource_type,
        label: RES_TYPES[this.selectedItem.resource_type],
      }
    },
    resource () {
      return this.selectedItem.resource_type
    },
    resourceParams () {
      return {
        scope: this.scope,
      }
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
    doSubmit (values) {
      this.params.onManager('performAction', {
        id: this.params.data[0].id,
        managerArgs: {
          action: `${values.resource_type}/${values.resource}`,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        this.loading = true
        await this.doSubmit(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
