import type { View } from '@slack/bolt'

type PrivateMetadata = {
  channel_id: string
  message_ts: string
  options: string[]
}

type Option = {
  label: string
  users: string[]
}

type Poll = {
  title: string
  options: Option[]
  author_id: string
  selectedUserPercent: number
  selectedUserCount: number
  inChannelUserCount: number
  multiple: boolean
  editing_restrictions: boolean
  anonymous_mode: boolean
  deadline_mode: boolean
  deadline: string
}

export const getPrivateMetadata = ({ channel_id, message_ts, options }: PrivateMetadata) => {
  const metadata = {
    channel_id: channel_id,
    message_ts: message_ts,
    options: options
  }

  return JSON.stringify(metadata)
}

const getModalOptions = (options: string[]) => {
  const optionBlocks = options.map((option, index) => {
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${index + 1}.* ${option}`
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: '削除',
          emoji: true
        },
        value: `${index}`,
        action_id: 'poll-create-remove-option'
      }
    }
  })

  return optionBlocks
}

const getOptions = (options: Option[]) => {
  const optionBlock = options.map((option, index) => {
    let text = `*${index + 1}.* ${option.label} : \`${option.users.length}\` \n `
    option.users.forEach((user, index, array) => {
      text += `<@${user}>`
      if (!(index == array.length - 1)) {
        text += ', '
      }
    })

    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: text
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: String(index + 1),
          emoji: true
        },
        value: String(index + 1),
        action_id: `poll-choose`
      }
    }
  })
  return optionBlock
}

export const getPollBlock = ({
  title,
  options,
  author_id,
  selectedUserPercent,
  selectedUserCount,
  inChannelUserCount,
  multiple,
  editing_restrictions,
  anonymous_mode,
  deadline_mode,
  deadline
}: Poll) => {
  const pollBlock = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${title}*`
      },
      accessory: {
        type: 'overflow',
        options: [
          {
            text: {
              type: 'plain_text',
              text: '選択肢を追加/削除',
              emoji: true
            },
            value: 'edit-option'
          },
          {
            text: {
              type: 'plain_text',
              text: '投票モードの切り替え',
              emoji: true
            },
            value: 'toggle-mode'
          },
          {
            text: {
              type: 'plain_text',
              text: '投票期限の変更',
              emoji: true
            },
            value: 'change-deadline'
          },
          {
            text: {
              type: 'plain_text',
              text: '投票を締め切る',
              emoji: true
            },
            value: 'close-poll'
          }
        ],
        action_id: 'overflow-action'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*投票率: ${selectedUserPercent}%  [${selectedUserCount}/${inChannelUserCount}]*`
      }
    },
    ...getOptions(options),
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*複数選択*: ${multiple ? '可能' : '不可'}`
        }
      ]
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*投票モード*: ${anonymous_mode ? '匿名' : '通常'}`
        }
      ]
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*編集*: ${editing_restrictions ? '作成者のみ' : '全員'}`
        }
      ]
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*投票期限*: ${deadline_mode ? deadline : 'なし'}`
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*作成者*: <@${author_id}>`
        }
      ]
    }
  ]

  return pollBlock
}

export const getPollCreateModal = ({ channel_id, message_ts, options }: PrivateMetadata) => {
  const pollCreateModal: View = {
    type: 'modal',
    callback_id: 'poll-create-modal',
    private_metadata: JSON.stringify({ channel_id: channel_id, message_ts, options: options }),
    title: {
      type: 'plain_text',
      text: '投票の作成',
      emoji: true
    },
    submit: {
      type: 'plain_text',
      text: '送信',
      emoji: true
    },
    close: {
      type: 'plain_text',
      text: 'キャンセル',
      emoji: true
    },
    blocks: [
      {
        type: 'input',
        block_id: 'title_block',
        element: {
          type: 'plain_text_input',
          action_id: 'title'
        },
        label: {
          type: 'plain_text',
          text: 'タイトル',
          emoji: true
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'input',
        block_id: 'new_option_input_block',
        element: {
          type: 'plain_text_input',
          action_id: 'add_option_string'
        },
        label: {
          type: 'plain_text',
          text: '選択肢',
          emoji: true
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '選択肢を追加',
              emoji: true
            },
            value: 'click_me_123',
            action_id: 'poll-create-add-option'
          }
        ]
      },
      ...getModalOptions(options),
      {
        type: 'input',
        block_id: 'settings',
        optional: true,
        element: {
          type: 'checkboxes',
          options: [
            {
              text: {
                type: 'plain_text',
                text: '複数選択を有効にする',
                emoji: true
              },
              value: 'multiple'
            },
            {
              text: {
                type: 'plain_text',
                text: '匿名モードにする',
                emoji: true
              },
              value: 'anonymous_mode'
            },
            {
              text: {
                type: 'plain_text',
                text: '作成者以外による設定変更を許可する',
                emoji: true
              },
              value: 'editing_restrictions'
            },
            {
              text: {
                type: 'plain_text',
                text: '投票期限を設定する',
                emoji: true
              },
              value: 'deadline_mode'
            }
          ],
          action_id: 'poll-create-settings-action'
        },
        label: {
          type: 'plain_text',
          text: '投票設定',
          emoji: true
        }
      }
    ]
  }

  return pollCreateModal
}

export const getPollEditModal = ({ channel_id, message_ts, options }: PrivateMetadata) => {
  const pollEditModal: View = {
    type: 'modal',
    callback_id: 'poll-edit-modal',
    private_metadata: JSON.stringify({ channel_id: channel_id, message_ts, options: options }),
    title: {
      type: 'plain_text',
      text: '選択肢の編集',
      emoji: true
    },
    submit: {
      type: 'plain_text',
      text: '確定',
      emoji: true
    },
    close: {
      type: 'plain_text',
      text: 'キャンセル',
      emoji: true
    },
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'title',
          emoji: true
        }
      },
      ...getModalOptions(options),
      {
        type: 'divider'
      },
      {
        type: 'input',
        element: {
          type: 'plain_text_input',
          action_id: 'plain_text_input-action'
        },
        label: {
          type: 'plain_text',
          text: '選択肢を追加する',
          emoji: true
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '追加',
              emoji: true
            },
            value: 'click_me_123',
            action_id: 'actionId-0'
          }
        ]
      }
    ]
  }

  return pollEditModal
}

export const getPollChangeDeadlineModal = () => {
  const pollChangeDeadlineModal: View = {
    type: 'modal',
    callback_id: 'poll-change-deadline-modal',
    title: {
      type: 'plain_text',
      text: '投票期限の変更',
      emoji: true
    },
    submit: {
      type: 'plain_text',
      text: '確定',
      emoji: true
    },
    close: {
      type: 'plain_text',
      text: 'キャンセル',
      emoji: true
    },
    blocks: [
      {
        type: 'input',
        element: {
          type: 'datetimepicker',
          action_id: 'datetimepicker-action'
        },
        label: {
          type: 'plain_text',
          text: '投票期限',
          emoji: true
        }
      }
    ]
  }

  return pollChangeDeadlineModal
}
