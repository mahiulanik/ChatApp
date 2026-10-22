# MessageX

> A full-stack real-time messaging application featuring Clerk authentication, private one-to-one conversations, Socket.IO live updates, MongoDB message persistence, Cloudinary media uploads, online presence, typing indicators, unread counts, and a responsive React interface.

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Frontend Routes](#frontend-routes)
- [REST API Reference](#rest-api-reference)
- [Socket.IO Events](#socketio-events)
- [Database Schema](#database-schema)
- [Authentication and Authorization](#authentication-and-authorization)
- [Messaging and Media](#messaging-and-media)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Docker and Deployment](#docker-and-deployment)
- [Implementation Notes and Limitations](#implementation-notes-and-limitations)
- [Author](#author)

## Overview

MessageX is a full-stack, one-to-one chat application built with a React/Vite frontend and a Node.js/Express backend. Clerk manages user authentication, MongoDB stores users and messages, Socket.IO enables real-time communication, and Cloudinary stores uploaded chat media.

The application supports both REST-based history retrieval and live socket-driven updates. Its frontend uses contexts for chat state and appearance preferences, while the backend separates routes, controllers, authentication middleware, Mongoose models, webhook processing, and external-service configuration.

In the supplied codebase, the Express backend can serve the compiled frontend from `public/`, allowing a single-container deployment with the included multi-stage Dockerfile.

## Core Features

### Messaging

- Authenticated one-to-one text messaging
- Real-time incoming messages through Socket.IO
- Conversation history retrieved from MongoDB
- Sidebar user discovery and recent conversations
- Online user presence indicators
- Typing and stop-typing indicators
- Unread message counts and read-state updates
- Delete a conversation **from the current user's view** without globally deleting the underlying messages
- Chat media upload through Cloudinary
- Responsive chat interface with message bubbles, conversation header, message input, and empty-state views

### Account and User Experience

- Clerk-managed sign-in and sign-up experience
- Backend verification of Clerk-authenticated API requests
- Clerk webhook synchronization of user profiles
- User avatar and profile information
- Light/dark appearance and accent customization through theme context
- Emoji picker and optional chat sound feedback
- Loading and retry states when the backend is unavailable

## Architecture

```text
                   Browser / MessageX User
                             |
                   React 19 + Vite 7
                   Tailwind CSS 4
                             |
               Clerk React / Context Providers
                        |          |
                    Axios API   Socket.IO Client
                        |          |
                        v          v
                   Express 5 + HTTP Server
                        |          |
                  REST routes   Socket.IO Server
                        |          |
                  Controllers   Authenticated events
                        |          |
                 Mongoose / MongoDB
                        |
                  Users + Messages

External services:
  Clerk       -> Authentication and user lifecycle webhooks
  Cloudinary  -> Uploaded chat media
```

**Backend conventions:** `routes/` defines HTTP endpoints, `controllers/` implements request handlers, `middlewares/` handles authorization and upload validation, `models/` defines Mongoose schemas, `config/` configures MongoDB, Cloudinary and Socket.IO, and `webhooks/` processes Clerk user events.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite 7, JavaScript (JSX) |
| UI | Tailwind CSS 4, custom React components |
| Routing | React Router 8 (`react-router`) |
| HTTP | Axios |
| State | React Context API (`ChatContext`, `ThemeContext`) |
| Backend | Node.js, Express 5 (ES modules) |
| Database | MongoDB with Mongoose 9 |
| Authentication | Clerk (`@clerk/react`, `@clerk/express`, `@clerk/backend`) |
| Real-time | Socket.IO 4 and Socket.IO Client 4 |
| Media | Cloudinary, Multer (memory storage) |
| Security | Helmet, HPP, CORS, authenticated routes and sockets |
| Deployment | Docker multi-stage build; Express static frontend serving |

## Project Structure

```text
MessageX/
├── Dockerfile                   # Multi-stage frontend build and backend runtime
├── .dockerignore
├── .gitignore
├── backend/
│   ├── app.js                   # Express middleware, API mounts, SPA serving
│   ├── server.js                # MongoDB connection, HTTP and Socket.IO startup
│   ├── config/
│   │   ├── cloudinary.js        # Cloudinary upload helpers
│   │   ├── db.js                # MongoDB connection
│   │   └── socket.js            # Authenticated sockets, presence, typing
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── message.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js   # Clerk identity and local profile sync
│   │   └── multer.js            # Upload limits and MIME allowlist
│   ├── models/
│   │   ├── message.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── auth.route.js
│   │   └── message.route.js
│   ├── webhooks/
│   │   └── clerk.webhook.js
│   ├── package.json
│   └── package-lock.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/         # Chat UI, sidebar, messages, theme, emoji picker
    │   ├── context/
    │   │   ├── ChatContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── lib/                # Axios client, Clerk appearance, constants, utilities
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   └── Landing.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── vite.config.js
    ├── package.json
    └── package-lock.json
```

## Frontend Routes

The following routes are declared in `frontend/src/App.jsx`.

| Path | Purpose | Access |
| --- | --- | --- |
| `/` | Landing and Clerk authentication entry | Signed-out users; signed-in users redirect to `/home` |
| `/home` | Main messaging interface | Authenticated users |
| `*` | Fallback redirect to `/` | Public redirect |

The `RequireAuth` and `OnlyWhenSignedOut` components implement client-side navigation guards. Backend authorization is enforced separately.

## REST API Reference

All paths below are registered by the supplied backend. Protected endpoints use Clerk-based `authMiddleware`.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Server status and process uptime |
| `GET` | `/api/auth/check` | Authenticated | Retrieve the current local user profile |
| `GET` | `/api/message/users` | Authenticated | List other users for the sidebar |
| `GET` | `/api/message/conversations` | Authenticated | List recent conversations and unread counts |
| `GET` | `/api/message/:id` | Authenticated | Retrieve message history with another user |
| `POST` | `/api/message/send/:id` | Authenticated | Send text and/or multipart `media` to a recipient |
| `PUT` | `/api/message/read/:id` | Authenticated | Mark messages from a user as read |
| `DELETE` | `/api/message/conversation/:id` | Authenticated | Hide a conversation for the current user |
| `POST` | `/api/webhooks/clerk` | Clerk signature verified | Receive Clerk user lifecycle events |

**Send-message body:** text is read from `req.body.text`; an optional uploaded file uses the multipart field name `media`. A message must contain nonempty text or an uploaded file. Recipient IDs are validated as MongoDB ObjectIds.

**Webhook events:** the backend handles `user.created`, `user.updated`, and `user.deleted`. The webhook endpoint requires the raw JSON request body for signature verification.

This is a route inventory, not a complete OpenAPI specification. Check controllers for response shapes and error handling.

## Socket.IO Events

The backend authenticates the Socket.IO handshake using a Clerk token provided in `socket.handshake.auth.token`. Authenticated sockets join a room named `user:<mongo-user-id>`.

| Event | Direction | Purpose |
| --- | --- | --- |
| `getOnlineUsers` | Server → clients | Broadcast MongoDB user IDs currently connected |
| `newMessage` | Server → recipient room | Deliver a newly persisted message |
| `typing` | Client → server → recipient room | Notify the recipient that the sender is typing |
| `stopTyping` | Client → server → recipient room | Clear the typing indicator |

The frontend also listens for `getOnlineUsers`, `newMessage`, `typing`, and `stopTyping`. Typing indicators automatically expire after a short idle interval on the client.

Socket authorization uses Clerk token verification and the corresponding local MongoDB user. The server keeps online socket IDs in an in-memory map; presence is therefore local to one server process.

## Database Schema

MessageX defines two Mongoose models under `backend/models/`.

### `users`

| Field | Type / behavior |
| --- | --- |
| `clerkId` | String, required, unique |
| `email` | String, required, unique |
| `fullName` | String, required |
| `profilePic` | String, defaults to empty |
| `createdAt`, `updatedAt` | Mongoose timestamps |

### `messages`

| Field | Type / behavior |
| --- | --- |
| `senderId` | Required ObjectId reference to `User` |
| `receiverId` | Required ObjectId reference to `User` |
| `text` | Trimmed string, default empty |
| `media.url` | Cloudinary media URL |
| `media.publicId` | Cloudinary asset public ID |
| `media.resourceType` | `image` or `video` |
| `media.mimeType` | Uploaded file MIME type |
| `readAt` | Date, defaults to `null` |
| `deletedFor` | Array of user ObjectIds for per-user conversation hiding |
| `createdAt`, `updatedAt` | Mongoose timestamps |

Compound indexes are declared on `(senderId, receiverId, createdAt)` and `(receiverId, senderId, createdAt)`. Production `autoIndex` is disabled in `config/db.js`, so index deployment should be managed explicitly.

## Authentication and Authorization

1. Clerk handles browser-side sign-in and session management.
2. The frontend obtains a Clerk token and sends it in the `Authorization: Bearer <token>` header for protected REST requests.
3. Express Clerk middleware and the project's `authMiddleware` identify the signed-in user.
4. If a local MongoDB profile is missing, the middleware fetches the Clerk user and upserts a local profile.
5. Clerk webhook events keep profile records synchronized and process user deletion.
6. Socket.IO independently verifies a Clerk token during connection establishment.

The frontend guards improve navigation behavior; protected API endpoints and Socket.IO token verification form the backend security boundaries. Do not expose Clerk secret keys or webhook signing secrets in frontend variables.

## Messaging and Media

- Message history is stored in MongoDB and retrieved in ascending creation-time order.
- A sent message is persisted before `newMessage` is emitted to the recipient's socket room.
- Unread counts are derived from incoming messages whose `readAt` remains `null`.
- The read endpoint updates unread messages addressed to the current user.
- Conversation deletion uses `deletedFor` to hide messages from the requesting user rather than deleting both users' history.
- Media uploads use Multer in-memory storage, a **10 MB** single-file limit, and an allowlist of image, video, and audio MIME types.
- Cloudinary upload logic selects `image` for image MIME types and `video` for other accepted types; verify audio upload compatibility and playback before advertising full audio-message support.
- Cloudinary stores uploaded media; MongoDB stores the returned URL, public ID, resource type, and MIME type.

## Environment Variables

Create `backend/.env` manually and copy `frontend/.env.example` to `frontend/.env`. The supplied archive contains a frontend example but **no backend `.env.example`**.

### Backend (`backend/.env`)

```dotenv
# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGO_URI=mongodb+srv://USER:PASSWORD@HOST/DATABASE

# Clerk server credentials
CLERK_SECRET_KEY=sk_test_replace_me
CLERK_PUBLISHABLE_KEY=pk_test_replace_me
CLERK_WEBHOOK_SIGNING_SECRET=whsec_replace_me

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

The variables above cover the application configuration and Clerk integration. Consult the Clerk SDK documentation for any additional instance-specific settings.

### Frontend (`frontend/.env`)

```dotenv
VITE_CLERK_PUBLISHABLE_KEY=pk_test_replace_me

# Optional in local development: empty values use the Vite proxy / current origin
VITE_API_URL=
VITE_SOCKET_URL=
```

The supplied `frontend/.env.example` uses explicit `http://localhost:4000` values for API and Socket.IO. Both approaches can work locally; the empty-value setup uses the configured Vite proxy.

Only `VITE_` variables are exposed to browser code. Never place a Clerk secret key, MongoDB URI, Cloudinary API secret, or webhook signing secret in frontend variables.

## Local Development

### Prerequisites

- Node.js and npm (Node 22 is used in the included Dockerfile)
- A reachable MongoDB instance
- Clerk application credentials and a configured webhook when testing user synchronization
- Cloudinary credentials to test file uploads

### 1. Get the source

Download or clone the MessageX repository and open its root directory.

### 2. Run the backend

```bash
cd backend
npm ci
```

Create `backend/.env` with the backend variables above, then:

```bash
npm start
```

The default backend URL is `http://localhost:4000`. The health endpoint is `http://localhost:4000/health`.

### 3. Run the frontend

Open a separate terminal at the project root:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

On Windows Command Prompt, use `copy .env.example .env` instead of `cp`. Update the Clerk publishable key in the frontend `.env` file.

Vite normally starts at `http://localhost:5173`. The dev proxy forwards `/api` and `/socket.io` traffic to `http://localhost:4000`.

### 4. Build and lint

```bash
cd frontend
npm run lint
npm run build
npm run preview
```

The backend has an `npm start` script. Its `npm test` script is a placeholder, not an automated test suite.

### 5. Configure Clerk webhooks

In your Clerk application, configure a webhook destination at:

```text
https://YOUR_BACKEND_DOMAIN/api/webhooks/clerk
```

Subscribe to `user.created`, `user.updated`, and `user.deleted`, and configure the matching `CLERK_WEBHOOK_SIGNING_SECRET`. For local webhook testing, expose the local server through a suitable secure tunnel.

## Docker and Deployment

The repository contains a multi-stage `Dockerfile` that:

1. Builds the Vite frontend using Node 22.
2. Installs production backend dependencies.
3. Copies `frontend/dist` into the backend runtime's `public/` directory.
4. Starts `node server.js` as the non-root `node` user on port 4000.

Example build and run:

```bash
docker build \
  --build-arg VITE_CLERK_PUBLISHABLE_KEY=pk_live_replace_me \
  -t messagex .

docker run --rm -p 4000:4000 --env-file backend/.env messagex
```

**Production notes:**

- Use a Clerk production instance and matching production keys/domain configuration.
- Set `FRONTEND_URL` to the exact deployed frontend origin. It is used in both Express CORS and Socket.IO authorization configuration.
- Provide MongoDB, Cloudinary, and Clerk secrets as runtime environment variables.
- The backend serves the built React application for non-API routes when `public/` exists.
- Keep `VITE_API_URL` empty for the included same-origin monolith build; the frontend's Socket.IO URL also defaults to the current origin.
- Ensure the hosting platform supports persistent WebSocket connections.
- Use HTTPS and confirm that reverse proxies support Socket.IO WebSocket upgrades.
- If frontend and backend are deployed separately, set the frontend API/socket URLs and the backend allowed origin appropriately.
- Check `GET /health` for basic uptime monitoring; it does not check MongoDB or third-party service health.

## Implementation Notes and Limitations

This README was prepared from the uploaded MessageX source archive. It documents implemented code paths but is **not** a completed end-to-end runtime or penetration test.

Before production use, review the following:

- **Media type handling:** the upload allowlist accepts audio files, but the Cloudinary helper maps non-image uploads to `video` and the Mongoose `resourceType` enum only permits `image` or `video`. Test audio formats end-to-end.
- **Media lifecycle:** deleting a conversation only changes MongoDB visibility. It does not remove associated Cloudinary assets. Define retention and cleanup policies.
- **Delete-for-me behavior:** previously hidden messages are not automatically restored by the send-message handler; confirm that this matches intended product behavior.
- **Socket scale:** online presence uses process-local memory. Multiple server replicas would require shared presence state and an appropriate Socket.IO adapter.
- **Database growth:** message history and user lists have no explicit pagination in the inspected controllers. Add pagination and query limits for larger deployments.
- **Production indexes:** `autoIndex` is disabled in production; apply declared indexes through a managed database operation.
- **Security:** review request rate limits, message length limits, upload content validation, error handling, Clerk authorized parties, and webhook retries/idempotency.
- **CSP:** Helmet is enabled but its content security policy is disabled. Configure a CSP compatible with Clerk and media integrations rather than assuming CSP protection is active.
- **Tests:** no automated backend test suite is configured; add API, Socket.IO, authorization, and upload integration tests.

## Author

**Mahiul Hasan Anik**  
GitHub: [@mahiulanik](https://github.com/mahiulanik)
