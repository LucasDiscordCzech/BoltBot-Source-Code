# BoltBot⚡ AI Discord Bot

![OpenAI](https://media.discordapp.net/attachments/1078333707779330138/1129517435800801300/63ef9e660270b1001984d9ce.png)

## Overview

BoltBot⚡ is an interactive Discord bot built on the **OpenAI GPT-4 model**. It's designed to provide users with a conversational partner, capable of answering questions, providing coding assistance, and engaging in casual chat.

## Prerequisites
### Before you host your own BoltBot⚡, ensure you have:

- Node.js (v14+)
- Discord.js (v14+ library) 
- A paid [OpenAI API](https://openai.com/api) account with API key access.

## Source Code Access
- Host & Fork on [Replit](https://replit.com/@bonnieee123456/BoltBot-Source-Code?s). 
- Contribute or fork from the [GitHub Repository](https://github.com/LucasDiscordCzech/BoltBot-Source-Code).

## Features:

1. **Server-side Conversation Handling**: BoltBot⚡ remembers recent messages in a conversation, providing context to its responses. This results in more coherent and contextual replies.

2. **Handling Context Length**: To adhere to **__OpenAI's token limits and context lentgh issues__**, the bot manages the length of conversations. If a conversation exceeds the token limit, older messages are pruned to fit within the constraints.

3. **Rate Limit Handling**: Using the `Bottleneck` library, BoltBot⚡ efficiently manages OpenAI API calls to avoid hitting rate limits.

4. **Sanitized Responses**: The bot's responses are sanitized to prevent unwanted content like mentions, ensuring server safety.

5. **Reaction & Typing**: While the bot is writing an request, it will react with an **'⏰'** emoji and start typing to show that it's doing the request from the **__OpenAI API__**. You can customize the reaction in the code at line 170.
  
6. **Intelligent Environment**: The AI is fed alot of data, such as the user's roles, where it's talking such as the channel, server, and so on. And this is all in real-time, no replacing. This will let the AI be more intelligent and advanced as it know's it's environment. 

7. **24/7 Uptime on Replit**: Using a simple express server and regular pings, the bot can achieve 24/7 uptime when hosted on Replit.

## Customization
### Modifying the Prompt
The bot's behavior and personality are determined by the prompt given to the OpenAI model. You can modify the `buildPrompt` function located in `/path/Prompt.js` to change the bot's behavior.

For example, you can modify the bot's introduction, tone, or any other instructions. This allows BoltBot⚡ to have a unique personality tailored to your server's needs.


## Setup Instructions:

### Replit:

1. Create a new Replit account or log in to your existing account.
2. Click on the `+ New Repl` button.
3. Select `Node.js` as the language.
4. Clone the BoltBot⚡ repository or use the [Replit Template](https://replit.com/@bonnieee123456/BoltBot-Source-Code).
5. Install the required packages using `npm install`.
6. Set up environment variables (`OPENAI_API_KEY` and `TOKEN`) in the Secrets tab, and add your **BOT TOKEN** and **OpenAI API KEY**.
7. Click on the `Run` button to start the bot.
8. For 24/7 uptime, set up the express server and use services like [Uptime Robot](https://uptimerobot.com/) to ping your Replit server link regularly.

### GitHub:

1. Fork the [BoltBot⚡](https://github.com/LucasDiscordCzech/BoltBot-Source-Code) repository to your GitHub account.
2. Clone the forked repository to your local machine.
3. Navigate to the project directory and run `npm install` to install the required packages.
4. Set up environment variables or use a `.env` file to store your `OPENAI_API_KEY` and `TOKEN` add add your **BOT TOKEN** any **OpenAI API Key**.
5. Use `node index.js` to start the bot.
6. To push updates, commit your changes and push them to your GitHub repository. If you want to contribute to the main project, open a pull request.

## BoltBot⚡ Developer's:
[![Discord Presence](https://lanyard.cnrad.dev/api/812267733860745227)](https://discord.com/users/812267733860745227)
[![Discord Presence](https://lanyard.cnrad.dev/api/534020187192819722)](https://discord.com/users/534020187192819722)

## Feedback & Support

- 📌 Raise an issue on our [Github Page](https://github.com/LucasDiscordCzech/BoltBot-Source-Code/issues).

-  📬 Reach out to our developers on Discord: **@czch** and **@protonop** for questions and support.

## License
This project is open-sourced under the MIT License. [View License](https://github.com/LucasDiscordCzech/BoltBot-Source-Code/blob/main/LICENSE.md)