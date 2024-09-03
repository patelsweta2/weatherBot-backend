import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as TelegramBot from 'node-telegram-bot-api';
import { UserService } from 'src/users/user.service';
import * as cron from 'node-cron';

@Injectable()
export class TelegramService {
  private bot: TelegramBot;

  constructor(private readonly userService: UserService) {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true,
    });

    this.bot.on('message', (msg) => {
      if (msg.text === '/start') {
        this.start(msg);
      } else if (msg.text === '/subscribe') {
        this.subscribe(msg);
      } else if (msg.text === '/unsubscribe') {
        this.unsubscribe(msg);
      }
    });

    this.initateDailyWeatherUpdate();
  }

  initateDailyWeatherUpdate() {
    // Daily update at 6am
    const cronExpression = '00 6 * * *';

    let cityWeatherConfig = {};

    cron.schedule(cronExpression, async () => {
      cityWeatherConfig = {};

      const users = await this.userService.getUsers();

      users.forEach(async (user) => {
        const { chatId, city, isSubscribed, isBlocked } = user;

        if (isBlocked || !isSubscribed) {
          return;
        }

        if (city in cityWeatherConfig) {
          this.bot.sendMessage(chatId, cityWeatherConfig[city]);
          return;
        }

        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.API_KEY}`;
        const weatherData = await axios.get(weatherApiUrl);

        const time = new Date(weatherData.data.dt);
        const description = weatherData.data.weather[0].main;
        const temperature = weatherData.data.main.temp;
        const humidity = weatherData.data.main.humidity;

        cityWeatherConfig[city] = this.getWeatherMessage(
          city,
          time,
          description,
          temperature,
          humidity,
        );

        this.bot.sendMessage(chatId, cityWeatherConfig[city]);
      });
    });
  }

  getWeatherMessage(
    city: string,
    time: Date,
    description: string,
    temperature: number,
    humidity: number,
  ) {
    const tempInCelsius =
      Math.floor((((temperature - 32) * 5) / 9) * 100) / 100;
    return `Daily Weather Update (${city}): ${description}\nTemperature: ${tempInCelsius}°C\nHumidity: ${humidity}%\nLast updated at: ${time}`;
  }

  start(msg) {
    this.bot.sendMessage(
      msg.chat.id,
      `Hey ${msg.from.first_name},\nWelcome to the Weather Bot!\nHere are the commands you can use:\n/start - to start the bot\n/subscribe - to get weather updates\n/unsubscribe - to stop receiving updates\nPlease select a command to proceed.`,
    );
  }

  async subscribe(msg) {
    const chatId = msg.chat.id;

    try {
      const user = await this.userService.userExists(chatId);

      if (!user) {
        this.bot.sendMessage(chatId, 'Please enter your city: ');

        this.getValidCity(chatId);
      } else {
        await this.userService.subscribeUser(chatId);
        this.bot.sendMessage(
          chatId,
          'Successfully subscribed!\nYou will receive your city weather updates daily at 6:00 AM..',
        );
      }
    } catch (err) {
      this.bot.sendMessage(chatId, err.message);
    }
  }

  async unsubscribe(msg) {
    const chatId = msg.chat.id;

    try {
      const user = await this.userService.userExists(chatId);
      if (!user) {
        throw new Error('User not exists');
      }

      await this.userService.unsubscribeUser(chatId);
      this.bot.sendMessage(chatId, 'You’ve been unsubscribed successfully!');
    } catch (err) {
      this.bot.sendMessage(chatId, err.message);
    }
  }

  async getValidCity(chatId: string) {
    this.bot.once('message', async (msg) => {
      if (chatId !== msg.chat.id) {
        this.getValidCity(chatId);
        return;
      }

      if (!/[a-zA-Z]/.test(msg.text)) {
        this.bot.sendMessage(chatId, 'Please enter valid City name');
        this.getValidCity(chatId);
        return;
      }

      const city = msg.text;

      const cityUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.API_KEY}`;
      const searchCity = await axios.get(cityUrl);

      if (searchCity.data[0].name.toLowerCase() !== city.toLowerCase()) {
        this.bot.sendMessage(chatId, 'Please enter valid City name');

        this.getValidCity(chatId);
        return;
      }

      await this.userService.createUser({
        name: msg.from.first_name,
        chatId,
        city: searchCity.data[0].name,
      });
      this.bot.sendMessage(
        chatId,
        'Successfully subscribed!\nYou will receive your city weather updates daily at 6:00 AM..',
      );
    });
  }
}
