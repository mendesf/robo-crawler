import { Attachment, CardFactory } from 'botbuilder';
import moment from 'moment';

const DATE_FORMAT = 'YYYY-MM-DD';

export abstract class DatepickerCardFactory {

  public static create(checkIn: string, checkOut: string): Attachment {
    if (checkIn && checkOut) {
      checkIn = moment(checkIn).format(DATE_FORMAT);
      checkOut = moment(checkOut).format(DATE_FORMAT);
    }

    const card = `
    {
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "version": "1.0",
      "type": "AdaptiveCard",
      "body": [
        {
          "type": "TextBlock",
          "text": "Para quando é a reserva?",
          "horizontalAlignment": "Center",
          "size": "Medium",
          "weight": "Bolder"
        },
        {
          "type": "TextBlock",
          "text": "Data de Entrada",
          "weight": "Bolder"
        },
        {
          "type": "Input.Date",
          "id": "checkIn",
          "value": "${checkIn}"
        },
        {
          "type": "TextBlock",
          "text": "Data de Saída",
          "weight": "Bolder"
        },
        {
          "type": "Input.Date",
          "id": "checkOut",
          "value": "${checkOut}"
        }
      ],
      "actions": [
        {
          "type": "Action.Submit",
          "title": "OK"
        }
      ]
    }
    `;

    return CardFactory.adaptiveCard(JSON.parse(card));
  }
}
