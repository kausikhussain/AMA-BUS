# AmaRide API

Base URL: `http://localhost:4000`

## Auth

- `POST /auth/register`
  - body: `{ "name": "...", "email": "...", "password": "...", "phone": "..." }`
- `POST /auth/login`
  - body: `{ "email": "...", "password": "..." }`
- `GET /auth/me`
  - auth: bearer token

## Passenger

- `GET /routes`
- `GET /routes/live`
- `GET /routes/planner?originLat=20.27&originLng=85.84&destinationLat=20.35&destinationLng=85.81`
- `GET /stops`
- `GET /stops/nearby?latitude=20.27&longitude=85.84&radiusMeters=500`
- `POST /payments/intent`
  - auth: bearer token
  - body: `{ "routeId": "route-airport-kiit", "passengerCount": 2 }`
- `POST /tickets/buy`
  - auth: passenger/admin token
  - body: `{ "routeId": "route-airport-kiit", "passengerCount": 1 }`
- `GET /tickets/history`
  - auth: bearer token
- `GET /notifications`
  - auth: bearer token
- `PATCH /notifications/:notificationId/read`
  - auth: bearer token

## Driver

- `GET /driver/currentTrip`
  - auth: driver/admin token
- `POST /driver/startTrip`
  - auth: driver/admin token
  - body: `{ "routeId": "route-airport-kiit" }`
- `POST /driver/updateLocation`
  - auth: driver/admin token
  - body: `{ "tripId": "trip-live-1", "latitude": 20.29, "longitude": 85.83, "occupancy": 24 }`
- `POST /driver/tripStatus`
  - auth: driver/admin token
  - body: `{ "tripId": "trip-live-1", "status": "PAUSED" }`

## Admin

- `GET /admin/stats`
- `GET /admin/routes`
- `POST /admin/routes`
- `PUT /admin/routes/:routeId`
- `DELETE /admin/routes/:routeId`
- `GET /admin/stops`
- `POST /admin/stops`
- `PUT /admin/stops/:stopId`
- `DELETE /admin/stops/:stopId`
- `GET /admin/drivers`
- `POST /admin/drivers`
- `GET /admin/live-buses`
- `GET /admin/logs`

All admin endpoints require an admin bearer token.

## Socket Events

- `passenger:subscribe_route`
  - payload: `{ "routeId": "route-airport-kiit" }`
- `driver:location_update`
  - payload: `{ "tripId": "trip-live-1", "latitude": 20.29, "longitude": 85.83, "occupancy": 25 }`
- `server:broadcast_bus_location`
  - emitted with live bus payload for subscribed routes and admin room
- `notification:new`
  - emitted when backend creates in-app alerts
