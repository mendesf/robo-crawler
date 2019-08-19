import { Attachment, CardFactory } from 'botbuilder';
import { RoomData } from '../models/roomData';

export abstract class RoomCardFactory {

  public static create(data: RoomData): Attachment {
    const card = `
    {
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "version": "1.0",
      "type": "AdaptiveCard",
      "body": [
        {
          "type": "Image",
          "url": "${data.imageUrl}",
          "size": "Stretch"
        },
        {
          "type": "TextBlock",
          "size": "ExtraLarge",
          "text": "${data.title}"
        },
        {
          "type": "TextBlock",
          "text": "a partir de ${data.price} por noite",
          "size": "Medium",
          "color": "Good"
        },
        {
          "type": "TextBlock",
          "text": "${data.description}",
          "wrap": true,
          "spacing": "Medium"
        }
      ]
    }
    `;

    return CardFactory.adaptiveCard(JSON.parse(card));
  }
}
