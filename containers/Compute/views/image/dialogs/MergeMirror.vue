<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('compute.image.merge_mirror') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('common_238')" :count="params.data.length" :action="$t('compute.image.merge_mirror')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_228')" :extra="$t('compute.image.merge_mirror.extra')">
          <a-input v-decorator="decorators.name" :placeholder="$t('compute.image.merge_mirror.placeholder')" />
        </a-form-item>
        <a-form-item :label="$t('compute.image.merge_mirror.order')" :extra="$t('compute.image.merge_mirror.order_extra')">
          <draggable
            handle=".drag-icon"
            chosen-class="chosen"
            v-model="images">
            <transition-group type="transition" name="flip-list">
              <template v-for="item of images">
                <div class="item" :key="item.id">
                  <a-icon type="drag" class="drag-icon pr-3" @click.prevent="() => {}" />{{item.name}}
                </div>
              </template>
            </transition-group>
          </draggable>
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
import draggable from 'vuedraggable'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'MergeMirrorDialog',
  components: {
    draggable,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
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
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_660') },
              { validator: this.$validate('imageName') },
            ],
          },
        ],
      },
      images: [],
    }
  },
  computed: {
    columns () {
      return this.params.columns.filter(item => ['name', 'tenant'].includes(item.field))
    },
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      this.images = this.params.data.map((item, index) => {
        return {
          order: item.is_data ? index : -1,
          ...item,
        }
      })
      this.images.sort((a, b) => a.order - b.order)
    },
    doAction (data) {
      return new this.$Manager('guestimages', 'v1').create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const data = { images: this.images, name: values.name }
        await this.doAction(data)
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    onMoveHandle (e) {
      const { is_data } = e.draggedContext.element
      if (is_data && e.relatedContext.index === 0) return false
      if (this.images && this.images.length > 1) {
        if (e.draggedContext.index === 0 && this.images[1].is_data) return false
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.item {
  padding: 0 10px;
  background-color: #fdfdfd;
  border: solid 1px #eee;
  margin-bottom: 10px;
}

.item:hover {
  background-color: #f1f1f1;
}

.chosen {
  border: solid 1px #1890ff !important;
}
</style>
