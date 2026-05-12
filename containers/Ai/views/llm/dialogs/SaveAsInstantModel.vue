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
        <a-form-model-item v-if="params.isComfyui" label="Model ID" prop="model_id">
          <a-input v-model="form.model_id" :placeholder="$t('common.tips.input', [$t('table.title.name')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.model_name')" prop="model_full_name">
          <a-input v-model="form.model_full_name" :placeholder="$t('common.tips.input', [$t('aice.model_name')])" />
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
        model_id: this.params.data[0].id,
        model_full_name: `${this.params.data[0].name}:${this.params.data[0].tag}`,
      },
      rules: {
        name: [
          { required: true, message: this.$t('common.tips.input', [this.$t('table.title.name')]) },
        ],
        model_id: [
          { required: true, message: this.$t('common.tips.input', [this.$t('table.title.model_id')]) },
        ],
        model_full_name: [
          { required: true, message: this.$t('common.tips.input', [this.$t('aice.model_name')]) },
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
      const mgr = new this.$Manager('llms')
      const data = {
        name: this.form.name,
        model_full_name: this.form.model_full_name,
        model_id: this.params.data[0].id,
      }
      if (this.params.isComfyui) {
        data.model_id = this.form.model_id
        const mounts = []
        for (const row of this.params.data) {
          mounts.push(...(row.mounts || []))
        }
        data.mounts = mounts
      }
      await mgr.performAction({
        id: this.params.resId,
        action: 'save-instant-model',
        data,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await validateModelForm(this.$refs.form)
        await this.doSubmit()
        this.loading = false
        if (this.params.success && typeof this.params.success === 'function') {
          this.params.success()
        }
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
