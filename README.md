# 🍡 Dango Tracker 🍡

A comprehensive tracking application built with Next.js, leveraging the power of a Neon database. 🚀

**Live App:** [dango-tracker.vercel.app](https://dango-tracker.vercel.app) 🌐

## Features ✨

-   **📊 Dashboard:** Get an overview of your tracked data.
-   **💰 Financial Tracker:** Keep a close eye on your finances with detailed history and new entry creation.
-   **📖 Journal:** Record your thoughts and experiences with a fully functional journal.
-   **☑️ To-Do List:** Stay organized and manage your tasks efficiently.

## Technologies Used 🛠️

-   Next.js 13 ⚛️
-   Neon Database 🐘
-   pnpm 📦
-   NextAuth.js 🔐
-   Vercel (for deployment) ☁️

## Getting Started 🏁

### Prerequisites 📋

-   Node.js (v18 or later recommended) 🟢
-   Git 📂
-   pnpm (install with `npm install -g pnpm`) 📦

### Installation Steps ⚙️

1.  **Clone the repository:**

    ```bash
    git clone <your_repository_url>
    cd <your_repository_directory>
    ```

2.  **Install dependencies using pnpm:**

    ```bash
    pnpm install
    ```

3.  **Create a `.env.local` file:**

    ```bash
    touch .env.local
    ```

4.  **Add your Neon database URL and NextAuth credentials to `.env.local`:**

    ```bash
    DATABASE_URL="your_database_url_here"
    NEXTAUTH_SECRET="your_nextauth_secret_here"
    NEXTAUTH_URL="http://localhost:3000" #or your deployed URL
    ```

    * Replace `your_database_url_here` with your actual Neon database connection string.
    * Replace `your_nextauth_secret_here` with a secure random string. you can generate one with `openssl rand -base64 32`

5.  **Start the development server:**

    ```bash
    pnpm dev
    ```

6.  **Open your browser and navigate to `http://localhost:3000`** 🌐

## Deployment 🚀

This application is deployed on Vercel: [dango-tracker.vercel.app](https://dango-tracker.vercel.app). To deploy your own version, you can connect your repository to Vercel and follow their deployment instructions.

## Contributing 🤝

Contributions are always welcome! Feel free to submit pull requests or open issues for bugs or feature requests.

## License 📄

This project is licensed under the MIT License.
