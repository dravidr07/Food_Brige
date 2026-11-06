🍲 FoodBridge – Connecting Food Donors with People in Need

FoodBridge is a food donation and redistribution platform designed to reduce food waste and fight hunger by connecting food donors, NGOs, restaurants, community volunteers, and people in need.

The platform makes food donation easier through an interactive donation system, contributor leaderboard, messaging, donation tracking, and location-based food discovery.

vercel deploy link:https://food-brige.vercel.app

🌐 Live Website: https://foodbridge-website-1crg.bolt.host

📌 Table of Contents
About the Project
Problem Statement
Our Solution
Features
Technology Stack
Project Structure
Database
Installation and Setup
Environment Configuration
How It Works
Future Enhancements
Contributing
License
🌍 About the Project

FoodBridge is a social-impact web application that helps redistribute surplus food to communities that need it.

Restaurants, individuals, and food donors can submit food contributions, while NGOs and volunteers can coordinate food collection and distribution.

Our mission is to create a connected food donation ecosystem where surplus food becomes an opportunity to help someone.

⚠️ Problem Statement

Every day, large quantities of edible food are wasted while many people struggle to access nutritious meals.

Major challenges include:

Lack of coordination between food donors and NGOs.
Difficulty locating nearby food banks and collection centers.
Limited transparency in food donation activities.
Lack of contributor recognition and engagement.
Inefficient communication between donors and volunteers.
💡 Our Solution

FoodBridge provides a centralized digital platform that connects food donors with NGOs and volunteers.

It simplifies food donations, improves communication, tracks contributions, and encourages community participation through gamification and impact tracking.

✨ Features
1. 🍱 Interactive Food Donation
Submit food donations directly through the homepage.
Enter donor details, food type, quantity, and pickup location.
Attach food contribution photos.
Preview estimated donation impact.
Save donation information in the database.
2. 📊 Personal Dashboard
View donation history.
Track total donations.
Monitor meals contributed.
View uploaded donation photos.
Filter donation records by food type.
3. 🗺️ Interactive Food Location Map
Discover nearby food banks.
Locate partner pantries.
Find active food drop-off locations.
Explore location information.
4. 🏆 Contributor Leaderboard
Separate rankings for donors and volunteers.
Filter contributors by region and city.
View rankings by week, month, or all time.
Interactive contributor profiles.
Badge and achievement breakdown.
Contribution history and impact statistics.
5. 💬 Messaging System
Dedicated messaging inbox.
View sent and received conversations.
Reply to messages.
Unread message notifications.
Direct messaging interface between contributors.
6. 👤 Authentication Interface
Sign-in and sign-out interface.
Google OAuth integration interface.
Authentication modal with responsive animations.
7. 🧮 Impact Calculator
Calculate estimated meals provided.
Estimate people helped.
Calculate food saved in kilograms.
Estimate environmental impact.
Live calculation and input validation.
Reset functionality.
8. 🎓 Certificate Generator
Generate personalized certificates.
Enter recipient name.
Select contributor role.
Professional certificate design.
Download certificates as PNG images.
9. 🎨 Premium UI and Animations
Responsive modern interface.
Food-themed animations.
Floating food visuals.
Smooth page transitions.
Interactive popups and modals.
Mobile-friendly bottom sheets.
Animated buttons and cards.
🛠️ Technology Stack
Technology	Purpose
React	Frontend UI
TypeScript	Type safety
Vite	Development and build tool
Tailwind CSS	Styling
Framer Motion	Animations
Lucide React	Icons
Supabase / Bolt Database	Database and backend
PostgreSQL	Relational database
HTML5 Canvas	Certificate generation
Web Audio API	Sound effects
📁 Project Structure
text
FoodBridge/
│
├── public/
│   └── assets/
│
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Impact.tsx
│   │   ├── ImpactCalculator.tsx
│   │   ├── ImpactPopup.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── MessagesInbox.tsx
│   │   ├── Dashboard.tsx
│   │   ├── LiveMap.tsx
│   │   ├── FormModal.tsx
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── impact.ts
│   │   ├── useCountUp.ts
│   │   └── springs.tsx
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── ...
│
├── package.json
├── index.html
├── vite.config.ts
└── README.md


Note: This is a representative structure; additional files may exist in the project.

🗄️ Database

FoodBridge uses a PostgreSQL-based database through Bolt Database.

The database supports:

Food donation records.
Contributor information.
NGO partner information.
Conversations.
Messages.
Food location information.
Donation photo references.

Uploaded donation photos are intended to be managed through database storage.

🚀 Installation and Setup
Prerequisites

Make sure you have installed:

Node.js (18 or later recommended).
npm.
Git.
A compatible database connection.
Step 1: Clone the Repository
bash
git clone YOUR_GITHUB_REPOSITORY_URL

Step 2: Navigate to the Project
bash
cd FoodBridge

Step 3: Install Dependencies
bash
npm install

Step 4: Configure Environment Variables

Create a .env file in the project root and configure the required database credentials.

Example for a Supabase connection:

env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key


Use these variables only if your project code uses Supabase directly. Check the existing database client configuration before adding or changing environment variables.

Never commit secret keys or service-role credentials to GitHub.

Step 5: Start Development Server
bash
npm run dev

Step 6: Build for Production
bash
npm run build

Step 7: Preview Production Build
bash
npm run preview

🔄 How It Works
Donors: Submit surplus food information and optional photos.
Database: Stores donation information.
NGOs: Coordinate with donors and volunteers.
Volunteers: Help collect and distribute food.
Dashboard: Tracks donation history and contribution statistics.
Leaderboard: Recognizes top contributors.
Impact Calculator: Estimates the social and environmental impact.
🔮 Future Enhancements
Real-time GPS-based food donation matching.
Push notifications for nearby food donations.
Advanced NGO verification.
Secure role-based authentication.
Real-time donation status tracking.
AI-based food demand prediction.
Expiry-date monitoring and food safety checks.
Multilingual support.
Mobile application for Android and iOS.
Advanced analytics and reporting.
🤝 Contributing

Contributions are welcome!

Fork the repository.
Create a feature branch.
bash
git checkout -b feature/YourFeature

Commit your changes.
bash
git commit -m "Add YourFeature"

Push your branch.
bash
git push origin feature/YourFeature

Open a Pull Request.
❤️ Our Mission

"Don't Waste Food. Share Food. Save Lives."

FoodBridge aims to transform food waste into meaningful social impact by connecting people, technology, and communities.

Together, we can build a world where surplus food reaches someone who needs it.

🌐 Project Links
Live Application: https://foodbridge-website-1crg.bolt.host
GitHub Repository: Add your GitHub repository URL here.
📄 License

This project can be distributed under the MIT License. Add a LICENSE file to the repository if you choose to publish it under that license.

Built with ❤️ for a hunger-free world.
