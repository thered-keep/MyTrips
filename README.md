# Project Documentation

## Table of Contents

1. [Overview](#overview)
2. [Environment Variables](#environment-variables)
3. [Backend](#backend)
   - [Database Configuration](#database-configuration)
   - [Setup](#backend-setup)
   - [Data Base entities](#data-base-entities)
   - [Api-endpoints](#backend-api-endpoints)
   - [Testing](#testing)
3. [Frontend](#frontend)
   - [Setup](#frontend-setup)
   - [Running the Frontend](#running-the-frontend)


## Overview

This project consists of a backend service and a frontend application. The backend is built with Node.js and Express, while the frontend is built with React and Vite. The project uses PostgreSQL for the database.
1. Clone the repository:
   ```sh
   git clone https://code.fbi.h-da.de/stmolouss/fwe-ss-24-1116302.git
   cd fwe-ss-24-1116302/TripManager

## Environment variables
In order to define the needed environment variables for the application you need to create a `.env` file in `TripManager/backend` and place these variable inside it :

Below are the environment variables used in the project:

- `environment`: Specifies the environment mode.(prod=production env and test for testing environment)
- `api_key`: The API key for accessing the Ninjas API.
- `api_base_url`: Base URL for the Ninjas API.
- `DB_NAME`: Name of the PostgreSQL database. it should be "postgres"
- `DB_PASSWORD`: Password for the PostgreSQL database.
- `DB_USER`: User for the PostgreSQL database. it should be "postgres"
- `DB_SCHEMA`: Schema for the PostgreSQL database.

### Example .env File
api-key and api_base_url must be as described below .
```plaintext
environment=prod
api_key="A0aYNpGNBs1XMPTvvkpJDw==zxH9zp5wL1rJnpBv"
api_base_url="https://api.api-ninjas.com/v1/"
DB_NAME="postgres"
DB_PASSWORD="choose your password"
DB_USER="postgres"
DB_SCHEMA="anyName"
```
### Database Configuration

Before starting the backend application, you need to set up your PostgreSQL database. Follow these steps to configure the database:

#### Step 1: Create a Schema

1. **Ensure PostgreSQL is installed and running locally.**
   - If not already installed, follow the instructions on the [PostgreSQL official website](https://www.postgresql.org/download/).

2. **Connect to the PostgreSQL server using the default database (`postgres`).**
   - You can use a PostgreSQL client like `psql` or a GUI tool like pgAdmin.

3. **Create a new schema within the `postgres` database.**


#### Step 2: Choose Your Username and Password

1. **Determine the username and password for your PostgreSQL user.**
   - Replace `your_username` and `your_password` with your desired username and password.

#### Step 3: Update the `.env` File

1. **Open the `.env` file in your project directory.**
2. **Update the environment variables with your database configuration:**
   - `DB_NAME`: This should be `postgres` if you created your schema in the default `postgres` database.
   - `DB_USER`: Your PostgreSQL username.
   - `DB_PASSWORD`: Your PostgreSQL password.
   - `DB_SCHEMA`: The name of the schema you created in Step 

#### Step 4: Create TABLES :

```
cd TripManager/backend
npm install
npm run schema:fresh
```

## Backend

### Backend Setup

1. go to backend directory 
    ```sh
    cd backend
    ```
   **NOTE :** after creating database Tables in section [Database Configuration step 4](#database-configuration) folow next command to start backend service
2. change the following environment variable to prod :
   ```
   environment=prod
   ```
3. install node dependencies and run 
   ```sh
    npm install
    npm start
    ```
### Data base Entities

#### Destination

#### Properties
- `name`(required,string,unique): Represents the name of the destination. It must be unique.
- `description`(required,string): Describes the destination.
- `start`(required,string): Indicates the start date or time of the destination.
- `end`(required,string): Indicates the end date or time of the destination.
- `activities`(Optional,string): Comma-separated field to specify activities.
- `trips` (required,Collection): containes associated trips

#### Validation Schema
- `CreateDestinationSchema`: Defines the validation schema for creating a new destination.
  - Requires `name`, `description`, `start`, `end`, and `trips`.
  - `trips` must be an array of objects, each containing a required `id`.
  -`start`, `end` must be valid Dates and `start` < `end`
  - `example body-request`:id in trips must be an id of a present trip
```json
     {
        "name": "Beach Resort",
        "description": "Luxurious beachfront resort",
        "start": "2024-07-01",
        "end": "2024-07-10",
        "activities": "Swimming, sunbathing, beach volleyball",
        "trips":[{
            "id":"123"
        }]
     }
```
#### Trip

#### Properties

- `name` (required,string): Represents the name of the trip. It must be unique.
- `description` (required,string): Describes the trip.
- `start`, `end` must be valid Dates and `start` < `end`
- `participants` (Optional,string): Represents the number of participants in the trip.
- `destinations` (optional,Collection): Containing associated destinations

#### Trip Validation Schema

- `CreateTripSchema`: Defines the validation schema for creating a new trip.

    - **`name`** (required): Represents the name of the trip.
    - **`description`** (required): Describes the trip.
    - **`start`** (required): Indicates the start date or time of the trip.
    - **`end`** (required): Indicates the end date or time of the trip.
    - **`example request-body:`** destination ids must be ids of present destinations 
```json
     {
       "name": "Summer Vacation",
        "description": "A relaxing trip to the beach",
        "start": "2024-07-01",
        "end": "2024-07-10",
        "destinations": [
            {"id": "1",},
            {"id": "2",}
        ],
        "participants": "5"
     }
```
### Backend API Endpoints
The base url for requesting endpoints is : ``localhost:3000/``
- every other endpoint call is base on this url
- for example :
   ``localhost:3000/destinations`` for " Get all Destinations"

#### Destination Controller endpoints

1. **GET All Destinations**
   - **Endpoint:** `GET /destinations/`
   - **Description**: Retrieves all destinations.
   - **Response:** List of destination objects.

2. **GET Destination by ID**
   - **Endpoint:** `GET /destinations/:id`
   - **Description:** Retrieves a destination by its ID.
   - **Response:** Destination object.

3. **POST Create Destination**
   - **Endpoint:** `POST /destinations/`
   - **Description:** Creates a new destination.
   - **Request Body:** Destination data.
   - **Response:** Created destination object.

4. **DELETE Destination by ID**
   - **Endpoint:** `DELETE /destinations/:id`
   - **Description:** Deletes a destination by its ID.
   - **Response:** Success message.

5. **PUT Update Destination by ID**
   - **Endpoint:** `PUT /destinations/:id`
   - **Description:** Updates a destination by its ID.
   - **Request Body:** Updated destination data.
   - **Response:** Updated destination object.

6. **GET Airport Info by Destination ID**
   - **Endpoint:** `GET /destinations/airport/:id`
   - **Description:** Retrieves information on airports found in a specific city.
   - **Response-form:** json collection of airports 
   - **Source api:** external API "https://api.api-ninjas.com/v1/" using api-key "A0aYNpGNBs1XMPTvvkpJDw==zxH9zp5wL1rJnpBv"
#### Trip Controller endpoints


1. **GET All Trips**
   - **Endpoint:** `GET /trips/`
   - **Description:** Retrieves all trips.
   - **Response:** Returns an array of Trip objects.

4. **GET Trips by Destination Name**
   - **Endpoint:** `GET /trips/destinationName?name=`
   - **Description:** Retrieves all trips associated with a destination by its name.
   - **Query Parameters:** 
     - `name`: Name of the destination.
   - **Response:** Returns an array of Trip objects.


5. **PATCH Add Destinations to Trip**
   - **Endpoint:** `PATCH /trips/:id/destinations`
   - **Description:** Adds one or more destinations to a trip.
   - **Request Body:** 
     ```json
     {
       "destinations": [
         { "id": "destination_id_1" },
         { "id": "destination_id_2" },
         ...
       ]
     }
     ```
   - **Response:** Returns the updated Trip object with added destinations.


7. **GET Search Trips**
   - **Endpoint:** `GET /trips/search`
   - **Description:** Searches for trips based on name and start date.
   - **Query Parameters:** 
     - `name`: Name of the trip .
     - `start`: Start date of the trip .
   - **Response:** Returns an array of Trip objects matching the search criteria.
   - **Example:** ``localhost:3000/Trips/search?name=paris&start=2024-05-05``

8. **DELETE Remove Destination from Trip**
   - **Endpoint:** `DELETE /trips/:id/destination/:destId`
   - **Description:** Deletes a destination from a trip.
   - **Parameters:** 
     - `id`: ID of the trip.
     - `destId`: ID of the destination to be deleted.
   - **Response:** Returns the updated Trip object after deletetion
   - **Condition:** destination to remove must have at least another trip.

9. **DELETE Remove multiple Destinations from Trip**
   - **Endpoint:** `DELETE /trips/:id/destinations/:destinationIds`
   - **Description:** Deletes multiple destinations from a trip.
   - **Parameters:** 
     - `id`: ID of the trip.
     - `destinationIds`: Comma-separated list of destination IDs to be deleted (no space between).
   - **Response:** Returns the updated Trip object after deletion.
   - **Condition:**: destination to remove must have at least another trip.

10. **POST Create Trip**
    - **Endpoint:** `POST /trips`
    - **Description:** Creates a new trip.
    - **Request Body:** 
      ```json
      {
        "name": "Trip Name",
        "description": "Trip Description",
        "start": "2024-06-01",
        "end": "2024-06-10",
        "participants": "5",
        "destinations": [
          { "id": "destination_id_1" },
          { "id": "destination_id_2" },
          ...
        ]
      }
      ```
    - **Response:** Returns the created Trip object.

11. **PUT Update Trip**
    - **Endpoint:** `PUT /trips/:id`
    - **Description:** Updates an existing trip.
    - **Request Body:** Same as POST /trips.
    - **Response:** Returns the updated Trip object.
    - **Condition:** cannot remove a destination having that trip as its own trip.

12. **DELETE Delete Trip**
    - **Endpoint:** `DELETE /trips/:id`
    - **Description:** Deletes a trip.
    - **Response:** Returns 204 No Content on successful deletion.
    - **Condition:** cannot delete a trip that has a destination which has only this trip

13. **DELETE Delete All Trips**
    - **Endpoint:** `DELETE /trips`
    - **Description:** Deletes all trips.
    - **Response:** Returns 204 No Content on successful deletion.
    - **Condition:** Only possible after deleting all destinations

14. **GET generate PDF file for a trip**
    - **Endpoint:** `GET /generatePdf/:id`
    - **Description:** generates a pdf file containing trip information.
    - **Response:** Returns 200 "PDF generated successfully" or 400 "Error generating PDF"


### Freestyle Features
#### External Api
It fetches destination data from the database using the provided ID.

1. **Retrieve City Name**: 
   - Once the destination is found, it extracts the city name from the destination object.

2. **API Call**: 
   - It then makes a request to an external API (`api.api-ninjas.com/v1/city?`) to retrieve the country code for the city.
   - Path parameters: api-key and city name

3. **Airport Data Retrieval**: 
   - Using the country code and city name, it makes another request to the API (`api.api-ninjas.com/v1/airports?`)to fetch data for that particular city.
   - Path parameters: api-key , city name and country code
4. **Response Handling**: 
   - If the API calls are successful (`status === 200`), it returns the airports data (array of airport objects ) in that city as a JSON response.
   - If any error occurs during the process, appropriate error messages are sent back with the response status codes.


#### PDF Generation Feature

This feature allows users to generate a PDF document containing trip details and its destinations information.

### Usage

1. **Endpoint**: `/generatePdf/:id`
   
   - **Method**: GET
   - **Params**:
     - `id (path variable)`: The ID of the trip for which the PDF will be generated.
   - **Response**: The API returns a message "PDF generated successfully" if successful .
   - **Output file**: The generated PDF file is located in ``TripManager/backend/output`` under name output_TripName.pdf

### Example Call

### Testing

#### Technologies Used

`Jest` and `Supertest`

#### Trip Tests
located in [tripController.test](TripManager/backend/test/tripController.test.ts?ref_type=heads)

#### Destination Tests
located in [destinationsController.test](TripManager/backend/test/destinationController.test.ts?ref_type=heads)

### Running the Tests

To run the tests, follow these steps:

1. Change Environment variable "environment" to "test"
   ```
   environment= test
   ```
2. go to TripManager/backend
   ```
   cd TripManager/backend
   ```
3. Ensure that all dependencies are installed by running:
   ```bash
   npm install

4. Run this command
   ```bash
   npm run schema:fresh
   npm test
   ```
5. All tests for both trip and destination should run

## Frontend 
this is the video link of how the application looks starting with the home page .
[youtube video](https://youtu.be/v2GybyKB104) 
### Frontend Setup


1. go to backend directory 
    ```sh
    cd frontend
    ```
       
**NOTE :** after successfully  running the backend service as described in section [backend](#backend) folow next command to start frontend service


2. install node dependencies and run 
   ```sh
    npm install
    npm start
    ```
3. after successful run you should see the link to the homepage of the application in the terminal where you have runned the frontend service. Please Follow that Link
## Routes

1. **Home Route**
   - Path: `/` => redirects to `/home`
   - Description: Landing page of the application.
  
2. **Trips Route**
   - Path: `/trips`
   - Description: redirects to trips page.
  
3. **Destinations Route**
   - Path: `/destinations`
   - Description: redirects to destinations page..


## Pages

1. **Home Page**
   - Description: Landing page layout containing welcome message and pages navigation.

2. **Trips Page**
   - Description: displayes lists of trips.
   - Features:
     - lists all of trips
     - search for trips by destination name
     - search for trips by its name
     - search for trips by its start date
     - edit a trip
     - create a trip
     

3. **Destinations Page**
   - Description: displayes lists of destinations.
   - Features:
     - lists all of destinations
     - edit a destination
     - create a destination
     - get airports information in a destination
     - destination names must be unique otherwise you get a pop up message saying : A destination with this name already exists. Please choose a different name.

