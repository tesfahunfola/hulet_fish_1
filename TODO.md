# Carbon-Offset and Eco Score Feature Implementation

## Backend Implementation
- [x] Create EmissionFactor model (transport types, emission factors)
- [x] Update Tour model to include emission data (activity CO2, waste impact)
- [x] Create EcoScore model (user trip scores, calculations)
- [x] Create CarbonOffset model (offset options, pricing)
- [x] Update Booking model to track emissions and offsets
- [x] Create emission calculation utilities
- [x] Create eco score calculation algorithm
- [x] Create APIs:
  - [x] POST /api/emissions/calculate (calculate trip emissions)
  - [x] GET /api/eco-score/:userId (get user eco score)
  - [x] POST /api/carbon-offset/purchase (purchase offset)
  - [x] GET /api/dashboard/user (user dashboard data)
  - [x] GET /api/dashboard/host (host dashboard data)
  - [x] GET /api/dashboard/admin (admin dashboard data)

## Frontend Implementation
- [x] Update lib/api.ts to add emissions API endpoints
- [x] Create EcoScore page component
- [x] Create CarbonOffset page component
- [x] Update Navigation.tsx to add "Eco Score" link
- [x] Update App.tsx to add routes for new pages
- [x] Update TODO.md to mark frontend tasks as completed

## Testing and Verification
- [x] Test backend APIs with Postman
- [x] Test frontend pages and navigation
- [x] Test emission calculations with sample data
- [x] Test eco score algorithm
- [x] Verify dashboards display correct data
- [x] Ensure no breaking changes to existing functionality
- [x] Test on different screen sizes (responsive design)

## Issues Fixed
- [x] Fixed eco-scores not updating for new bookings (post-save middleware working)
- [x] Fixed carbon offset section not showing bookings (frontend filtering logic updated)
- [x] Fixed carbon offset purchase API to update corresponding eco scores
- [x] Verified carbon offset purchase simulation updates booking ecoData and project totals

## Final Steps
- [ ] Code review and cleanup
- [ ] Update documentation
- [ ] Commit changes locally
- [ ] Test full application locally
- [ ] Push to GitHub after verification
