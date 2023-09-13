import type { StringIndexed } from '@slack/bolt/dist/types/helpers'
import { getPollCreateModal } from '../blocks/pollBlock'

export const pollCommand = async ({ ack, body, client, logger }: StringIndexed) => {
  await ack()

  const channel_id: string = body.channel_id
  const message_ts: string = ''
  const options: string[] = []

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: getPollCreateModal({ channel_id, message_ts, options })
    })
  } catch (error) {
    logger.error(error)
  }
}
