import * as R from 'ramda'
import i18n from '@/locales'
export const CATEGORY_LABEL_MAP = {
  vminstance_hidden_menus: i18n.t('cloudenv.text_507'),
  vminstance_configured_callback_address: i18n.t('cloudenv.text_508'),
}

export const CATEGORY_KEYS = {
  VMINSTANCE_HIDDEN_MENUS: 'vminstance_hidden_menus',
  VMINSTANCE_CONFIGURED_CALLBACK_ADDRESS: 'vminstance_configured_callback_address',
}

export const categories = [
  {
    key: CATEGORY_KEYS.VMINSTANCE_HIDDEN_MENUS,
    label: i18n.t('cloudenv.text_507'),
    action: i18n.t('cloudenv.text_509'),
    component: 'HiddenMenus',
  },
  {
    key: CATEGORY_KEYS.VMINSTANCE_CONFIGURED_CALLBACK_ADDRESS,
    label: i18n.t('cloudenv.text_508'),
    action: i18n.t('cloudenv.text_510'),
    component: 'ConfiguredCallbackAddress',
  },
]

export const policies = {
  [CATEGORY_KEYS.VMINSTANCE_HIDDEN_MENUS]: [
    { label: i18n.t('cloudenv.text_104'), value: 'server_create' },
    { label: i18n.t('cloudenv.text_511'), value: 'server_perform_start' },
    { label: i18n.t('cloudenv.text_512'), value: 'server_perform_stop' },
    { label: i18n.t('cloudenv.text_513'), value: 'server_perform_restart' },
    { label: i18n.t('cloudenv.text_514'), value: 'server_perform_reset' },
    { label: i18n.t('cloudenv.text_515'), value: 'server_perform_suspend' },
    { label: i18n.t('cloudenv.text_516'), value: 'server_perform_resume' },
    { label: i18n.t('cloudenv.text_354'), value: 'synchronization_status' },
    { label: i18n.t('cloudenv.text_406'), value: 'server_perform_update' },
    { label: i18n.t('cloudenv.text_517'), value: 'server_perform_rebuild_root' },
    { label: i18n.t('cloudenv.text_518'), value: 'server_perform_change_config' },
    { label: i18n.t('cloudenv.text_519'), value: 'server_perform_change_project' },
    { label: i18n.t('cloudenv.text_520'), value: 'server_perform_create_snapshot' },
    { label: i18n.t('cloudenv.text_521'), value: 'server_perform_create_same_config' },
    { label: i18n.t('cloudenv.text_522'), value: 'server_perform_set_gpu' },
    { label: i18n.t('cloudenv.text_523'), value: 'server_perform_set_disk_speed' },
    { label: i18n.t('cloudenv.text_524'), value: 'server_perform_cancel_expire' },
    { label: i18n.t('cloudenv.text_525'), value: 'server_perform_clone' },
    { label: i18n.t('cloudenv.text_526'), value: 'server_perform_add_instancegroup' },
    { label: i18n.t('cloudenv.text_527'), value: 'server_perform_Renew' },
    { label: i18n.t('cloudenv.text_528'), value: 'server_perform_auto_renewal' },
    { label: i18n.t('cloudenv.text_529'), value: 'server_perform_reset_password' },
    { label: i18n.t('cloudenv.text_530'), value: 'server_perform_bind_key' },
    { label: i18n.t('cloudenv.text_531'), value: 'server_perform_unbind_key' },
    { label: i18n.t('cloudenv.text_532'), value: 'server_perform_save_image' },
    { label: i18n.t('cloudenv.text_533'), value: 'server_perform_mount_iso' },
    { label: i18n.t('cloudenv.text_534'), value: 'server_perform_unmount_iso' },
    { label: i18n.t('cloudenv.text_535'), value: 'server_perform_add_secgroup' },
    { label: i18n.t('cloudenv.text_536'), value: 'server_perform_bind_elastic_public_ip' },
    { label: i18n.t('cloudenv.text_537'), value: 'server_perform_unbind_elastic_public_ip' },
    { label: i18n.t('cloudenv.text_538'), value: 'server_perform_public_ip_to_eip' },
    { label: i18n.t('cloudenv.text_539'), value: 'server_perform_set_source_check' },
    { label: i18n.t('cloudenv.text_540'), value: 'server_perform_add_backup' },
    { label: i18n.t('cloudenv.text_541'), value: 'server_perform_delete_backup' },
    { label: i18n.t('cloudenv.text_542'), value: 'server_perform_transfer' },
    { label: i18n.t('cloudenv.text_543'), value: 'server_set_delete_protection' },
    { label: i18n.t('cloudenv.text_108'), value: 'server_perform_delete' },
  ],
  [CATEGORY_KEYS.VMINSTANCE_CONFIGURED_CALLBACK_ADDRESS]: [
    { label: i18n.t('cloudenv.text_544'), value: 'create_callback_address' },
    { label: i18n.t('cloudenv.text_545'), value: 'adjust_configuration_callback_address' },
    { label: i18n.t('cloudenv.text_520'), value: 'create_snapshot_callback_address' },
    { label: i18n.t('cloudenv.text_521'), value: 'create_same_configuration_callback_address' },
    { label: i18n.t('cloudenv.text_525'), value: 'host_clone_callback_address' },
    { label: i18n.t('cloudenv.text_527'), value: 'renew_callback_address' },
    { label: i18n.t('cloudenv.text_546'), value: 'modify_bandwidth_callback_address' },
    { label: i18n.t('cloudenv.text_108'), value: 'delete_callback_address' },
  ],
}

/**
  * @description 转换policies数据格式，用于映射
  * @returns {
  *   vminstance_hidden_menus: { server_create: '新建', ... },
  *   ...
  * }
*/
const _policireValueMap = function (policies) {
  const ret = {}
  R.forEachObjIndexed((value, key) => {
    const obj = {}
    ret[key] = {}
    value.map(item => {
      obj[item.value] = item.label
    })
    ret[key] = obj
  }, policies)
  return ret
}

export const POLICIES_VALUE_MAP = _policireValueMap(policies)
