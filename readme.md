<h1>Hotel API Project</h1>
  <p>This project provides a RESTful API for managing hotel records. You can create a hotel, upload images in base64 format, and retrieve hotel details based on either hotel ID or slug. Images are stored in the server filesystem, with paths saved in JSON files for efficient access.</p>

  <h2 id="project-structure">Project Structure</h2>
  <p>Here’s a quick overview of the project structure and what they look like!</p>
  
```
W3_Assignment_03/
├── data/(Untracked)
|   └── [hotel-id].json (dynamic files created per hotel)
├── dist(Untracked)
├── node_modules(Untracked)
├── source/
|   ├── __tests__/
|   |   ├── hotel_POST.test.ts
|   |   ├── hotel_GET.test.ts
|   |   ├── hotel_PUT.test.ts
|   |   └── hotel_POST_UploadImg.test.ts
│   ├── controllers/
│   │   └── hotelController.ts
│   ├── middlewares/
│   │   └── uploadImg.ts
│   ├── models/
│   │   └── hotelModel.ts
│   ├── routes/
│   │   └── hotelRoutes.ts 
│   └── index.ts
├── test-img/
|   └── image01.png
|   └── image02.png.......
├── uploads/
|   ├──images/
|   |  └── [hotel_id].png
├── .gitignore
├── eslingt.config.mjs
├── package.json
├── package.lock.json
├── tsconfig.json
├── readme.md
└── jest.config.mjs
```
 <h2 id="setup-instructions">Setup Instructions</h2>

  <h3>Prerequisites</h3>
  <ul>
    <li><strong>Node.js</strong> (v14.x or above)</li>
    <li><strong>npm</strong> (v6.x or above)</li>
  </ul>
  
<h2>1. API Instructions</h2>
        <h3>1.1 Installation</h3>
        <pre>
git clone https://github.com/SHINO-01/W3_Assignment_03.git<API_REPO_URL>
cd W3_Assignment_03<API_FOLDER>
npm install
        </pre>
        <h3>1.2 Running the API</h3>
        <pre>
# run in development mode
npm run dev
        </pre>
        <p>The API will be accessible at <span class="code">http://localhost:3000</span>.</p>
        <h3>1.3 Sample Endpoints</h3>
        <ul>
            <li><code>GET /api/hotel/:hotelId</code> - Fetch details for a specific hotel.</li>
            <li><code>POST /api/hotel</code> - Create a new hotel.</li>
            <li><code>PUT /api/hotel/:hotelId</code> - Update an existing hotel.</li>
        </ul>
        <h3>1.4 Testing the API</h3>
        <p>Run tests using Jest:</p>
        <pre>
npm test
        </pre>
        <p>Example test command:</p>
        <pre>
npx jest ./source/__tests__/hotel_GET.test.ts
        </pre>
        <h3>1.5 Known Issues</h3>
        <ul>
            <li>Images must be stored in the <code>uploads/images</code> folder for static file serving.</li>
            <li>Images must be stored in the test-img folder for the POST(Create Hotel) Function to work</li>
            <li>Ensure <code>cors</code> is properly configured when accessing the API from a different origin.</li>
        </ul>

  <p>Example request format for creating a hotel:</p>

  <pre><code>
{
  "title": "Sunshine Inn",
  "description": "A cozy hotel by the beach.",
  "guestCount": 4,
  "bedroomCount": 2,
  "bathroomCount": 1,
  "amenities": ["WiFi", "Pool", "Air Conditioning"],
  "host": "John Doe",
  "address": "123 Beach Ave, Miami, FL",
  "latitude": 25.7617,
  "longitude": -80.1918,
  "rooms": [
    {
      "roomTitle": "Deluxe Suite",
      "bedroomCount": 1,
      "bathroomCount": 1,
      "roomImage": ["Image Path"]
    }
  ],
  "hotelImages": ["Image Path"]
}
  </code></pre>

  <hr>

  <h2 id="file-overview">File Overview</h2>

  <ul>
    <li><strong>source/controllers/hotelController.ts</strong>: Contains logic for creating and retrieving hotel records.</li>
    <li><strong>source/models/hotelModel.ts</strong>: Defines <code>Hotel</code> and <code>Room</code> TypeScript interfaces for data validation.</li>
    <li><strong>source/routes/hotelRoutes.ts</strong>: Sets up API routes for hotel-related endpoints.</li>
    <li><strong>source/uploads/images/</strong>: Stores uploaded hotel images.</li>
    <li><strong>source/utils/dirnameHelper.ts</strong>: Provides helper function for managing paths.</li>
    <li><strong>source/index.ts</strong>: Main server file, initializes the Express app and defines routes.</li>
    <li><strong>source/__tests__</strong>: Stores the Unit Test files</li>
  </ul>

  <hr>

  <h2 id="license">License</h2>
  <p>This project is licensed under the MIT License.</p>


