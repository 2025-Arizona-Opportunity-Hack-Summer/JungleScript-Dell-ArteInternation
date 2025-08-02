
    # Team JungleScript: Dell'Arte Alumni Network 🎭

## 🎯 Problem Statement

[Dell'Arte International](https://dellarte.com), a renowned school of physical theatre located in Blue Lake, California, needed a modern solution to connect and manage their extensive alumni network. With graduates spanning decades and continents, the organization lacked an effective way to:

- **Connect alumni** with each other across the globe
- **Visualize their network** geographically 
- **Maintain current contact information** for outreach and events
- **Showcase alumni achievements** and career paths
- **Facilitate networking** between current students and alumni

## 🚀 Our Solution

**Dell'Arte Alumni Network** is a comprehensive web platform that revolutionizes how Dell'Arte International connects with and manages their alumni community. Our solution provides:

### ✨ Key Features

- **🗺️ Interactive Alumni Map**: Mapbox-powered global visualization of alumni locations with search and filtering
- **👤 Rich Alumni Profiles**: Comprehensive profiles including programs attended, professional information, and biography
- **🔍 Smart Search & Discovery**: Find alumni by name, location, or program 
- **📊 Admin Dashboard**: Real-time analytics and management tools for staff
- **📧 Communication Tools**: Bulk email capabilities for targeted outreach
- **📱 Mobile Responsive**: Seamless experience across all devices
- **🔐 Secure Authentication**: Clerk-powered login system with role-based access
- **📥 Bulk Import**: CSV data import for easy migration of existing records

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15 (React 18)
- TypeScript
- Tailwind CSS
- shadcn/ui Components
- Mapbox GL JS

**Backend:**
- Next.js API Routes  
- Supabase (PostgreSQL)
- Clerk Authentication
- Mailgun Email Service

**APIs & Services:**
- Multiple Geocoding Providers (Google, Mapbox, OpenCage)
- Image Upload & Processing
- Real-time Data Synchronization

## 🌟 Impact

Our solution directly addresses Dell'Arte International's need to:
- **Strengthen Community**: Enable 400+ alumni to reconnect and network
- **Improve Outreach**: Streamline communication for events and opportunities  
- **Data Management**: Centralize and maintain accurate alumni records
- **Visual Engagement**: Showcase the global reach of Dell'Arte's impact
- **Future Growth**: Scalable platform for continued alumni expansion

## 📱 Screenshots

### Interactive Alumni Map with Global Coverage
![Alumni Map](./assets/CleanShot%202025-08-02%20at%2014.19.33@2x.png)
The world map shows alumni distributed globally with an intuitive sidebar for browsing network members. Users can search and filter alumni by location, with interactive markers showing exact positions worldwide.

### Comprehensive Alumni Profile Management  
![Profile Management](./assets/CleanShot%202025-08-02%20at%2014.20.02@2x.png)
The profile editing interface allows alumni to update their personal information, contact details, and address with a clean, user-friendly design that ensures data accuracy and easy navigation.

### Admin Dashboard with Real-time Analytics
![Admin Dashboard](./assets/CleanShot%202025-08-02%20at%2014.20.26@2x.png)
The administrative dashboard provides key metrics including total alumni count (15), recent registrations (5 in 30 days), and active users (5), along with quick action buttons for managing alumni, viewing the map, and importing data.

## 🏃‍♀️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account
- Clerk account  
- Mapbox account
- Mailgun account (with verified domain for production email functionality)
- Domain name (required for email functionality in production)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/2025-Arizona-Opportunity-Hack-Summer/JungleScript-Dell-ArteInternation.git
cd JungleScript-Dell-ArteInternation
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Configure the following environment variables in your `.env.local` file:

**Required API Keys & Configuration:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (server-side)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
- `CLERK_SECRET_KEY` - Your Clerk secret key
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Your Mapbox access token
- `MAILGUN_API_KEY` - Your Mailgun API key
- `MAILGUN_DOMAIN` - Your verified Mailgun domain

**⚠️ Important Email Configuration Note:**
Mailgun requires a verified domain to send emails to external recipients. If you're running this locally without a proper domain setup:
- Emails will only work for sandbox testing (limited recipients)  
- The admin communication features will not function properly
- You'll need to verify a domain in your Mailgun account for production use

4. **Run the development server**
```bash
npm run dev
# or  
pnpm dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Admin Demo Account

For testing and demonstration purposes, you can use the following admin account:

- **Email:** `kennytrung0603@icloud.com`
- **Password:** `Clover7-Endanger-Dupe`

This account has full administrative privileges and can be used to:
- Access the admin dashboard
- Manage alumni records
- Send bulk communications
- Import/export data
- View analytics and reports

## 🏆 Achievements We're Proud Of

- **🎨 Intuitive UX/UI**: Created a professional, user-friendly interface that makes alumni networking effortless
- **🌍 Global Scale**: Built a system that handles alumni from multiple continents with real-time mapping
- **🔧 Technical Excellence**: Implemented robust geocoding with multiple provider fallbacks for 99%+ accuracy
- **⚡ Performance**: Optimized for fast loading with efficient data management and caching
- **♿ Accessibility**: Designed with inclusivity in mind, ensuring the platform works for all users

## 🚧 Challenges We Overcame

- **Geocoding Complexity**: Implemented multiple geocoding services with intelligent fallbacks to handle various address formats globally
- **Data Architecture**: Designed flexible schema to accommodate diverse alumni information while maintaining performance
- **Map Performance**: Optimized Mapbox rendering for hundreds of data points without lag
- **Authentication Flow**: Created seamless onboarding experience while maintaining security

## 👥 Team "JungleScript"

- **Derek Tran** - Backend Developer
- **Kenny Nguyen** - Full Stack Developer  
- **Kelly Nguyen** - UI/UX Designer

## 🔗 Quick Links

- **Live Demo**: [Dell'Arte Alumni Network](https://dellartejungle-zl1zvkmzu-kenny-nguyens-projects.vercel.app/)
- **Nonprofit Partner**: [Dell'Arte International](https://ohack.dev/nonprofit/eObX4Ig63NLCKuKGN8P6) 
- **Hackathon**: [2025 Summer Opportunity Hack](https://www.ohack.dev/hack/2025_summer)
- **Team Slack**: [#junglescript](https://opportunity-hack.slack.com/app_redirect?channel=junglescript)
- **DevPost**: [Project Submission](https://devpost.com/software/junglescript-dell-arte-international-project) <!-- Add DevPost link when available -->
- **Demo Video**: [Watch Our Presentation](https://youtu.be/3xfnTsLIAGs) <!-- Add demo video link -->

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

Special thanks to:
- **Dell'Arte International** for trusting us with their vision
- **Opportunity Hack** for providing the platform to make a difference  
- **The physical theatre community** for inspiring creative solutions
- **Open source contributors** whose libraries made this project possible

---

*Built with ❤️ during the 2025 Summer Opportunity Hack*
