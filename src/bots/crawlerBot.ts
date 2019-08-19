import { ActivityHandler, AttachmentLayoutTypes, ConversationState, MessageFactory, StatePropertyAccessor } from 'botbuilder';
import { DatepickerCardFactory, RoomCardFactory } from '../cards';
import { RoomCrawler } from '../crawlers/RoomCrawler';

const CHECK_IN = 'checkInProperty';
const CHECK_OUT = 'checkOutProperty';
const PRICE_QUOTE_SUGGESTION = 'Cotação de Tarifas';

export class CrawlerBot extends ActivityHandler {

  private checkInProperty: StatePropertyAccessor<string>;
  private checkOutProperty: StatePropertyAccessor<string>;

    constructor(conversationState: ConversationState) {
    super();

    this.checkInProperty = conversationState.createProperty(CHECK_IN);
    this.checkOutProperty = conversationState.createProperty(CHECK_OUT);

    this.onMembersAdded(async (turnContext, next) => {
      await this.sendWelcomeMessage(turnContext);
      await next();
    });

    this.onMessage(async (turnContext, next) => {
      const text = turnContext.activity.text;
      const value = turnContext.activity.value;

      if (text) {
        if (text.toLocaleLowerCase().includes(PRICE_QUOTE_SUGGESTION.toLocaleLowerCase())) {
          await this.sendDatePickerCard(turnContext);
        } else {
          await turnContext.sendActivity(`Meu nome é Felipe e eu ainda estou aprendendo a como ser um bot.
          Aqui algumas das coisas que eu já sei fazer:`);
          await this.sendSuggestedActions(turnContext);
        }
      } else if (value) {
        await turnContext.sendActivity('Buscandos os melhores preços...');

        const reservationHelper = new RoomCrawler();
        const { checkIn, checkOut } = value;

        await this.checkInProperty.set(turnContext, checkIn);
        await this.checkOutProperty.set(turnContext, checkOut);

        const rooms = await reservationHelper.getRooms(checkIn, checkOut);

        await turnContext.sendActivity({
          attachments: rooms.map((room) => RoomCardFactory.create(room)),
          attachmentLayout: AttachmentLayoutTypes.Carousel
        });
      }

      await next();
    });

    this.onDialog(async (turnContext, next) => {
      await conversationState.saveChanges(turnContext, false);
      await next();
    });
  }

  private async sendWelcomeMessage(turnContext) {
    const activity = turnContext.activity;
    for (const member of activity.membersAdded) {
      if (member.id !== activity.recipient.id) {
        await turnContext.sendActivity('Olá, bem-vindo ao Hotel Village Le Canton!');
      }
    }
  }

  private async sendSuggestedActions(turnContext) {
    const reply = MessageFactory.suggestedActions([PRICE_QUOTE_SUGGESTION]);
    await turnContext.sendActivity(reply);
  }

  private async sendDatePickerCard(turnContext) {
    const checkIn = await this.checkInProperty.get(turnContext);
    const checkOut = await this.checkOutProperty.get(turnContext);

    await turnContext.sendActivity({
      attachments: [
        DatepickerCardFactory.create(checkIn, checkOut)
      ]
    });
  }
}
