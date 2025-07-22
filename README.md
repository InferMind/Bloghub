# Modern Blog Platform

A full-featured blog platform built with Next.js, Supabase, and Tailwind CSS.

## Features

- User authentication with Supabase Auth
- Rich text editor for writing blog posts
- Comment and like system
- Bookmark functionality
- Email notifications
- Responsive design
- Dark mode support
- Categories and tags
- Author profiles
- Search functionality

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Resend account (for email functionality)

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/modern-blog-platform.git
cd modern-blog-platform
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a `.env.local` file in the root directory with the following variables:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
\`\`\`

4. Set up your Supabase database by running the SQL scripts in the `scripts` folder.

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

Run the SQL scripts in the `scripts/database-schema.sql` file in your Supabase SQL editor to create the necessary tables and functions.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `SUPABASE_JWT_SECRET`: Your Supabase JWT secret
- `RESEND_API_KEY`: Your Resend API key for sending emails
- `NEXT_PUBLIC_SITE_URL`: The URL of your site (for absolute URLs)

## Deployment

This project can be easily deployed on Vercel:

1. Push your code to a GitHub repository
2. Import the repository in Vercel
3. Add the environment variables
4. Deploy!

## License

This project is licensed under the MIT License.
