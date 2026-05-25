const GroqModule = require('groq-sdk');
const Groq = GroqModule.default || GroqModule;
const Car = require('../models/Car');

const chat = async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes('your_') || apiKey.length < 20) {
    return res.status(500).json({ success: false, message: 'AI API key not configured — add GROQ_API_KEY in backend .env' });
  }

  try {
    const { messages = [], context = {} } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'messages array required' });
    }

    // Fetch available cars for context (keep it small — just enough for recommendations)
    const cars = await Car.find({ status: 'available' })
      .select('make model year price fuel transmission type mileage listingType seller')
      .limit(30)
      .lean();

    const carLines = cars.map(c =>
      `• ${c.year} ${c.make} ${c.model} — PKR ${Number(c.price).toLocaleString()}, ${c.fuel}, ${c.transmission}, ${c.type}${c.mileage ? `, ${Number(c.mileage).toLocaleString()} km` : ''}${c.listingType === 'used' ? ' [Used]' : ' [Dealer]'}${c.seller?.city ? `, ${c.seller.city}` : ''}`
    ).join('\n');

    const systemPrompt = `You are CarMart AI, the intelligent assistant of Pakistan's #1 car marketplace. You run on Claude, made by Anthropic.

## About CarMart
CarMart is a Pakistan-based online marketplace where:
- Verified dealers list new & used cars
- Private sellers can list their used cars
- Buyers can browse, compare, add to cart, and contact sellers via WhatsApp
- Features: EMI calculator, wishlist, compare tool, reviews, secure checkout
- Cities covered: Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar

## Live Car Catalog (${cars.length} available listings)
${carLines || 'No listings currently available'}

## How You Help
- **Find the right car**: Ask about budget, family size, fuel preference, city
- **Price advice**: Evaluate if a listed price is fair based on year/make/model/mileage
- **Buying guidance**: Walk through the CarMart purchase process, EMI calculations
- **Selling tips**: How to price, what info to include, how to attract buyers
- **Car comparisons**: Compare two models side-by-side on specs, price, reliability
- **Pakistan market knowledge**: typical prices, popular models (Suzuki, Toyota, Honda, KIA), insurance, registration, token tax

## Response Rules
- Be friendly, concise, and helpful — max 150 words unless a detailed breakdown is needed
- Mix Urdu/English naturally when it fits (Pakistan audience speaks this way)
- Cite specific cars from the catalog with their prices when recommending
- Give honest, balanced opinions — don't oversell
- For EMI: typical Pakistan bank rates are 18–22% p.a. for 3–5 years
- Never make up cars that aren't in the catalog — say "check the shop page" for other options
${context.page ? `\n## Current Page\nUser is browsing: ${context.page}` : ''}${context.car ? `\n## Car Being Viewed\n${context.car}` : ''}${context.cartCount ? `\n## Cart\nUser has ${context.cartCount} car(s) in cart` : ''}`;

    // Ensure messages alternate user/assistant and start with user
    const apiMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');

    const client = new Groq({ apiKey });

    const response = await client.chat.completions.create({
      model:      'llama-3.1-8b-instant',
      max_tokens: 500,
      messages:   [{ role: 'system', content: systemPrompt }, ...apiMessages],
    });

    res.json({ success: true, reply: response.choices[0].message.content });
  } catch (err) {
    console.error('AI error:', err.status, err.message);
    if (err.status === 401 || err.message?.toLowerCase().includes('auth')) {
      return res.status(500).json({ success: false, message: 'AI API key not configured' });
    }
    res.status(500).json({ success: false, message: 'AI service temporarily unavailable: ' + err.message });
  }
};

module.exports = { chat };
