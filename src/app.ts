import { App } from '@slack/bolt'
import type { BlockAction } from '@slack/bolt'
import { pollCommand } from './commands/pollCommand'

import 'dotenv/config'
import { pollCreateModalView } from './views/pollView'
import {
  pollCreateAddOptionAction,
  pollCreateRemoveAction,
  pollCreateToggleDeadlineAction
} from './actions/pollAction'

const app = new App({
  appToken: process.env.SLACK_APP_TOKEN,
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  port: 3000
})

app.command('/poll', pollCommand)

app.action<BlockAction>('poll-create-add-option', pollCreateAddOptionAction)
app.action<BlockAction>('poll-create-remove-option', pollCreateRemoveAction)
app.action<BlockAction>('poll-create-settings-action', pollCreateToggleDeadlineAction)

app.view('poll-create-modal', pollCreateModalView)
;(async () => {
  await app.start()

  console.log('⚡️ Bolt app is running!')
})()
