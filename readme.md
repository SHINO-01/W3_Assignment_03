<h1>Hotel API Project</h1>
  <p>This project provides a RESTful API for managing hotel records. You can create a hotel, upload images in base64 format, and retrieve hotel details based on either hotel ID or slug. Images are stored in the server filesystem, with paths saved in JSON files for efficient access.</p>

<hr>

  <h2>Table of Contents</h2>
  <ol>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#setup-instructions">Setup Instructions</a></li>
    <li><a href="#using-the-api">Using the API</a></li>
    <li><a href="#file-overview">File Overview</a></li>
    <li><a href="#license">License</a></li>
  </ol>
<hr>

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
  
<h3>Steps to Set Up</h3>

  <ol>
    <li><strong>Clone the Repository</strong>:
      <pre><code>
        git clone https://github.com/SHINO-01/W3_Assignment_03.git
          cd W3_Assignment_03.git
      </code></pre>
    </li>
    <li><strong>Install Dependencies</strong>:
      <p>Run the following command to install all necessary dependencies:</p>
      <pre><code>npm install</code></pre>
    </li>
    <li><strong>Run the Server</strong>:
      <p>Start the server with:</p>
      <pre><code>npm run start</code></pre>
      <p>The server should now be running on <code>http://localhost:3000</code>. or you could use</p>
      <pre><code>npm run dev</code></pre>
    </li>
    <li><strong>Run Tests</strong>:
      <p>To test the application, use:</p>
      <pre><code>npm run test</code></pre>
    </li>
  </ol>

   <hr>

  <h2 id="using-the-api">Using the API</h2>

  <ul>
    <li><strong>Create a Hotel</strong>: Send a <code>POST</code> request to <code>/api/hotel</code> with hotel details and base64 encoded images.</li>
    <li><strong>Retrieve Hotel by ID</strong>: Send a <code>GET</code> request to <code>/api/hotel/:hotelID</code>.</li>
    <li><strong>Retrieve Hotel by Slug</strong>: Send a <code>GET</code> request to <code>/api/hotel/slug/:slug</code>.</li>
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
      "roomImage": ["base64EncodedImageStringHere"]
    }
  ],
  "hotelImages": ["base64EncodedImageStringHere"]
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


