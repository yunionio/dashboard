<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_583')}}</div>
    <div slot="body">
      <a-form
        v-bind="formLayout"
        :form="form.fc">
        <a-form-item :label="$t('cloudenv.text_410', [$t('dictionary.domain')])" v-bind="formLayout">
          <domain-select v-if="isAdminMode && l3PermissionEnable" v-decorator="decorators.project_domain" :params="domainParams" />
          <template v-else> {{userInfo.domain.name}} </template>
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_95')">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_582')">
          <div>
            <a-form-item :label="$t('cloudenv.text_22')" v-bind="formLayout">
              <a-select default-value="one">
                <a-select-option v-for="item in resourceAndTagOptions" :key="item.value">
                  {{item.name}}
                </a-select-option>
              </a-select>
              <div slot="extra" class="d-flex">
                {{$t('cloudenv.text_585')}}
              </div>
            </a-form-item>
            <a-form-item :label="$t('cloudenv.text_16')" v-bind="formLayout">
              <tag v-decorator="decorators.tag" />
            </a-form-item>
            <a-form-item :label="$t('cloudenv.text_584')" v-bind="formLayout">
              <a-select default-value="one">
                <a-select-option v-for="item in resourceAndTagOptions" :key="item.value">
                  {{item.name}}
                </a-select-option>
              </a-select>
              <div slot="extra" class="d-flex">
                {{$t('cloudenv.text_585')}}
              </div>
            </a-form-item>
          </div>
          <div class="d-flex align-items-center">
            <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
            <a-button type="link" @click="add">{{$t('cloudenv.text_586')}}</a-button>
          </div>
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
import Tag from '../components/Tag'
import DomainSelect from '@/sections/DomainSelect'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ResourceOwnerManageCreateDialog',
  components: {
    DomainSelect,
    Tag,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const projectDomainInitialValue = (this.params.domain && this.params.domain.key) || this.$store.getters.userInfo.projectDomainId
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('cloudenv.text_190') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        project_domain: [
          'project_domain',
          {
            initialValue: projectDomainInitialValue,
            rules: [
              { required: true, message: this.$t('cloudenv.text_284', [this.$t('dictionary.domain')]) },
            ],
          },
        ],
      },
      formLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      offsetFormLayout: {
        wrapperCol: {
          span: 18,
          offset: 6,
        },
      },
      domainParams: {
        limit: 0,
        filter: 'enabled.equals(1)',
      },
      resourceAndTagOptions: [
        {
          name: this.$t('cloudenv.text_587'),
          value: 'one',
        },
        {
          name: this.$t('cloudenv.text_588'),
          value: 'all',
        },
      ],
    }
  },
  computed: mapGetters(['isAdminMode', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
  methods: {
    doCreate (data) {
      return new this.$Manager('proxysettings').create({ data: data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doCreate(values)
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
        this.params.success && this.params.success()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    add () {

    },
  },
}
</script>
