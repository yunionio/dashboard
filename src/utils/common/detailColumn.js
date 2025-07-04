import * as R from 'ramda'
import _ from 'lodash'
import i18n from '@/locales'
import TagDetailColumn from '@/sections/TagDetailColumn'
import { isExtTag } from './tag'

const getTagColumn = ({
  showEdit = false,
  type = 'user',
  field = 'user_tag',
  hiddenField = 'metadata',
  title = i18n.t('table.title.user_tag'),
  ignoreKeys,
  needExt,
  needUser,
  resource,
  onManager,
  columns,
  tipName,
  ignorePrefix,
  hidden,
  params,
  editCheck = (row) => true,
  idKey = 'id',
}) => {
  return {
    title,
    field,
    hiddenField,
    hidden,
    slots: {
      default: ({ row }, h) => {
        return [
          h(TagDetailColumn, {
            props: {
              showEdit,
              type,
              row,
              onManager,
              metadata: _.get(row, 'metadata', {}),
              ignoreKeys,
              needExt,
              needUser,
              resource,
              columns,
              tipName,
              ignorePrefix,
              tagParams: params,
              canEdit: editCheck(row),
              idKey,
            },
          }),
        ]
      },
    },
  }
}

export const getUserTagColumn = ({
  field = 'user_tag',
  hiddenField = 'metadata',
  title = i18n.t('table.title.user_tag'),
  ignoreKeys,
  needExt,
  needUser,
  resource,
  onManager,
  columns,
  tipName,
  ignorePrefix,
  showEdit = true,
  params = {},
  editCheck = (row) => true,
  idKey = 'id',
} = {}) => {
  return getTagColumn({
    showEdit,
    type: 'user',
    field: field,
    hiddenField,
    title: title,
    ignoreKeys,
    needExt,
    needUser,
    resource,
    onManager,
    columns,
    tipName,
    ignorePrefix,
    params,
    editCheck,
    idKey,
  })
}

export const getExtTagColumn = ({
  field = 'ext_tag',
  hiddenField = 'metadata',
  title = i18n.t('table.title.ext_tag'),
  ignoreKeys,
  needExt,
  needUser,
  resource,
  onManager,
  columns,
  tipName,
  ignorePrefix,
  params = {},
  editCheck = (row) => true,
  idKey = 'id',
} = {}) => {
  return getTagColumn({
    type: 'ext',
    field: field,
    hiddenField,
    title: title,
    ignoreKeys,
    needExt,
    needUser,
    resource,
    onManager,
    columns,
    tipName,
    ignorePrefix,
    params,
    hidden: (data) => {
      if (R.isNil(data.metadata) || R.isEmpty(data.metadata)) {
        return true
      }
      const keys = Object.keys(data.metadata)
      const hasTag = keys.some(item => isExtTag(item))
      return !hasTag
    },
    editCheck,
    idKey,
  })
}
