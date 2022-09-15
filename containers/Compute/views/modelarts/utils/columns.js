import { WORK_TYPE } from '../constants'

// 训练作业
export const getTrainingJobTableColumn = () => {
  return {
    field: 'train',
    title: WORK_TYPE.Train.label,
    minWidth: 100,
    slots: {
      default: ({ row }, h) => {
        const exist = row.work_type?.includes(WORK_TYPE.Train.key)
        return [
          <div class='text-truncate'>
            <status status={ exist } statusModule='enabled' />
          </div>,
        ]
      },
    },
  }
}

// 推理服务
export const getInferenceServiceTableColumn = () => {
  return {
    field: 'infer',
    title: WORK_TYPE.Infer.label,
    minWidth: 100,
    slots: {
      default: ({ row }, h) => {
        const exist = row.work_type?.includes(WORK_TYPE.Infer.key)
        return [
          <div class='text-truncate'>
            <status status={ exist } statusModule='enabled' />
          </div>,
        ]
      },
    },
  }
}

// 开发环境
export const getDevelopEnvTableColumn = () => {
  return {
    field: 'notebook',
    title: WORK_TYPE.Notebook.label,
    minWidth: 100,
    slots: {
      default: ({ row }, h) => {
        const exist = row.work_type?.includes(WORK_TYPE.Notebook.key)
        return [
          <div class='text-truncate'>
            <status status={ exist } statusModule='enabled' />
          </div>,
        ]
      },
    },
  }
}
