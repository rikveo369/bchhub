# Technical Specification: Bitcoin Cash Content Platform

## 1. System Architecture and Technology Stack

This section outlines the overall system architecture and the technology stack chosen for the frontend, backend, and database components.

### 1.1. Architecture

A **Monolithic Architecture** will be employed for this project. This approach is chosen for its simplicity in development, testing, and deployment, which is well-suited for the initial scope of this application. It allows for rapid development as all components reside in a single codebase.

### 1.2. Technology Stack

The technology stack is selected to ensure performance, scalability, and a cohesive development experience.

*   **Frontend:**
    *   **Framework:** **Next.js (React)** - Chosen for its capabilities in Server-Side Rendering (SSR) and Static Site Generation (SSG), which are crucial for SEO and initial page load performance.
    *   **Styling:** **Tailwind CSS** - A utility-first CSS framework that allows for rapid UI development and easy customization.
    *   **State Management:** **React Context API / SWR** - For managing global state and fetching data from the backend API efficiently.

*   **Backend:**
    *   **Framework:** **Node.js with Express.js** - A fast and lightweight framework ideal for building RESTful APIs.
    *   **Language:** **TypeScript** - To enforce type safety, improve code quality, and make the codebase more maintainable.
    *   **Authentication:** **JWT (JSON Web Tokens)** - For securing the admin dashboard endpoints.

*   **Database:**
    *   **Database System:** **PostgreSQL** - A powerful and reliable open-source relational database. It's well-suited for the structured data of this application (users, channels, videos, blog posts) and offers excellent performance and scalability.
    *   **ORM:** **Prisma** - A modern database toolkit for TypeScript and Node.js that simplifies database access with auto-completion, type-safety, and an intuitive data model.

*   **External Services:**
    *   **YouTube Data API v3:** To fetch channel and video data.

## 2. Database Schema

The following schema is defined using Prisma-like syntax. It outlines the tables, fields, and relationships for the application's data.

### 2.1. User Model

Stores administrator credentials.

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     BlogPost[]
}
```

### 2.2. YouTube Channel Model

Stores the YouTube channels to be monitored for new content.

```prisma
model Channel {
  id               Int      @id @default(autoincrement())
  youtubeChannelId String   @unique
  name             String
  customUrl        String?
  thumbnailUrl     String
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  videos           Video[]
}
```

### 2.3. Video Model

Stores video data fetched from the YouTube channels.

```prisma
model Video {
  id             Int      @id @default(autoincrement())
  youtubeVideoId String   @unique
  title          String
  description    String?  @db.Text
  publishedAt    DateTime
  thumbnailUrl   String
  channelId      Int
  channel        Channel  @relation(fields: [channelId], references: [id])
  isBchRelated   Boolean  @default(false) // Flagged by the filtering system
  isFeatured     Boolean  @default(false) // Manually curated by an admin
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

### 2.4. Blog Post Model

Stores articles for the blog.

```prisma
model BlogPost {
  id          Int      @id @default(autoincrement())
  title       String
  slug        String   @unique
  content     String   @db.Text
  authorId    Int
  author      User     @relation(fields: [authorId], references: [id])
  isPublished Boolean  @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 2.5. Featured Content Model

A simple model to explicitly manage the list of featured items (videos or blog posts). This provides more control over ordering than a simple boolean flag.

```prisma
model FeaturedContent {
  id          Int      @id @default(autoincrement())
  videoId     Int?     @unique
  blogPostId  Int?     @unique
  video       Video?   @relation(fields: [videoId], references: [id])
  blogPost    BlogPost?@relation(fields: [blogPostId], references: [id])
  order       Int      // For manual sorting of featured content
  createdAt   DateTime @default(now())

  @@unique([videoId, blogPostId]) // Ensure an item is not featured twice
}
```

## 3. Backend API Endpoints

The following RESTful API endpoints will be created to support the frontend application. `(auth required)` indicates that the endpoint is protected and can only be accessed by authenticated administrators.

### 3.1. Auth Endpoints

*   `POST /api/auth/login`
    *   **Description:** Authenticates an admin user and returns a JWT.
    *   **Request Body:** `{ "email": "...", "password": "..." }`
    *   **Response:** `{ "token": "..." }`

### 3.2. Channel Endpoints (Admin Only)

*   `POST /api/channels` `(auth required)`
    *   **Description:** Adds a new YouTube channel by its channel ID. The backend will fetch channel details from the YouTube API.
    *   **Request Body:** `{ "youtubeChannelId": "..." }`
*   `GET /api/channels` `(auth required)`
    *   **Description:** Retrieves a list of all saved YouTube channels.
*   `DELETE /api/channels/:id` `(auth required)`
    *   **Description:** Removes a YouTube channel from the database.

### 3.3. Video Endpoints

*   `GET /api/videos`
    *   **Description:** Retrieves a paginated list of all videos that have been flagged as `isBchRelated`.
    *   **Query Params:** `?page=1&limit=20`
*   `GET /api/videos/featured`
    *   **Description:** Retrieves the list of manually selected featured videos.
*   `PUT /api/videos/:id/feature` `(auth required)`
    *   **Description:** Toggles the `isFeatured` status of a video.

### 3.4. Blog Post Endpoints

*   `GET /api/blog`
    *   **Description:** Retrieves a paginated list of all published blog posts.
*   `GET /api/blog/:slug`
    *   **Description:** Retrieves a single blog post by its slug.
*   `POST /api/blog` `(auth required)`
    *   **Description:** Creates a new blog post.
*   `PUT /api/blog/:id` `(auth required)`
    *   **Description:** Updates an existing blog post.
*   `DELETE /api/blog/:id` `(auth required)`
    *   **Description:** Deletes a blog post.

### 3.5. Featured Content Endpoints (Admin Only)

*   `GET /api/featured` `(auth required)`
    *   **Description:** Retrieves the ordered list of all featured content (videos and blog posts).
*   `POST /api/featured` `(auth required)`
    *   **Description:** Sets a video or blog post as a featured item.
    *   **Request Body:** `{ "videoId": 1, "order": 1 }` or `{ "blogPostId": 1, "order": 1 }`
*   `PUT /api/featured` `(auth required)`
    *   **Description:** Updates the order of the featured content list.
    *   **Request Body:** `[{ "id": 1, "order": 2 }, { "id": 2, "order": 1 }]`
*   `DELETE /api/featured/:id` `(auth required)`
    *   **Description:** Removes an item from the featured content list.

## 4. Frontend Components and Pages

The frontend will be built using Next.js and will consist of public-facing pages and a secure admin dashboard.

### 4.1. Reusable Components

*   `Navbar`: Main navigation bar for public pages.
*   `Footer`: Site-wide footer.
*   `VideoCard`: Displays a video thumbnail, title, and channel name.
*   `BlogPostCard`: Displays a blog post title, excerpt, and publication date.
*   `Pagination`: Controls for navigating paginated content.
*   `AdminLayout`: A wrapper for all admin pages, including a sidebar for navigation.

### 4.2. Public Pages

*   **Home (`/`)**
    *   **Components:** `Navbar`, `HeroSection`, `FeaturedContentGrid`, `Footer`.
    *   **Description:** The landing page, showcasing manually curated videos and blog posts.

*   **BCH Videos (`/videos`)**
    *   **Components:** `Navbar`, `VideoGrid`, `Pagination`, `Footer`.
    *   **Description:** Displays all videos that have been automatically filtered as BCH-related.

*   **Blog (`/blog`)**
    *   **Components:** `Navbar`, `BlogPostList`, `Pagination`, `Footer`.
    *   **Description:** A list of all published blog articles.

*   **Single Blog Post (`/blog/:slug`)**
    *   **Components:** `Navbar`, `BlogPostView`, `Footer`.
    *   **Description:** Displays the full content of a single blog post.

*   **Contact (`/contact`)**
    *   **Components:** `Navbar`, `ContactForm`, `Footer`.
    *   **Description:** A simple page with a contact form.

### 4.3. Admin Dashboard

The admin dashboard will be a protected area of the site, accessible only to authenticated users.

*   **Login (`/admin/login`)**
    *   **Components:** `LoginForm`.
    *   **Description:** A simple login page for administrators.

*   **Dashboard (`/admin`)**
    *   **Components:** `AdminLayout`, `AnalyticsOverview`.
    *   **Description:** The main dashboard page displaying high-level analytics.

*   **Channel Management (`/admin/channels`)**
    *   **Components:** `AdminLayout`, `ChannelList`, `AddChannelForm`.
    *   **Description:** Admins can add or remove YouTube channels to be monitored.

*   **Featured Content Management (`/admin/featured`)**
    *   **Components:** `AdminLayout`, `FeaturedContentEditor`.
    *   **Description:** A tool for admins to select and order the content that appears on the home page. This could be a drag-and-drop interface.

*   **Blog Management (`/admin/blog`)**
    *   **Components:** `AdminLayout`, `BlogPostTable`.
    *   **Description:** Admins can view, edit, or delete all blog posts. A "Create New" button will link to the blog post editor.

*   **Blog Post Editor (`/admin/blog/new` and `/admin/blog/edit/:id`)**
    *   **Components:** `AdminLayout`, `BlogPostForm` (with a rich-text or Markdown editor).
    *   **Description:** A page for creating or editing a blog post.

## 5. YouTube Integration

The integration with the YouTube Data API is a core feature of the backend. It involves fetching, filtering, and storing video data.

### 5.1. API Key Management

The YouTube Data API v3 key is a sensitive credential and will be managed securely:
*   The API key will be stored in an environment variable (`YOUTUBE_API_KEY`) on the server.
*   It will never be committed to the source code repository.

### 5.2. Data Fetching and Filtering Process

A background job will be responsible for fetching and filtering videos.

1.  **Scheduling:** A cron job will be configured to run periodically (e.g., once every hour).
2.  **Fetching Channels:** The job will query the local database to get the list of all `youtubeChannelId`s from the `Channel` table.
3.  **Fetching Videos:** For each channel, the job will call the YouTube Data API's `search.list` or `playlistItems.list` endpoint to retrieve the most recent videos.
4.  **Filtering and Storing:** For each video returned by the API:
    *   The system will first check if the `youtubeVideoId` already exists in the local `Video` table to prevent duplicates.
    *   If the video is new, its title and description will be scanned for the keywords "Bitcoin Cash" or "BCH" (case-insensitive).
    *   A new record will be created in the `Video` table with all the relevant metadata (title, description, thumbnail, etc.). The `isBchRelated` flag will be set to `true` if the keywords are found.

### 5.3. API Quota Management

The YouTube Data API has a daily quota. The system will be designed to be efficient with its usage:
*   By fetching data periodically in a batch job, we avoid making API calls on every user request.
*   The application will primarily serve data from its own database, only using the background job to refresh the data.
*   The number of results fetched per request will be tuned to balance freshness with quota usage.

## 6. Security Considerations

The following security measures will be implemented to protect the application and its users.

### 6.1. Authentication and Authorization

*   **Password Hashing:** Administrator passwords will be salted and hashed using a strong, slow hashing algorithm like `bcrypt`.
*   **JWT for Sessions:** Admin sessions will be managed using JSON Web Tokens (JWTs). The token will be stored in a secure, `HttpOnly` cookie to prevent access from client-side scripts.
*   **Endpoint Protection:** All API endpoints intended for admin use will be protected by middleware that verifies the user's JWT.

### 6.2. Data Validation and Sanitization

*   **Server-Side Validation:** All incoming data from API requests will be validated on the backend against a strict schema using a library like `zod`. This prevents malformed data and potential vulnerabilities.
*   **Input Sanitization:** To prevent Cross-Site Scripting (XSS) attacks, all user-generated content (e.g., blog posts, comments) will be sanitized before being rendered. Libraries like `DOMPurify` will be used to strip out malicious HTML.
*   **SQL Injection Prevention:** The use of an ORM (Prisma) with parameterized queries provides strong protection against SQL injection attacks.

### 6.3. API and Network Security

*   **CORS:** A strict Cross-Origin Resource Sharing (CORS) policy will be implemented to ensure the API only accepts requests from the designated frontend application.
*   **Rate Limiting:** Publicly accessible endpoints, especially the `/api/auth/login` route, will be rate-limited to protect against brute-force attacks and denial-of-service attempts.
*   **Security Headers:** The application will use a library like `helmet` to set important security headers (e.g., `X-Content-Type-Options`, `Strict-Transport-Security`, `X-Frame-Options`) to protect against common web vulnerabilities.

### 6.4. Secrets Management

*   **Environment Variables:** All sensitive information, including database connection strings, API keys (YouTube), and JWT secrets, will be stored as environment variables and will not be hardcoded in the source.
*   **Production Secrets:** For production environments, a dedicated secret management service like AWS Secrets Manager, Google Secret Manager, or HashiCorp Vault is recommended.

### 6.5. Dependency Management

*   **Vulnerability Scanning:** The project's dependencies will be regularly scanned for known vulnerabilities using tools like `npm audit` or integrated services like Snyk or Dependabot.

## 7. Scalability

The application will be designed with the following scalability strategies in mind to handle future growth.

### 7.1. Stateless Backend

The backend API will be stateless. Session data is not stored on the server; instead, it is managed via JWTs sent with each request. This allows for horizontal scaling, where multiple instances of the backend can be run behind a load balancer.

### 7.2. Caching

*   **Database Caching:** A caching layer like **Redis** can be introduced to cache the results of expensive or frequent database queries, such as the list of featured content or the home page videos.
*   **Data Caching:** The application already caches YouTube data in its own database, which significantly reduces reliance on the external YouTube API and improves performance.

### 7.3. Content Delivery Network (CDN)

Using a **CDN** (e.g., Vercel's Edge Network, AWS CloudFront, Cloudflare) is recommended for:
*   Serving static frontend assets (JS, CSS, images) from locations closer to the user, reducing latency.
*   Caching responses from public API endpoints to reduce load on the backend server.

### 7.4. Background Job Processing

The use of background jobs for fetching YouTube data is a core part of the design. For more complex needs, a dedicated job queue system like **BullMQ** or **Agenda** could be implemented to provide better reliability, retries, and monitoring for background tasks.

### 7.5. Database Scaling

*   **Vertical Scaling:** The PostgreSQL database can be moved to a more powerful server as a first step.
*   **Read Replicas:** For read-heavy workloads, PostgreSQL's streaming replication can be used to create read-only replicas of the database. This would distribute read queries across multiple servers, reducing the load on the primary database.

## 8. Development Roadmap

The project will be developed in phases to ensure a structured and iterative process.

### Phase 1: Core Backend and Project Setup

*   **Tasks:**
    *   Initialize the monorepo with Next.js (frontend) and Express.js (backend).
    *   Set up the PostgreSQL database and define the schema with Prisma.
    *   Implement User model and authentication (login, JWT generation, middleware).
    *   Set up basic project structure, linting, and formatting rules.
*   **Goal:** A secure backend foundation with admin authentication.

### Phase 2: YouTube Integration

*   **Tasks:**
    *   Implement backend logic for adding/removing YouTube channels.
    *   Create the background job to periodically fetch videos from saved channels.
    *   Implement the keyword filtering logic (`"Bitcoin Cash"`, `"BCH"`) to flag relevant videos.
    *   Build the admin UI for managing channels.
*   **Goal:** The system can automatically pull and filter content from YouTube.

### Phase 3: Blog System

*   **Tasks:**
    *   Implement backend CRUD API endpoints for blog posts.
    *   Build the admin UI for creating and managing blog posts (including a rich-text editor).
    *   Create the public-facing `/blog` and `/blog/:slug` pages.
*   **Goal:** A fully functional blog/CMS.

### Phase 4: Content Curation and Public Interface

*   **Tasks:**
    *   Implement backend API endpoints for managing featured content.
    *   Build the admin UI for selecting and ordering featured content.
    *   Develop the public Home page to display featured content.
    *   Develop the public `/videos` page to display all BCH-related videos.
    *   Finalize the remaining UI pages (Contact, etc.).
*   **Goal:** A complete user-facing website with curated content.

### Phase 5: Testing, Deployment, and Analytics

*   **Tasks:**
    *   Write comprehensive unit and integration tests.
    *   Set up a CI/CD pipeline for automated builds, tests, and deployment.
    *   Deploy the application to a hosting platform (e.g., Vercel for frontend, AWS/Heroku for backend).
    *   Implement the basic analytics overview page in the admin dashboard.
    *   Conduct final testing and bug fixing.
*   **Goal:** A production-ready, stable, and deployed application.
