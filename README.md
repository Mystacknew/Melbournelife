
# Melbourne Life (මැල්බන් ලයිෆ්) 🇦🇺

An interactive text-based RPG simulating the life of a Sri Lankan student in Melbourne. **No AI required** - Play with pre-defined scenarios and your own choices!

## ✨ Features

- ✅ **No AI/API Keys Required** - Fully playable without external AI services
- ✅ **Google Sign-In** - Authenticate with your Gmail account
- ✅ **Guest Mode** - Play without creating an account (saves locally)
- ✅ **Cloud Saves** - Your progress is saved to Supabase (for logged-in users)
- ✅ **4 Social Classes** - Different starting scenarios based on your character's background
- ✅ **Authentic Sinhala & Singlish** - Realistic language and culture representation

## 🎮 How to Play

1. **Visit the Game** (once deployed)
2. **Choose**:
   - **Sign in with Google** for cloud saves across devices
   - **Play as Guest** for local-only saves
3. **Create Your Character** - Name, age, gender, relationship status
4. **Pick Your Class** - ඇමති පුතා, Business Family, Middle Class, or Lower Class
5. **Make Choices** - Navigate Melbourne life and survive 30 days!

## 🚀 Quick Start (Local Development)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Mystacknew/Melbournelife.git
   cd Melbournelife
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:5173`

## ☁️ Supabase Setup

This game uses Supabase for:
- **Google OAuth Authentication**
- **Cloud Save Storage**

### Current Configuration:
- **Project URL**: `https://mggcjyfnagjttezrqdwx.supabase.co`
- **Anon Key**: Already configured in the code

### Database Setup:

You need to create a `saves` table in your Supabase project:

```sql
CREATE TABLE saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see/edit their own saves
CREATE POLICY "Users can manage their own saves"
  ON saves
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Enable Google Authentication:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Providers**
3. Enable **Google** provider
4. Add your site URL to **Redirect URLs** (e.g., `http://localhost:5173` for local dev)

## 🌐 Deployment to Vercel

1. **Push to GitHub** (see commands below)
2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click **Add New > Project**
   - Import your GitHub repository
3. **Deploy** - Vercel will automatically build and deploy!

### Push to GitHub:

```bash
git init
git add .
git commit -m "Initial commit - Melbourne Life"
git remote add origin https://github.com/Mystacknew/Melbournelife.git
git branch -M main
git push -u origin main
```

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth (Google OAuth)
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Deployment**: Vercel
- **Game Engine**: Pre-defined scenario system (no AI!)

## 🎯 Game Mechanics

- **Stats**: Money (සල්ලි), Stress, Energy (පණ)
- **Inventory**: Collect items that unlock special choices
- **Day Counter**: Survive 30 days to reach settlement/PR goal
- **Multiple Endings**: Based on your choices and survival
- **Auto-Save**: Progress saves after every choice

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

Made with ❤️ for the Sri Lankan community in Melbourne
