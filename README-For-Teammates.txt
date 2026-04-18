Hello!

To run this project exactly as it was on the original machine, please follow these steps:

1. Setup the Database:
   - Create a database called `OnlineClothingBrand` in your local SQL Server.
   - Run the `OnlineClothingBrand.sql` file located in the `database` folder to create all the tables.

2. Install Dependencies:
   - Open a terminal in the `frontend` folder and run `npm install`
   - Open a terminal in the `backend` folder and run `npm install`

3. Seed the Database (Important!):
   - To get all 30+ products, categories, and images that we added, open a terminal in the `backend` folder and run:
     `node src/seed_groovy.js`
   - This script will automatically connect to your local database and fill it with all the products exactly as we had them!

4. Run the Project:
   - Frontend: run `npm run dev` in the `frontend` folder.
   - Backend: run `npm run dev` in the `backend` folder.
   
5. Admin Login:
   - Email: admin@store.com
   - Password: admin_hash_99
