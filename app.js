const express = require('express');
const axios = require('axios');
const scheduler = require('node-cron');
const puppeteer = require('puppeteer');

const app = express();

const SKY_DRIVING_SCHOOL_WEBSITE = 'https://registration.skyautokool.ee/ru/sky/exams?language=RUS&category=B';
const TELEGRAM_BOT_LINK = 'https://api.telegram.org/bot5745064841:AAGiCPj_yivX7WMsl_Wgg6fpbE8iV8jKLv8/sendMessage?chat_id=1719259023&parse_mode=Markdown&text=';
const SEARCH_FOR = 'Ученики Sky Lasnamäe Autokool'

scheduler.schedule("*/15 * * * *", async function () {
  console.log("---------------------");
  console.log("Checking for new exams every 15 minutes...");

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(SKY_DRIVING_SCHOOL_WEBSITE);

  let availableTimes = (await page.evaluate(() =>
      Array.from(this.document.querySelectorAll('.v-card.v-sheet'), element => element.textContent)))
      .filter(el => el.includes(SEARCH_FOR) && !el.includes('16.11.2022'));

  if (availableTimes.length > 0) {
    await axios.get(TELEGRAM_BOT_LINK + `Появилось ${availableTimes.length} новых экзаменов`)
        .then(() => browser.close());
  } else {
    await browser.close();
  }
});

scheduler.schedule("0 59 23 * * *", async function () {
  console.log("---------------------");
  console.log("Sending health check");

  await axios.get(TELEGRAM_BOT_LINK + 'Я жив: ' + new Date().toISOString().slice(0, 10));
});

app.listen(3000, () => {
  console.log("application listening.....");
});