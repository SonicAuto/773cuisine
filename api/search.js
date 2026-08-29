// /api/search — proxies Yelp Fusion Business Search so the API key never
// reaches the browser, and so we sidestep Yelp's CORS block on direct
// client-side calls.

const CHICAGO_TERMS = {
  all: 'chicago style food',
  deep_dish: 'deep dish pizza',
  tavern: 'tavern style pizza',
  italian_beef: 'italian beef',
  chicago_dog: 'chicago style hot dog',
  gyro: 'chicago gyro',
};

module.exports = async (req, res) => {
  const apiKey = process.env.YELP_API_KEY;

  if (!apiKey) {
    res.status(500).json({
      error: 'YELP_API_KEY is not set. Add it in your Vercel project\'s Environment Variables.',
    });
    return;
  }

  const { location, style = 'all' } = req.query;

  if (!location || !location.trim()) {
    res.status(400).json({ error: 'Missing "location" — pass a city, state, or ZIP.' });
    return;
  }

  const term = CHICAGO_TERMS[style] || CHICAGO_TERMS.all;

  const params = new URLSearchParams({
    location: location.trim(),
    term,
    limit: '20',
    sort_by: 'best_match',
  });

  try {
    const yelpRes = await fetch(`https://api.yelp.com/v3/businesses/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const data = await yelpRes.json();

    if (!yelpRes.ok) {
      res.status(yelpRes.status).json({
        error: data.error?.description || 'Yelp API request failed.',
      });
      return;
    }

    const businesses = (data.businesses || []).map((b) => ({
      id: b.id,
      name: b.name,
      rating: b.rating,
      review_count: b.review_count,
      price: b.price || null,
      image_url: b.image_url,
      url: b.url,
      categories: (b.categories || []).map((c) => c.title),
      address: (b.location?.display_address || []).join(', '),
      is_closed: b.is_closed,
    }));

    res.status(200).json({ businesses, term });
  } catch (err) {
    res.status(502).json({ error: 'Could not reach Yelp right now. Try again shortly.' });
  }
};
