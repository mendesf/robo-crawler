import { launch } from 'puppeteer';
import { stringify } from 'querystring';
import { RoomData } from '../models/roomData';
import moment from 'moment';

const HOTEL_URL = 'https://myreservations.omnibees.com';
const DATE_FORMAT = 'YYYYMMDD';

export class RoomCrawler {

  public getRooms(checkIn: string, checkOut: string): Promise<RoomData[]> {
    checkIn = moment(checkIn).format(DATE_FORMAT);
    checkOut = moment(checkOut).format(DATE_FORMAT);
    const query = this.buildQuery(checkIn, checkOut);
    const url = `${HOTEL_URL}/default.aspx?${query}`;
    
    return this.evalueatePage(url);
  }

  private async evalueatePage(url: string): Promise<RoomData[]> {
    const browser = await launch();
    const page = await browser.newPage();
    await page.goto(url);

    const roomsData = await page.evaluate((hotelUrl) => {
      const rooms = [];

      document.querySelectorAll('.roomExcerpt').forEach((roomExcerpt) => {
        const room = {} as RoomData;

        room.title = roomExcerpt.querySelector('.excerpt h5 a').textContent;
        room.price = roomExcerpt.querySelector('.sincePrice h6').textContent;
        room.description = roomExcerpt.querySelector('.excerpt .description').textContent;
        room.imageUrl = hotelUrl + roomExcerpt.querySelector('.thumb .slide a').getAttribute('href');

        rooms.push(room);
      });

      return rooms;
    }, HOTEL_URL);

    browser.close().catch((err) => {
      console.error(err);
    });

    return roomsData;
  }

  private buildQuery(checkIn: string, checkOut: string) {
    const query = {
      q: '5462',
      version: 'MyReservation',
      sid: 'b9a6b77c-6f4e-4818-8b2a-6ad2d6d80195#/',
      diff: false,
      CheckIn: checkIn,
      CheckOut: checkOut,
      Code: '',
      group_code: '',
      loyality_card: '',
      NRooms: 1,
      ad: 1,
      ch: 0,
      ag: '-'
    };

    return stringify(query);
  }
}
