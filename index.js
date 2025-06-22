require("dotenv").config();
const puppeteer = require("puppeteer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyADFe53Ylvemv2AxklcaPJTOTn7-_JNUkE");

// Topics list
const topics = [
  "Latest AI trends",
  "Web Development Trends"
];

// Function to get random topic
const getRandomTopic = () => topics[Math.floor(Math.random() * topics.length)];

// Function to generate post using Gemini
async function generatePost(topic) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `Write a creative LinkedIn post about: ${topic}. Make it engaging and professional.`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Function to post on LinkedIn
async function postToLinkedIn(text) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.linkedin.com/login");

  await page.type("#username", process.env.EMAIL);
  await page.type("#password", process.env.PASSWORD);
  await page.click("button[type='submit']");
  await page.waitForNavigation({ timeout: 60000 });

  await page.goto("https://www.linkedin.com/feed/");
  await page.waitForSelector(".share-box-feed-entry__closed-share-box button.artdeco-button", { timeout: 60000 });
  await page.click(".share-box-feed-entry__closed-share-box button.artdeco-button");

  await page.waitForSelector("div[role='textbox']");
  await page.type("div[role='textbox']", text);

  await page.waitForSelector("button.share-actions__primary-action");
  await page.click("button.share-actions__primary-action");

  console.log("✅ Post done successfully!");
  await browser.close();
}

// Run everything
(async () => {
  const topic = getRandomTopic();
  console.log("📌 Topic:", topic);

  const postText = await generatePost(topic);
  console.log("📝 Generated Post:\n", postText);

  await postToLinkedIn(postText);
})();
