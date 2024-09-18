import { BotContext, SessionData } from '../types';
import { generatePortfolioChart } from '../services/chartService';
import { getProfile, createProfile } from '../services/moveService';
import { Markup } from 'telegraf';

export async function handlePortfolio(ctx: BotContext) {
  if (!ctx.session) {
    ctx.session = { messages: [], portfolio: [], awaitingPortfolioInput: false } as SessionData;
  }

  // Sample data for createProfile
  const sampleProfileData = {
    name: "John Doe",
    email: "john.doe@example.com",
    age: 30,
    investmentGoals: ["Retirement", "Growth"]
  };

  // Call createProfile service with sample data
  const createdProfile = await createProfile(sampleProfileData);
  console.log('Created profile:', createdProfile);

  // Call getProfile service and print to console
  const profile = await getProfile();
  console.log('User profile:', profile);

  const portfolioSummary = 'Here\'s a summary of your current portfolio:';
  ctx.session.messages.push({ type: 'bot', content: portfolioSummary });
  await ctx.reply(portfolioSummary);

  const chartBuffer = await generatePortfolioChart();
  ctx.session.messages.push({ type: 'chart', content: 'Portfolio Breakdown' });
  await ctx.replyWithPhoto({ source: chartBuffer });

  const followUp = 'Would you like to see market analysis or manage your investments?';
  ctx.session.messages.push({ type: 'bot', content: followUp });
  await ctx.reply(followUp);

  // if (ctx.session.portfolio.length === 0) {
  //   const addPortfolioMessage = 'You don\'t have any portfolio yet. Would you like to add one?';
  //   ctx.session.messages.push({ type: 'bot', content: addPortfolioMessage });
  //   await ctx.reply(addPortfolioMessage, Markup.inlineKeyboard([
  //     Markup.button.callback('Add Portfolio', 'add_portfolio')
  //   ]));
  // } else {
  //   const portfolioSummary = 'Here\'s a summary of your current portfolio:';
  //   ctx.session.messages.push({ type: 'bot', content: portfolioSummary });
  //   await ctx.reply(portfolioSummary);

  //   const chartBuffer = await generatePortfolioChart();
  //   ctx.session.messages.push({ type: 'chart', content: 'Portfolio Breakdown' });
  //   await ctx.replyWithPhoto({ source: chartBuffer });

  //   const followUp = 'Would you like to see market analysis or manage your investments?';
  //   ctx.session.messages.push({ type: 'bot', content: followUp });
  //   await ctx.reply(followUp, Markup.inlineKeyboard([
  //     Markup.button.callback('Market Analysis', 'market_analysis'),
  //     Markup.button.callback('Manage Investments', 'manage_investments'),
  //     Markup.button.callback('Add to Portfolio', 'add_portfolio')
  //   ]));
  // }
}

export function setupPortfolioHandlers(bot: any) {
  bot.action('add_portfolio', async (ctx: BotContext) => {
    await ctx.answerCbQuery();
    const message = 'Great! Let\'s add to your portfolio. Please enter the details of your investment in the following format:\n\nAsset,Amount,BuyPrice\n\nFor example: BTC,0.5,30000';
    ctx.session.messages.push({ type: 'bot', content: message });
    await ctx.reply(message);
    // You'll need to handle the user's response in another function
  });

  bot.action('market_analysis', async (ctx: BotContext) => {
    await ctx.answerCbQuery();
    // Implement market analysis logic here
  });

  bot.action('manage_investments', async (ctx: BotContext) => {
    await ctx.answerCbQuery();
    // Implement investment management logic here
  });
}

export async function addToPortfolio(ctx: BotContext, asset: string, amount: number, buyPrice: number): Promise<string> {
  // Add the new item to the portfolio
  ctx.session.portfolio.push({ asset, amount, buyPrice });
  
  // Calculate the total value of this investment
  const totalValue = amount * buyPrice;
  
  // Create a response message
  const responseMessage = `Added to portfolio:\nAsset: ${asset}\nAmount: ${amount}\nBuy Price: $${buyPrice}\nTotal Value: $${totalValue.toFixed(2)}`;
  
  // Add the response to the session messages
  ctx.session.messages.push({ type: 'bot', content: responseMessage });
  
  return responseMessage;
}

export async function viewPortfolio(ctx: BotContext): Promise<string> {
  if (ctx.session.portfolio.length === 0) {
    return "Your portfolio is empty. Use 'Add to Portfolio' to add investments.";
  }

  let portfolioMessage = "Your Portfolio:\n\n";
  let totalPortfolioValue = 0;

  for (const item of ctx.session.portfolio) {
    const itemValue = item.amount * item.buyPrice;
    totalPortfolioValue += itemValue;
    portfolioMessage += `Asset: ${item.asset}\nAmount: ${item.amount}\nBuy Price: $${item.buyPrice}\nValue: $${itemValue.toFixed(2)}\n\n`;
  }

  portfolioMessage += `Total Portfolio Value: $${totalPortfolioValue.toFixed(2)}`;
  return portfolioMessage;
}