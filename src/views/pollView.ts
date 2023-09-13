import type { StringIndexed } from '@slack/bolt/dist/types/helpers'
import { getPollBlock } from '../blocks/pollBlock'

type SelectedOption = {
  text: {
    type: string
    text: string
    emoji: boolean
  }
  value: string
}

export const pollCreateModalView = async ({ ack, body, view, client, logger }: StringIndexed) => {
  await ack()

  const data = view.state.values

  const title = data['title_block']['title']['value']
  const metadata = JSON.parse(view['private_metadata'])
  const inChannelMember = await client.conversations.members({
    channel: metadata.channel_id
  })
  const selected_options =
    view.state.values.settings['poll-create-settings-action']['selected_options']

  const users: string[] = []

  const options = metadata.options.map((option: string) => {
    return {
      label: option,
      users: users
    }
  })

  const payload = {
    title: title,
    options: options,
    author_id: body.user.id,
    selectedUserPercent: 0,
    selectedUserCount: 0,
    inChannelUserCount: inChannelMember.members.length,
    multiple: false,
    editing_restrictions: false,
    anonymous_mode: false,
    deadline_mode: false,
    deadline: '2022-05-28T15:32:34.000Z'
  }

  selected_options.forEach((option: SelectedOption) => {
    switch (option.value) {
      case 'multiple':
        payload.multiple = true
        break

      case 'anonymous_mode':
        payload.anonymous_mode = true
        break

      case 'editing_restrictions':
        payload.editing_restrictions = true
        break

      case 'deadline_mode':
        payload.deadline_mode = true
        break
    }
  })

  try {
    await client.chat.postMessage({
      channel: metadata.channel_id,
      text: `投票: ${title}`,
      blocks: getPollBlock(payload)
    })
  } catch (error) {
    logger.error(error)
  }
}
