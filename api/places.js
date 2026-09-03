// Vercel serverless function — proxies to Yelp Fusion API so the API key
// never reaches the browser. Frontend calls /api/places?lat=..&lng=..&category=..

const CATEGORY_QUERIES = {
  'deep-dish': { term: 'deep dish pizza', categories: 'pizza' },
  'tavern': { term: 'tavern style thin crust pizza', categories: 'pizza' },
  'hot-dog': { term: 'chicago style hot dog', categories: 'hotdogs' },
  'italian-beef': { term: 'italian beef sandwich', categories: 'sandwiches' },
  'tacos': { term: 'authentic street tacos taqueria', categories: 'mexican' },
  'food-truck': { term: 'food truck', categories: 'foodtrucks' },
};

export default async function handler(req, res) {
  const { lat, lng, category } = req.query;

  if (!lat || !lng) {
    res.status(400).json({ error: 'lat and lng are required' });
    return;
  }

  const query = CATEGORY_QUERIES[category];
  if (!query) {
    res.status(400).json({ error: 'unknown category' });
    return;
  }

  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Yelp API key not configured' });
    return;
  }

  const params = new URLSearchParams({
    term: query.term,
    categories: query.categories,
    latitude: String(lat),
    longitude: String(lng),
    radius: '40000',
    limit: '12',
    sort_by: 'best_match',
  });

  try {
    const yelpRes = await fetch(`https://api.yelp.com/v3/businesses/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!yelpRes.ok) {
      res.status(200).json({ results: [] });
      return;
    }
    const data = await yelpRes.json();
    const results = (data.businesses || [])
      .filter((b) => !b.is_closed && b.coordinates && b.coordinates.latitude != null)
      .map((b) => ({
        id: `yelp-${b.id}`,
        name: b.name,
        lat: b.coordinates.latitude,
        lng: b.coordinates.longitude,
        address: [b.location && b.location.address1, b.location && b.location.city, b.location && b.location.state].filter(Boolean).join(', '),
        rating: b.rating,
        reviewCount: b.review_count,
        yelpUrl: b.url,
      }));

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ results });
  } catch (e) {
    res.status(200).json({ results: [] });
  }
}
