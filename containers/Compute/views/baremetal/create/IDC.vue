<template>
  <div>
    <a-form
      class="mt-3"
      :form="form.fc"
      @submit="handleConfirm">
      <a-divider orientation="left">{{$t('compute.text_300')}}</a-divider>
      <a-form-item :label="$t('compute.text_297', [$t('dictionary.project')])" v-bind="formItemLayout">
        <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" :project.sync="projectId" :domain.sync="domainId" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_177')" class="mb-0" v-bind="formItemLayout" v-if="!isInstallOperationSystem">
        <cloudregion-zone
          :zone-params="params.zone"
          :cloudregion-params="params.region"
          :decorator="decorators.regionZone"
          filterBrandResource="compute_engine" />
      </a-form-item>
      <a-form-item
        :label="$t('compute.text_228')"
        v-bind="formItemLayout"
        :extra="$t('compute.text_301')">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceCreateName')" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_312')" v-bind="formItemLayout" v-if="!isInstallOperationSystem">
        <a-input v-decorator="decorators.description" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_294')" v-bind="formItemLayout">
        <a-input-number v-decorator="decorators.count" :min="1" :max="100" :disabled="isInstallOperationSystem" />
      </a-form-item>
      <a-form-item v-bind="formItemLayout" :label="$t('compute.text_267')" :extra="$t('compute.text_302')">
        <os-select
          type="baremetal"
          :form="form"
          :types="osSelectTypes"
          hypervisor="baremetal"
          :image-params="imageParams"
          :decorator="decorators.imageOS"
          @updateImageMsg="setSelectedImage"
          :imageType.sync="osSelectImageType" />
      </a-form-item>
      <a-form-item v-bind="formItemLayout" :label="$t('compute.text_178')">
        <a-select v-decorator="decorators.specifications" :disabled="isInstallOperationSystem" @change="specificationChange">
          <a-select-option v-for="i in specOptions" :key="i.value" :value="i.value">
            {{i.text}}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item v-bind="formItemLayout" :label="$t('compute.text_303')">
        <div class="d-flex flex-wrap">
          <template v-for="(item, idx) of diskOptionsDate">
            <div :key="idx" class="disk-option-item">
              <a-card hoverable>
                <template slot="title">
                  <icon type="res-disk" />
                  {{ item.title }}
                  <a-tooltip :title="$t('compute.text_304')">
                    <a-icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" v-show="(idx === 0 && !isShowFalseIcon) || idx !== 0" />
                  </a-tooltip>
                  <a-tooltip :title="$t('compute.text_305')">
                    <a-icon type="close-circle" theme="twoTone" twoToneColor="#eb2f96" v-show="idx === 0 && isShowFalseIcon" />
                  </a-tooltip>
                </template>
                <a href="javascript:;" slot="extra" @click="handleDiskItemRemove(idx)" v-show="idx === diskOptionsDate.length - 1">{{$t('compute.perform_delete')}}</a>
                <div class="d-flex align-items-center">
                  <ve-pie :data="item.chartData" :settings="chartSettings" :events="chartFun(idx)" width="200px" height="200px" :legend-visible="false" />
                  <div class="flex-fill ml-2">
                    <template v-for="k in item.diskInfo">
                      <div :key="k">
                        <a-checkbox defaultChecked disabled>
                          {{k}}
                        </a-checkbox>
                      </div>
                    </template>
                    <a-tag color="blue">{{$t('compute.text_306', [item.size])}}</a-tag>
                  </div>
                </div>
              </a-card>
            </div>
          </template>
        </div>
      </a-form-item>
      <a-form-item v-bind="offsetFormItemLayout">
        <a-button type="primary" @click="addDisk" :disabled="specOptions.length === 0">{{$t('compute.text_307')}}</a-button>
      </a-form-item>
      <a-form-item :label="$t('compute.text_308')" v-bind="formItemLayout" v-if="!isCheckedIso">
        <server-password :form="form" :login-types="loginTypes" :isSnapshotImageType="false" :decorator="decorators.loginConfig" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_1154')" class="mb-0" v-bind="formItemLayout">
        <tag
          v-decorator="decorators.__meta__" :allowNoValue="false" :default-checked="tagDefaultChecked" />
      </a-form-item>
      <a-divider orientation="left">{{$t('compute.text_309')}}</a-divider>
      <a-form-item :label="$t('compute.text_104')" v-bind="formItemLayout" class="mb-0">
        <server-network
          ref="networkRef"
          :form="form"
          :decorator="decorators.network"
          :isBonding="isBonding"
          :network-list-params="networkParam"
          :network-resource-mapper="networkResourceMapper"
          :schedtag-params="params.policySchedtag"
          :networkVpcParams="params.vpcParams"
          :vpcResource="vpcResource"
          :vpcResourceMapper="vpcResourceMapper" />
      </a-form-item>
      <a-form-item v-bind="offsetFormItemLayout">
        <a-checkbox v-model="isBonding">{{$t('compute.text_310')}}</a-checkbox>
      </a-form-item>
      <a-form-item :label="$t('compute.text_311')" v-bind="formItemLayout" class="mb-0" v-if="!isInstallOperationSystem">
        <sched-policy
          ref="schedPolicyRef"
          server-type="baremetal"
          :form="form"
          :disabled-host="policyHostDisabled"
          :policy-host-params="params.policyHostParams"
          :decorators="decorators.schedPolicy"
          :policy-schedtag-params="policySchedtagParams"
          @change="hostChange"
          :hostData="filterHostData" />
      </a-form-item>
      <a-form-item :label="$t('compute.text_312')" v-bind="formItemLayout" v-if="isInstallOperationSystem">
        <a-input v-decorator="decorators.description" />
      </a-form-item>
      <bottom-bar
        :loading="submiting"
        :form="form"
        :selectedSpecItem="selectedSpecItem"
        type="baremetal"
        :isOpenWorkflow="isOpenWorkflow"
        :errors.sync="errors"
        :isServertemplate="false"
        :hasMeterService="hasMeterService"
        :isInitForm="isInitForm"
        @cancel="handleCancel" />
    </a-form>
  </div>
</template>
<script>
import WindowsMixin from '@/mixins/windows'
import workflowMixin from '@/mixins/workflow'
import CreateMixin from './mixins'

export default {
  name: 'BaremetalCreateIDC',
  mixins: [WindowsMixin, workflowMixin, CreateMixin],
}
</script>

<style lang="less" scoped>
.disk-option-item {
  & + .disk-option-item {
    margin-left: 15px;
  }
}
</style>
