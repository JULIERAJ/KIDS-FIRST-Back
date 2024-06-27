# KIDS-FIRST-Back
KIDS FIRST 2024 MVP Backend | [KIDS FIRST 2024 MVP Frontend](https://github.com/JULIERAJ/KIDS-FIRST-Front)


KIDS FIRST is a co-parenting app that aspires to give divorced parents a fair and practical tool to schedule child custody without conflict. Co-parenting requires a significant level of communication and cooperation, which can be a challenge for divorced parents that rather not speak with each other. Lack of communication leads to parents arguing and studies have shown this can negatively affect their child's upbringing and development.

## Requirements:
- Node (at least the 14th version)
- MongoDB connection

<h3>Installation Instructions:</h3>

1. Git clone repository from GitHub
2. Open folder and run `npm i`
3. Configure a MongoDB connection [install demo](https://drive.google.com/file/d/1oU_xFIpGq9Il0aLjSJezifT7o68jkpgs/view)
4. Copy file `.env.example` and rename it to `.env.local`. Or run this command: `cp .env.example .env.local`.
5. Open your `.env.local` file
6. Edit `MONGODB_URI` variable and set it to the value of your MongoDB connection string 
7. Run `npm run start`