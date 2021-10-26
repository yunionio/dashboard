<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ form.fd.name || $t('dashboard.userinfo') }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
          <!-- <router-link v-if="!edit" to="/log" class="ml-2">
            <icon type="arrow-right" style="font-size:18px" />
          </router-link> -->
        </div>
      </div>
      <div class="dashboard-card-body flex-column justify-content-center">
        <div class="flex-fill position-relative d-flex flex-column" style="justify-content: space-around">
          <div class="selected-user-content">
            <div class="mr-2 name-icon">{{ firstNameWord }}</div>
            <div class="selected-user-name">{{$t('dashboard.text_185')}}{{ userInfo.displayname || userInfo.name }}</div>
          </div>
          <!-- <div v-for="(item, index) in userTableData" :key="index" class="user-info-text">{{item.label}}{{item.value}}</div> -->
          <div v-for="(item, index) in userTableData" :key="index">
            <div class="info-title">{{item.label}}</div>
            <div class="info-text">{{item.value}}</div>
          </div>
        </div>
      </div>
    </div>
    <base-drawer :visible.sync="visible" :title="$t('dashboard.text_5')" @ok="handleSubmit">
      <a-form
        hideRequiredMark
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('dashboard.text_6')">
          <a-input v-decorator="decorators.name" />
        </a-form-item>
      </a-form>
    </base-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseDrawer from '@Dashboard/components/BaseDrawer'

export default {
  name: 'UserInfo',
  components: {
    BaseDrawer,
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
    params: Object,
    edit: Boolean,
  },
  data () {
    const initialNameValue = (this.params && this.params.name) || this.$t('dashboard.userinfo')
    return {
      data: [],
      visible: false,
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fd: {
          name: initialNameValue,
        },
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: initialNameValue,
            rules: [
              { required: true, message: this.$t('dashboard.text_8') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['scope', 'userInfo']),
    firstNameWord () {
      const word = (this.userInfo.displayname || this.userInfo.name || '').split('')[0]
      return word && word.toUpperCase()
    },
    userTableData () {
      const us = this.userInfo
      const ret = [
        { label: this.$t('dashboard.text_186'), value: us.roles.join(',') },
        { label: this.$t('dashboard.text_187'), value: `${us.projectName} (${us.projectDomain})` },
        { label: this.$t('dashboard.text_189'), value: this.$moment(us.last_active_at).format('') },
      ]
      return ret
    },
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.$emit('update', this.options.i, {
      ...this.form.fd,
    })
  },
  methods: {
    refresh () {
      return function () {}
    },
    handleEdit () {
      this.visible = true
    },
    async handleSubmit () {
      try {
        const values = await this.form.fc.validateFields()
        this.form.fd = values
        this.$emit('update', this.options.i, values)
        this.visible = false
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
<style scoped lang="less">
@import '~@/styles/less/theme';

.selected-user-content {
  align-items: center;
  // border: 1px solid #d9d9d9;
  color: #3c4043;
  display: inline-flex;
  font-size: 14px;
  letter-spacing: .25px;
  max-width: 100%;
  padding: 0 7px 5px 0;
  margin-bottom: 10px;
  .selected-user-name {
    direction: ltr;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.name-icon {
  color: #fff;
  height: 30px;
  width: 30px;
  text-align: center;
  line-height: 30px;
  border-radius: 50%;
  background-color: var(--antd-wave-shadow-color);
  font-size: 14px;
}
.user-info-text{
  font-size: 14px;
  color: #3c4043;
  margin-top: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.info-title{
  font-size: 12px;
  padding: 5px 0;
  color: #666;
}
.info-text{
  font-size: 12px;
  padding: 5px;
  background: rgba(0,0,0,0.05);
  border-radius: 5px;
}
</style>
