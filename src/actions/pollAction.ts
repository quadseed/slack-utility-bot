import type { StringIndexed } from '@slack/bolt/dist/types/helpers'
import { getPollCreateModal } from '../blocks/pollBlock'

export const pollCreateAddOptionAction = async ({ ack, client, body, logger }: StringIndexed) => {
  await ack()

  const newOption = body.view.state.values['new_option_input_block']['add_option_string']['value']
  if (newOption == null) {
    return
  }

  const metadata = JSON.parse(body.view.private_metadata)
  metadata.options.push(newOption)

  const channel_id = metadata.channel_id
  const message_ts = metadata.message_ts
  const options = metadata.options

  try {
    await client.views.update({
      view_id: body.view.id,
      view: getPollCreateModal({ channel_id, message_ts, options })
    })
  } catch (error) {
    logger.error(error)
  }
}

export const pollCreateRemoveAction = async ({ ack, client, body, logger }: StringIndexed) => {
  await ack()

  const targetOptionIndex = body.actions[0]['value']
  const metadata = JSON.parse(body.view.private_metadata)
  metadata.options.splice(targetOptionIndex, 1)

  const channel_id = metadata.channel_id
  const message_ts = metadata.message_ts
  const options = metadata.options

  try {
    await client.views.update({
      view_id: body.view.id,
      view: getPollCreateModal({ channel_id, message_ts, options })
    })
  } catch (error) {
    logger.error(error)
  }
}

export const pollCreateToggleDeadlineAction = async ({ ack, body }: StringIndexed) => {
  await ack()

  console.log(body)
}
