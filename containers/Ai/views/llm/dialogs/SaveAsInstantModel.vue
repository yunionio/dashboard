<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('aice.model')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 15 }">
        <a-form-model-item :label="$t('table.title.name')" prop="name">
          <a-input v-model="form.name" :placeholder="$t('common.tips.input', [$t('table.title.name')])" />
        </a-form-model-item>
      </a-form-model>
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
import { validateModelForm } from '@/utils/validate'

export default {
  name: 'LlmModelSaveInstantModelDialog',
  components: {
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.params.actionText,
      form: {
        name: `${this.params.data[0].name}:${this.params.data[0].tag}`,
      },
      rules: {
        name: [
          { required: true, message: this.$t('common.tips.input', [this.$t('table.title.name')]) },
        ],
      },
      columns: [
        {
          field: 'name',
          title: this.$t('aice.model'),
        },
        {
          field: 'id',
          title: 'ID',
        },
        {
          field: 'tag',
          title: 'Tag',
        },
        {
          field: 'size',
          title: 'Size',
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  methods: {
    async doSubmit () {
      return new this.$Manager('llms').performAction({
        id: this.params.resId,
        action: 'save-instant-model',
        data: {
          model_id: this.params.data[0].id,
          name: this.form.name,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await validateModelForm(this.$refs.form)
        await this.doSubmit()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    changeAutoStart (val) {
      const { checked } = val.target
      this.form.fd.auto_start = checked
    },
  },
}
</script>
