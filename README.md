# **FinSight – Personal Finance Tracker**

**A modern, full-stack web application for effortless, insightful personal finance management.**

---

## **Project Overview**

**FinSight** is a robust, responsive personal finance tracker designed to empower users with clarity, control, and insight over their financial lives.  
Built with a modern tech stack and a focus on clean UI/UX, FinSight transforms the way users interact with their finances:

- **Centralizes all financial activity:** Users can log every income and expense, categorize transactions, and view their entire financial history in one place.
- **Visualizes spending habits:** Interactive charts and dashboards provide immediate, actionable insights into spending patterns, category breakdowns, and monthly trends.
- **Promotes mindful budgeting:** Users can set monthly budgets for each category, compare planned vs. actual spending, and receive instant feedback when they approach or exceed their limits.
- **Guides better decisions:** Simple but powerful analytics highlight top spending areas, recurring expenses, and offer over-budget alerts—enabling smarter, more confident financial decisions.
- **Delivers a seamless experience:** Ensuring the app is intuitive, fast, and beautiful on any device.

**FinSight is not just a tracker—it's a personal finance partner, designed for real-world usability, transparency, and peace of mind.**

---

## **Features**

### **Stage 1: Transaction Tracker**
- Add, edit, and delete transactions (amount, date, description)
- View a chronological list of all transactions
- Monthly expense bar chart (Recharts)
- Basic form validation (required fields, valid amount/date)

### **Stage 2: Categories & Dashboard**
- All Stage 1 features, plus:
- Predefined categories (e.g., Food, Rent, Travel)
- Category-wise pie chart for spending
- Dashboard with:
  - Total monthly expenses
  - Category-wise breakdown
  - Recent transactions

### **Stage 3: Budgeting & Insights**
- All Stage 2 features, plus:
- Set monthly budgets per category
- Budget vs Actual comparison chart
- Spending insights (over-budget alerts, top spending category, trends)

---

## **Tech Stack**

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | Next.js (App Router), Tailwind CSS, shadcn/ui, Recharts |
| Backend    | Next.js API Routes (Node.js/Express), Prisma ORM |
| Database   | PostgreSQL (Docker or Neon.tech)                |
| Other      | TypeScript, Docker, Redis (optional for caching) |

---

## **Screenshots*

### **Dashboard**
![Dashboard Screenshot](screenshots/dashboardTransactions**

![WhatsApp Image 2025-06-11 at 18 39 08_66c7bb30](https://github.com/user-attachments/assets/5c240ad5-2515-4b9a-9026-92d99039cd0b)
![WhatsApp Image 2025-06-11 at 18 39 08_236f69df](https://github.com/user-attachments/assets/df678194-ef41-4df2-a017-63f6856183c2)
![WhatsApp Image 2025-06-11 at 18 39 07_33a2d87a](https://github.com/user-attachments/assets/35350991-109a-4f12-9bb4-80a73a593978)
![WhatsApp Image 2025-06-11 at 18 39 07_9164070c](https://github.com/user-attachments/assets/845e125a-a12c-45d9-8594-af51e4c855a6)
![WhatsApp Image 2025-06-11 at 18 39 08_259e5294](https://github.com/user-attachments/assets/2aabdfe4-e6ea-4c0e-a551-dc92d50a1d3d)
![WhatsApp Image 2025-06-11 at 18 39 08_d409e129](https://github.com/user-attachments/assets/69cb3d82-7572-4551-94b3-dbe3b28dc629)


![Transactions Screenshot](screenshots/Analytics**

![WhatsApp Image 2025-06-11 at 18 39 08_e9794eb0](https://github.com/user-attachments/assets/69c71b7c-8e21-44f9-962b-ab3df0157499)
![WhatsApp Image 2025-06-11 at 18 39 08_3c967e9b](https://github.com/user-attachments/assets/9c6262c2-1e71-4499-a799-d11f178c1e29)
![WhatsApp Image 2025-06-11 at 18 39 08_1aa6721c](https://github.com/user-attachments/assets/71b713a4-aadd-4c66-84d4-8783d789bd34)
![WhatsApp Image 2025-06-11 at 18 39 08_8d573c44](https://github.com/user-attachments/assets/a7bedf49-48f3-4c3d-9ca1-7da44cc6803f)


![Budget Screenshot](screenshots/Budget.png Screenshot](screenshots/bGetting Started**

![WhatsApp Image 2025-06-11 at 18 39 08_ced5149b](https://github.com/user-attachments/assets/c70d8711-db41-459f-bc7a-65c98ce51c4f)
![WhatsApp Image 2025-06-11 at 18 39 08_80602a0a](https://github.com/user-attachments/assets/6e8bcd51-914f-4d30-821c-6f49e57b62c4)
![WhatsApp Image 2025-06-11 at 18 39 08_4803abeb](https://github.com/user-attachments/assets/551895b1-fd36-422c-861a-76d58f9c6062)


### **Prerequisites**

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (for local PostgreSQL)
- [Git](https://git-scm.com/)

---

### **Local Setup (Mac & Windows)**

#### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/finance-tracker.git
cd finance-tracker
```

#### **2. Install Dependencies**
```bash
npm install
# or
yarn install
```

#### **3. Set Up PostgreSQL Database**

**With Docker (Recommended):**
```bash
docker run --name finance-db -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=finance_tracker -p 5432:5432 -d postgres:15
```
- **Mac:** Use Terminal.
- **Windows:** Use PowerShell or Docker Desktop.

**Or use [Neon.tech](https://neon.tech) for a free Postgres cloud DB.**

---

### **Environment Variables**

Copy `.env.example` to `.env.local` and fill in your values:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/finance_tracker"
JWT_SECRET="your-jwt-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

### **Running the App**

#### **1. Run Database Migrations**
```bash
npx prisma generate
npx prisma db push
```

#### **2. Start the Development Server**
```bash
npm run dev
# or
yarn dev
```
- The app will be running at [http://localhost:3000](http://localhost:3000)

---

## **Project Structure**

```
finance-tracker/
│
├── src/
│   ├── app/                # Next.js app router pages
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│
├── prisma/
│   └── schema.prisma       # Prisma DB schema
├── public/                 # Static assets (images, etc.)
├── .env.example            # Example environment variables
├── package.json
├── tailwind.config.js
├── next.config.js
├── README.md
```

# ✅ FinSight – PDF Requirements Checklisk

## **Core Objective**
> Build a responsive, full-stack web application that helps users track personal finances through an intuitive, clean interface.

## **Project Stages**

### **Stage 1 – Transaction Tracker**

| Feature                                                     | Implemented? |
|-------------------------------------------------------------|:------------:|
| Add, edit, and delete transactions (amount, date, desc)     |      ✅      |
| View a list of all transactions                             |      ✅      |
| Monthly expense bar chart using Recharts                    |      ✅      |
| Basic form validation (required fields, valid amount/date)  |      ✅      |

---

### **Stage 2 – Categories & Dashboard**

| Feature                                                     | Implemented? |
|-------------------------------------------------------------|:------------:|
| Predefined categories (e.g., Food, Rent, Travel)            |      ✅      |
| Category-wise pie chart                                     |      ✅      |
| Dashboard:                                                  |              |
| – Total monthly expenses                                    |      ✅      |
| – Category-wise breakdown                                   |      ✅      |
| – Most recent transactions                                  |      ✅      |

---

### **Stage 3 – Budgeting & Insights**

| Feature                                                     | Implemented? |
|-------------------------------------------------------------|:------------:|
| Set monthly budgets per category                            |      ✅      |
| Budget vs Actual comparison chart                           |      ✅      |
| Simple spending insights (over-budget alerts, top category) |      ✅      |

---

## **Evaluation Criteria**

| Criteria               | Implemented? | Notes                                          |
|------------------------|:------------:|------------------------------------------------|
| Feature Implementation |      ✅      | All Stage 3 features completed                 |
| Code Quality           |      ✅      | TypeScript, ESLint, modular, documented        |
| UI/UX Design           |      ✅      | Clean, responsive, modern, Samsung-inspired    |

---

## **Submission Guidelines**

| Requirement                                 | Implemented? | Notes                                      |
|----------------------------------------------|:------------:|--------------------------------------------|
| GitHub repo with clean, modular code         |      ✅      | Public and well-structured                 |
| Live deployment URL (e.g., Vercel)           |      ✅      | Provided (once build passes)               |
| README.md with Project Overview              |      ✅      | Professional, detailed, matches PDF        |
| README.md with Features Implemented/Stage    |      ✅      | Clearly states Stage 3 completed           |
| README.md with Setup Instructions            |      ✅      | Local run steps + environment setup        |

---

Live Deployement URL: https://finance-tracker-oiwg.onrender.com/auth/login



