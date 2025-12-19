<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{ $t('common.create') }}</div>
    <div slot="body">
      <a-form :form="form.fc" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item :label="$t('aice.project')">
          <domain-project
            :fc="form.fc"
            :fd="form.fd"
            :decorators="{ project: decorators.project, domain: decorators.domain }" />
        </a-form-item>
        <a-form-item :label="$t('common.name')">
          <a-input v-decorator="decorators.name" placeholder="com.ss.android.ugc.aweme-23.0.1" />
          <template v-slot:extra>
            <name-repeated res="instant_apps" :name="form.fd.name" :default-text="$t('aice.name_repeat_extra')" />
          </template>
        </a-form-item>
        <a-form-item :label="$t('aice.mounted_apps.package')">
          <a-input v-decorator="decorators.package" placeholder="com.ss.android.ugc.aweme" />
        </a-form-item>
        <a-form-item :label="$t('aice.mounted_apps.version')">
          <a-input v-decorator="decorators.version" placeholder="23.0.1" />
        </a-form-item>
        <a-form-item :label="$t('aice.mounted_apps.mounts')">
          <a-textarea v-decorator="decorators.mounts" :placeholder="mountsExample" :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-item>
        <a-form-item :label="$t('aice.template')">
          <base-select
            v-decorator="decorators.image_id"
            resource="images"
            :params="templateParams"
            filterable
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.template')]) }" />
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import DomainProject from '@/sections/DomainProject'
import NameRepeated from '@/sections/NameRepeated'
import { isRequired } from '@/utils/validate'

export default {
  name: 'InstantAppCreateDialog',
  components: {
    DomainProject,
    NameRepeated,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {},
      },
      decorators: {
        domain: [
          'domain',
          {
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { validator: isRequired(), message: this.$t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('common.name')]) },
            ],
          },
        ],
        package: [
          'package',
          {
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('aice.mounted_apps.package')]) },
            ],
          },
        ],
        version: [
          'version',
          {
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('aice.mounted_apps.version')]) },
            ],
          },
        ],
        mounts: [
          'mounts',
          {
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('aice.mounted_apps.mounts')]) },
            ],
          },
        ],
        image_id: [
          'image_id',
          {
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('aice.template')]) },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    mountsExample () {
      return '/data/app/~~AiggKR4DW03_Ue4jSG2YmQ==\n/data/data/com.ss.android.ugc.aweme\n/data/media/0/Android/data/com.ss.android.ugc.aweme'
    },
    templateParams () {
      const ret = {
        scope: this.scope,
        'disk_formats.0': 'tgz',
        details: false,
      }
      return ret
    },
  },
  methods: {
    async handleConfirm () {
      try {
        const values = await this.form.fc.validateFields()
        const manager = new this.$Manager('instant_apps', '')
        const mountPaths = values.mounts.split('\n')
        const data = {
          generate_name: values.name,
          package: values.package,
          version: values.version,
          mounts: mountPaths,
          image_id: values.image_id,
          project_id: values.project?.key || this.userInfo.projectId,
        }
        manager.create({
          data,
        })
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
      this.params.callback && this.params.callback()
      this.cancelDialog()
      this.params.refresh && this.params.refresh()
    },
  },
}
</script>
