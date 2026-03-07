// ShipStation integration uses the "Custom Store" approach.
// Orders are exported via /api/shipstation?action=export (polled by ShipStation)
// Tracking info is received via /api/shipstation?action=shipnotify (posted by ShipStation)
// No direct API calls needed — ShipStation handles rates, labels, and shipping.
