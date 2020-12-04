<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('cloudenv.text_431')" class="mt-3" :count="params.data.length" :action="title" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout"
        hideRequiredMark>
        <a-form-item :label="$t('cloudenv.text_440')" v-if="isServer">
          <list-select
            v-decorator="decorators.servers"
            :list-props="serverProps"
            :multiple="true"
            :formatter="formatter" />
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_16')" class="mb-0" v-if="isTag">
          <tag v-decorator="decorators.tag" :extra="$t('cloudenv.text_441')" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import ServerPropsMixin from '../mixins/serverProps'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import Tag from '@/sections/Tag'
import ListSelect from '@/sections/ListSelect'
import validateForm from '@/utils/validate'

export default {
  name: 'ScheduledtaskEditDialog',
  components: {
    Tag,
    ListSelect,
  },
  mixins: [DialogMixin, WindowsMixin, ServerPropsMixin],
  data () {
    const getInitTags = (labels) => {
      const tag = {}
      labels.forEach((v) => {
        const arr = v.replace('user:', '').split(':')
        tag[`user:${arr[0]}`] = arr[1]
      })
      return tag
    }
    const labels = this.params.data[0].labels
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fd: {},
      },
      decorators: {
        servers: [
          'servers',
          {
            initialValue: labels,
          },
        ],
        tag: [
          'tag',
          {
            initialValue: getInitTags(labels),
            rules: [
              { required: true, message: this.$t('cloudenv.text_451') },
              { validator: validateForm('tagName') },
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
    isServer () {
      return this.params.data.every((item) => item.label_type === 'id')
    },
    isTag () {
      return this.params.data.every((item) => item.label_type === 'tag')
    },
    title () {
      return this.params.title || this.$t('cloudenv.text_454')
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      const manager = new this.$Manager('scheduledtasks')
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        const params = {}
        if (this.isServer) {
          params.labels = values.servers
        } else if (this.isTag) {
          const tags = Object.keys(values.tag).map((k) => {
            return `${k}:${values.tag[k]}`
          })
          params.labels = tags
        }
        const res = await manager.performAction({
          id: ids[0],
          action: 'set-labels',
          data: {
            labels: params.labels,
          },
        })
        this.$bus.$emit('ScheduledtasksListSingleRefresh', ids)
        this.isServer && this.$bus.$emit('RelatedResourceServerListSidePageRefresh', res.data.labels)
        this.isTag && this.$bus.$emit('RelatedResourceTagListSidePageRefresh', res.data.labels)
        this.params.success && this.params.success(res.data.labels)
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    formatter (val) {
      return `${val.name}`
    },
  },
}
</script>
