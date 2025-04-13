<div align="center">

<img src="public/icon.png" alt="VoiceViz Logo" width="120"/>

# **VoiceViz**
### ✨ Voice to Visualization ✨

Transform your voice into powerful data-driven visuals.
</div>


# About VoiceViz

VoiceViz is designed as a SaaS (Software as a Service) application that empowers users—from data analysts to business users—to interact with complex datasets through natural language queries, eliminating the need for technical expertise in data tools.

## Features

- 🎙️ Voice Input: Ask data-related queries using your voice and get visual responses.
- 💬 Text Input: Prefer typing? Enter your questions to generate the same powerful visuals.
- 🎧 Audio File Support: Upload audio clips to convert them into data queries.
- 📊 Dynamic Visualizations: Charts and graphs generated in real-time based on your query.
- 🌐 Multi-modal Input Handling: Switch between voice, text, or file input seamlessly.
- 🔒 User Authentication: Secure login and personalized dashboards.
- 🌓 Dark Mode Support: Smooth visual experience for night owls.

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- A database (e.g., PostgreSQL, MySQL)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/voiceviz.git
   cd voiceviz
   ```

2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Install backend dependencies:

   ```bash
   cd VoiceViz_backend
   pip install -r requirements.txt
   ```

## Running the Application

### Frontend

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`.

### Backend

1. Navigate to the `VoiceViz_backend` directory:

   ```bash
   cd VoiceViz_backend
   ```

2. Run the backend server:

   ```bash
   python main.py
   ```

3. Ensure the backend is running on the specified port (default: `http://localhost:5000`).
   

## Technologies Used

- **Frontend**: Next.js, Tailwind CSS, React
- **Backend**: Python, Flask (or FastAPI)
- **Database**: PostgreSQL/MySQL (configurable)
- **State Management**: React Context API


## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Python Documentation](https://docs.python.org/3/)
