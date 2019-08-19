import { BotFrameworkAdapter, ConversationState, MemoryStorage } from 'botbuilder';
import { config } from 'dotenv';
import * as path from 'path';
import * as restify from 'restify';
import { CrawlerBot } from './bots/crawlerBot';

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\n${server.name} listening to ${server.url}`);
});

const ENV_FILE = path.join(__dirname, '..', '.env');
config({ path: ENV_FILE });

const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppID,
  appPassword: process.env.MicrosoftAppPassword
});

adapter.onTurnError = async (context, error) => {
  console.error(`\n [onTurnError]: ${error}`);
  await context.sendActivity(`Oops. Algo deu errado!`);
};

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);

const crawlerBot = new CrawlerBot(conversationState);

server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    await crawlerBot.run(context);
  });
});
