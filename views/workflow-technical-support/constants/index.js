import i18n from '@/locales'

export const statusSearchMap = {
  OPEN: {
    text: i18n.t('common.workflow.open'),
  },
  PENDING: {
    text: i18n.t('common.workflow.pending'),
  },
  IN_PROCESS: {
    text: i18n.t('common.workflow.in_process'),
  },
  REOPEN: {
    text: i18n.t('common.workflow.reopen'),
  },
  CLOSED: {
    text: i18n.t('common.workflow.closed'),
  },
}

export const statusMap = {
  OPEN: {
    text: i18n.t('common.workflow.open'),
    color: '#f6a100',
  },
  PENDING: {
    text: i18n.t('common.workflow.pending'),
    color: '#7ed321',
  },
  IN_PROCESS: {
    text: i18n.t('common.workflow.in_process'),
    color: '#f6a100',
  },
  REOPEN: {
    text: i18n.t('common.workflow.reopen'),
    color: '#f6a100',
  },
  COMPLETED: {
    text: i18n.t('common.workflow.closed'),
    color: '#8a94a6',
  },
  EXTERNALLY_TERMINATED: {
    text: i18n.t('common.workflow.closed'),
    color: '#8a94a6',
  },
}

export const CLOSE_STATUS = ['COMPLETED', 'EXTERNALLY_TERMINATED']
