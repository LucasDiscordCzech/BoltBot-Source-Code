// Importing necessary modules for Discord.js, express, and bottleneck (rate limiting)
const { Client, GatewayIntentBits, EmbedBuilder} = require('discord.js'); 


const express = require('express'); // Express for the 24/7 uptime server (please comment out if you're not using replit, aswell the express server at the of the code.)

const Bottleneck = require('bottleneck'); // Rate limiter for OpenAIApi so you don't hit rate limits. 

// Importing the buildPrompt function from the specified file
const buildPrompt = require("./Prompt.js");

// OpenAI configuration setup
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Helper function to delay execution for a specified amount of time (used for retries)
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function for custom logging with formatted timestamp
function customLog(message) {
  const time = new Date().toLocaleTimeString();
  const redCode = '\x1b[31m';
  const whiteColorCode = '\x1b[37m';
  const resetCode = '\x1b[0m';
  console.log(`${redCode}[${whiteColorCode}${time}${redCode}]${whiteColorCode} -> ${redCode}${message}${resetCode}`);
}

// Constants for token management and limiter setup
const MAX_TOKENS = 1000; // not recommended above 5000, if you're noticing the bot doesn't remember anything, and forgets alot, you should probraly make this lower and fetch less messages. 

// Recommended settings:
// GPT-4 = 3500
// GPT-3.5 = 800
// GPT-3.5-16K = 14000

// NOTE: This should be usually half of the model's max token amount. This code won't work properly when using the classic GPT-3.5 (gpt-3.5-turbo) model, we recommend using GPT-3.5-16k (gpt-3.5-turbo-16k).

const TOKEN_BUFFER = 100;
const limiter = new Bottleneck({
  minTime: 2500, // Minimum time between actions in ms, please set an amount beetwen global openaiApi calls to avoid OpenAI rate limits. 
});

// Client setup for Discord bot, specifying required intents for functionality
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

// Function to handle API call to OpenAI and get a response
async function createChatCompletion(conversationLog) {
    return openai.createChatCompletion({
      model: "gpt-4-0613", // If you dont have gpt-4 acesss, use gpt-3.5-turbo-16k.
      messages: conversationLog,
      max_tokens: 300, // This can be quite expensive if you make it too high, recommended is 300.
      temperature: 0.6,
      top_p: 1,
      presence_penalty: 0.6,
    });
}

// Event to log when the bot is ready and operational
client.on('ready', () => {
  customLog(`Bot is ready as: ${client.user.tag}`);
const numberOfServers = client.guilds.cache.size;
    customLog(`Listening to messages in ${numberOfServers} servers, @ the bot!`);
});

// Main event for handling messages in the Discord server
client.on('messageCreate', async message => {
  // Ignoring bot messages to prevent loops
  if (message.author.bot) return;

  // Convert the user's message to lowercase for checks
  const contentLower = message.content.toLowerCase();

  // Check if the bot was mentioned or specific triggers are used to activate the bot
  if ((message.mentions.users.first() && message.mentions.users.first().id == client.user.id) || message.channel.type == 1 || contentLower.startsWith('bb')) { // set preffered "shortcut / prefix" to use the bot without @ it. 
    
    // Initial conversation setup, providing bot personality and instructions
    let initialConversationLog = await buildPrompt(message, client);
    
    // Fetch recent messages for context in the conversation
    const beforeMessage = message.id;
    let allMessages = await message.channel.messages.fetch({ limit: 30 }); // Custom amount of messages for the AI to remember. You may modify this. 
    let prevMessages = allMessages.filter(msg => msg.id <= beforeMessage);
    
    let conversationLog = [...initialConversationLog];
    
    // Process and format recent messages for the API call
    let reversedPrevMessages = Array.from(prevMessages.values()).reverse();
    for (let msg of reversedPrevMessages) {
      const botIds = [client.user.id, 'bot-id-2']; 
      const role = botIds.includes(msg.author.id) ? "assistant" : "user";
      const username = msg.author.username;
      const rawContent = role === "user" ? `<@${msg.author.id}> ${username} ${msg.content}` : msg.content; // AI will see user messages like this: <@userid> username message-content
  // It will also it's messages in the role "Assistant" instead of user so it can understand better.
      
      let content = rawContent.replace(/\s+/g, ' ');
      content = content.replace(/([.,!?]){1,}/g, '$1');
      conversationLog.push({ role: role, content: content, timestamp: msg.createdTimestamp });
    }

    // Display typing indicator to show the bot is processing
    
    let tokenCount = 0;
    tokenCount = initialConversationLog.reduce((acc, msg) => acc + msg.content.split(/\s+/).length, 0);

    for (let msg of reversedPrevMessages) {
      const botIds = ['1071499268818485289', 'bot-id-2'];
      const role = botIds.includes(msg.author.id) ? "assistant" : "user";
      const username = msg.author.username;
      const rawContent = role === "user" ? `<@${msg.author.id}> ${username} ${msg.content}` : msg.content;
      let content = rawContent.replace(/\s+/g, ' ');
      content = content.replace(/([.,!?])\1{1,}/g, '$1'); // Removing spacey, etc, when needed to avoid context lentgh API issues. 
      
      let messageTokens = content.split(/\s+/).length;

      // If the conversation exceeds the token limit, trim messages from the beginning
      if (tokenCount + messageTokens + TOKEN_BUFFER >= MAX_TOKENS) {
        let startIndex = 1; // Protect the first specific messages (system), set an amount of messages to protect and keep inside of your prompt, if none added, use 1.

        while (tokenCount + messageTokens + TOKEN_BUFFER >= MAX_TOKENS) {
          let removedEntry = false;

          for (let i = conversationLog.length - 1; i >= startIndex; i--) {
            if (conversationLog[i].role === 'user' || conversationLog[i].role === 'assistant') {
              tokenCount -= conversationLog[i].content.split(/\s+/).length;
              conversationLog.splice(i, 1);
              removedEntry = true;
              break;
            }
          }

          if (!removedEntry) {
            break;
          }
        }
      }

      conversationLog.push({ role: role, content: content, timestamp: msg.createdTimestamp });
      tokenCount += messageTokens;
    }

    // Pre-load messages from initialConversationLog if there's enough space available
    const initialMessagesPresent = conversationLog.slice(1).some(msg => msg.role === 'user' || msg.role === 'assistant');
    if (!initialMessagesPresent) {
      let initialMessagesTokenCount = 0;
      let additionalInitialMessages = [];
      for (let i = initialConversationLog.length - 1; i > 0; i--) {
        initialMessagesTokenCount += initialConversationLog[i].content.split(/\s+/).length;
        if (tokenCount + initialMessagesTokenCount + TOKEN_BUFFER < MAX_TOKENS) {
          additionalInitialMessages.unshift(initialConversationLog[i]);
        } else {
          break;
        }
      }
      conversationLog.splice(1, 0, ...additionalInitialMessages);
 } 

    // React with an clock alarm emoji
  const reaction = await message.react('⏰'); // Edit to custom or built in emoji if you'd like.
    
await message.channel.sendTyping();


    // OpenAI API call wrapped in a try-catch to handle potential errors
    // Remove the timestamp property from each message before sending to OpenAI
conversationLog = conversationLog.map(({ role, content }) => ({ role, content }));
          try {
      let result = await limiter.schedule(() => createChatCompletion(conversationLog));
      let sanitizedResponse = result.data.choices[0].message.content.replace(/@(everyone|here)/g, "@\\u200b$1");
      sanitizedResponse = sanitizedResponse.replace(/<@&\\d+>/g, "[role]");
      await message.reply(sanitizedResponse || "Sorry, I encountered an error processing your request. Try again.")
    // Remove the alarm reaction
  await reaction.users.remove(client.user.id);
    } catch (error) {
      customLog(`OPENAI ERR: ${error}`);
    customLog(`Error Response: ${JSON.stringify(error.response.data)}.`);
    }
  }
});

// Additional code for 24/7 uptime
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  customLog(`24/7 Uptime Server is running at http://localhost:${port}!`);
}); 

client.login(process.env.TOKEN) // login the bot