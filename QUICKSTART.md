# Atlantic Weizard - Quick Start Guide

This guide will help you get the Atlantic Weizard e-commerce platform up and running in under 10 minutes.

## Prerequisites

Before you begin, make sure you have:

- ✅ Node.js 20.x or higher installed
- ✅ PostgreSQL 16.x or higher installed and running
- ✅ A terminal/command prompt
- ✅ A code editor (optional, for viewing code)

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages for both the client and server.

## Step 2: Set Up Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** and update these critical values:

   ```bash
   # Your PostgreSQL connection string
   DATABASE_URL=postgresql://user:password@localhost:5432/atlantic_weizard
   
   # Generate a strong secret (run this command and paste the output):
   # openssl rand -base64 32
   SESSION_SECRET=your-generated-secret-here
   ```

3. **Optional:** Update PayU credentials if you have your own (default test credentials work for development)

## Step 3: Set Up Database

1. **Create the database** (if it doesn't exist):
   ```bash
   # Using psql
   createdb atlantic_weizard
   
   # Or using SQL
   psql -U postgres -c "CREATE DATABASE atlantic_weizard;"
   ```

2. **Push the schema** to your database:
   ```bash
   npm run db:push
   ```

3. **Create the admin user:**
   ```bash
   npm run seed:admin
   ```

   This will create an admin account with:
   - Email: `admin@atlanticweizard.com`
   - Password: `Admin@123`

## Step 4: Start the Development Server

```bash
npm run dev
```

The server will start on http://localhost:5000

## Step 5: Access the Application

### Customer Store
Open your browser and go to:
```
http://localhost:5000
```

You can:
- Browse products
- Add items to cart
- Go through checkout (use test PayU credentials)

### Admin Panel
Go to:
```
http://localhost:5000/admin
```

Login with:
- **Email:** admin@atlanticweizard.com
- **Password:** Admin@123

⚠️ **Change this password immediately after first login!**

## Common Issues & Solutions

### Issue: "DATABASE_URL must be set"
**Solution:** Make sure you created the `.env` file and set the `DATABASE_URL` variable.

### Issue: "SESSION_SECRET environment variable is required"
**Solution:** Generate a secret with `openssl rand -base64 32` and add it to your `.env` file.

### Issue: Database connection error
**Solution:** 
1. Make sure PostgreSQL is running
2. Verify your connection string in `.env`
3. Check that the database exists

### Issue: Port 5000 already in use
**Solution:** Change the `PORT` in your `.env` file to a different port (e.g., 3000, 8080)

## Next Steps

Now that you're up and running:

1. **Change the admin password** in the admin panel
2. **Add some products** through the admin panel
3. **Test the checkout flow** with test PayU credentials
4. **Explore the codebase** to understand the architecture

## Development Commands

```bash
# Start development server
npm run dev

# Check TypeScript types
npm run check

# Push database schema changes
npm run db:push

# Create admin user
npm run seed:admin

# Build for production
npm run build

# Start production server
npm start
```

## Getting Help

If you run into issues:

1. Check the main [README.md](README.md) for detailed documentation
2. Review the [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
3. Check existing issues on GitHub
4. Create a new issue with details about your problem

## What's Next?

- Read the [full README](README.md) for complete documentation
- Review the [design guidelines](design_guidelines.md) for UI/UX standards
- Check the [action plan](../../../.gemini/antigravity/brain/0c918408-b159-4840-8a27-3037d463d7c8/action_plan.md) for planned improvements
- Explore the codebase and start contributing!

---

**Happy coding! 🌊**
