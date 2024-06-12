import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";
import request from "supertest";
import { DI, initializeServer } from "../src";

let destination2Id: string;
let destinationId: string;
let destinationStartDate: string;
let tripName: string;
let trip1: object;
let tripId1: string;
let tripName2: string;
let tripId2: string;
let destinationId3: string;
let destinationName: string;
describe("tripController", () => {
  beforeAll(async () => {
    await initializeServer();
    DI.orm.config.set("dbName", "express-test-db");
    DI.orm.config.set("allowGlobalContext", true);
    await DI.orm.config.getDriver().reconnect();
    await DI.orm.getSchemaGenerator().refreshDatabase();

    //create a trip
    trip1 = {
      name: "paris",
      description: "paris test ",
      start: "2024-05-02",
      end: "2024-05-10",
      destinations: [],
    };
    const createTripResponse = await request(DI.server)
      .post("/trips")
      .send(trip1);
    tripId1 = createTripResponse.body.id;
    tripName = createTripResponse.body.name;

    // Create a destination 1
    const mockDestination = {
      name: "Paris",
      description: "city of love",
      participants: "15",
      start: "2024-05-02",
      end: "2024-05-10",
      trips: [{ id: tripId1 }],
    };
    const createDestinationResponse = await request(DI.server)
      .post("/destinations")
      .send(mockDestination);
    destinationId = createDestinationResponse.body.id;
    destinationStartDate = createDestinationResponse.body.start;

    // Create a destination 2
    let mockDestination2 = {
      name: "London",
      description: "London eye",
      participants: "5",
      start: "2024-05-02",
      end: "2024-05-10",
      trips: [{ id: tripId1 }],
    };
    const createDestinationResponse2 = await request(DI.server)
      .post("/destinations")
      .send(mockDestination2);
    destination2Id = createDestinationResponse2.body.id;
  });

  afterAll(async () => {
    // Delete the mock trip and destination
    await request(DI.server).delete("/destinations/" + destinationId);

    await request(DI.server).delete("/trips/" + destinationId);

    await DI.orm.close(true);
    DI.server.close();
  });
  afterEach(async () => {
    await DI.DestinationRepository.nativeDelete({});
    await DI.TripRepository.nativeDelete({});
  });
  beforeEach(async () => {
    trip1 = {
      name: "paris",
      description: "paris test ",
      start: "2024-05-02",
      end: "2024-05-10",
      destinations: [],
    };
    const createTripResponse = await request(DI.server)
      .post("/trips")
      .send(trip1);
    tripId1 = createTripResponse.body.id;
    tripName = createTripResponse.body.name;

    // Create a destination 1
    const mockDestination = {
      name: "Paris",
      description: "city of love",
      participants: "15",
      start: "2024-05-02",
      end: "2024-05-10",
      trips: [{ id: tripId1 }],
    };
    const createDestinationResponse = await request(DI.server)
      .post("/destinations")
      .send(mockDestination);
    destinationId = createDestinationResponse.body.id;
    destinationStartDate = createDestinationResponse.body.start;

    // Create a destination 2
    let mockDestination2 = {
      name: "London",
      description: "London eye",
      participants: "5",
      start: "2024-05-02",
      end: "2024-05-10",
      trips: [{ id: tripId1 }],
    };
    const createDestinationResponse2 = await request(DI.server)
      .post("/destinations")
      .send(mockDestination2);
    destination2Id = createDestinationResponse2.body.id;
    //create a third destination
    let mockDestination3 = {
      name: "Berlin",
      description: "Berlin eye",
      participants: "5",
      start: "2024-05-02",
      end: "2024-05-10",
      trips: [{ id: tripId2 }],
    };
    const createDestinationResponse3 = await request(DI.server)
      .post("/destinations")
      .send(mockDestination3);
    destinationId3 = createDestinationResponse3.body.id;
  });
  it("should create a trip without destinations", async () => {
    const trip = {
      name: "Paris",
      description: "city of love",
      start: "2024-05-02",
      end: "2024-05-10",
    };
    const response = await request(DI.server).post("/trips").send(trip);
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe(trip.name);
    expect(response.body.start).toBe(trip.start);
    expect(response.body.end).toBe(trip.end);
  });
  it("should create a trip with destinations", async () => {
    const trip = {
      name: "Paris",
      description: "city of love",
      start: "2024-05-02",
      end: "2024-05-10",
      destinations: [{ id: destinationId }],
    };
    const response = await request(DI.server).post("/trips").send(trip);
    console.log("qqqqqqqqqqqqqqqqqqqqqqq");
    console.log(response.body);
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe(trip.name);
    expect(response.body.start).toBe(trip.start);
    expect(response.body.end).toBe(trip.end);
    expect(response.body.destinations).toBeDefined();
    expect(response.body.destinations.length).toBe(1);
  });
  it("should update a trip with destinations", async () => {
    const trip = {
      name: "London",
      description: "city of london",
      start: "2024-05-02",
      end: "2024-05-10",
      destinations: [
        { id: destinationId },
        { id: destination2Id },
        { id: destinationId3 },
      ],
    };
    const response = await request(DI.server)
      .put("/trips/" + tripId1)
      .send(trip);
    expect(response.status).toBe(200);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe(trip.name);
    expect(response.body.start).toBe(trip.start);
    expect(response.body.end).toBe(trip.end);
    expect(response.body.destinations).toBeDefined();
    expect(response.body.destinations.length).toBe(2);
    expect(response.body.destinations[0].id).toBe(destinationId);
  });
  // mockdestination2 cannot be removed from the trip
  it("should not remove a destintion from a trip, which has a single trip, in PUT", async () => {
    const trip = {
      name: "london",
      description: "city of love",
      start: "2024-05-02",
      end: "2024-05-10",
      destinations: [{ id: destinationId }],
    };
    const response = await request(DI.server)
      .put("/trips/" + tripId1)
      .send(trip);
    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "This destination has only this trip , you can't remove it !"
    );
  });
  it("should get all trips", async () => {
    const response = await request(DI.server).get("/trips");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });
  it("should add many destinations to a trip", async () => {
    const destinations = {
      destinations: [{ id: destinationId }, { id: destination2Id }],
    };
    //create a second trip
    const trip = {
      name: "NewYork",
      description: " test ",
      start: "2024-05-02",
      end: "2024-05-10",
      destinations: [],
    };
    const createTripResponse2 = await request(DI.server)
      .post("/trips")
      .send(trip);
    const newTripId = createTripResponse2.body.id;
    const response = await request(DI.server)
      .patch("/trips/" + newTripId + "/destinations")
      .send(destinations);
    expect(response.status).toBe(200);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe(trip.name);
    expect(response.body.start).toBe(trip.start);
    expect(response.body.end).toBe(trip.end);
    expect(response.body.destinations).toBeDefined();
    expect(response.body.destinations.length).toBe(2);
  });
});
describe("tripController delete requests", () => {
  beforeAll(async () => {
    await initializeServer();
    DI.orm.config.set("dbName", "express-test-db");
    //DI.orm.config.getLogger().setDebugMode(false);
    DI.orm.config.set("allowGlobalContext", true);
    await DI.orm.config.getDriver().reconnect();
    await DI.orm.getSchemaGenerator().refreshDatabase();

    //create a trip
    trip1 = {
      name: "paris",
      description: "paris test ",
      start: "2024-05-02",
      end: "2024-05-10",
      destinations: [],
    };
    const createTripResponse = await request(DI.server)
      .post("/trips")
      .send(trip1);
    tripId1 = createTripResponse.body.id;
    tripName = createTripResponse.body.name;
    //create a second trip
    const mockTrip2 = {
      name: "london",
      description: "london test ",
      start: "2024-05-02",
      end: "2024-05-10",
      destinations: [],
    };
    const createTripResponse2 = await request(DI.server)
      .post("/trips")
      .send(mockTrip2);
    tripId2 = createTripResponse2.body.id;
    tripName2 = createTripResponse2.body.name;
  });
  afterAll(async () => {
    // Delete the mock trip and destination
    await request(DI.server).delete("/trips/");

    await DI.orm.close(true);
    DI.server.close();
  });
  it("should delete a trip", async () => {
    const response = await request(DI.server).delete("/trips/" + tripId1);
    expect(response.status).toBe(204);
  });
  it("should not delete a trip that does not exist", async () => {
    const response = await request(DI.server).delete("/trips/" + tripId1);
    expect(response.status).toBe(404);
    expect(response.body.errors).toBe(
      "You can't delete this id: id not found !"
    );
  });
  it("should delete many destinations", async () => {
    //create a second trip
    const Trip2 = {
      name: "Hamburg",
      description: "hamburg test ",
      start: "2024-05-02",
      end: "2024-05-10",
      destinations: [],
    };
    const createTripResponse2 = await request(DI.server)
      .post("/trips")
      .send(Trip2);
    const Trip2Id = createTripResponse2.body.id;

    //create the first destination and bind it to 2 trips to be able to remove it from the other trip
    const mockDestination = {
      name: "Paris",
      description: "city of love",
      participants: "15",
      start: "2024-05-02",
      end: "2024-05-10",
      trips: [{ id: Trip2Id }, { id: tripId2 }],
    };
    const createDestinationResponse = await request(DI.server)
      .post("/destinations")
      .send(mockDestination);
    destinationId = createDestinationResponse.body.id;
    //create the second destination and bind it to 2 trips to be able to remove it from the other trip
    let mockDestination2 = {
      name: "London",
      description: "London eye",
      participants: "5",
      start: "2024-05-02",
      end: "2024-05-10",
      trips: [{ id: Trip2Id }, { id: tripId2 }],
    };
    const createDestinationResponse2 = await request(DI.server)
      .post("/destinations")
      .send(mockDestination2);
    destination2Id = createDestinationResponse2.body.id;

    const deletePath = `/trips/${Trip2Id}/destinations/${destination2Id},${destinationId}`;
    const response2 = await request(DI.server).delete(deletePath);
    expect(response2.status).toBe(204);
  });
  it("should not delete a trip which has a destination with a single trip", async () => {
    //after the last test the two destinations are left with only one trip which is the trip with id tripId2
    const response = await request(DI.server).delete("/trips/" + tripId2);
    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "You can't delete the only Trip of a destination !"
    );
  });
});
describe("tripController search requests", () => {
  beforeAll(async () => {
    await initializeServer();
    DI.orm.config.set("dbName", "express-test-db");
    //DI.orm.config.getLogger().setDebugMode(false);
    DI.orm.config.set("allowGlobalContext", true);
    await DI.orm.config.getDriver().reconnect();
    await DI.orm.getSchemaGenerator().refreshDatabase();

    //create a trip
    trip1 = {
      name: "france tour",
      description: "paris test ",
      start: "2024-05-02",
      end: "2024-05-10",
      destinations: [],
    };
    const createTripResponse = await request(DI.server)
      .post("/trips")
      .send(trip1);
    tripId1 = createTripResponse.body.id;
    tripName = createTripResponse.body.name;
    //create a second trip
    const trip2 = {
      name: "london",
      description: "london test ",
      start: "2024-05-02",
      end: "2024-05-10",
      destinations: [],
    };
    const createTripResponse2 = await request(DI.server)
      .post("/trips")
      .send(trip2);
    tripId2 = createTripResponse2.body.id;
    tripName2 = createTripResponse2.body.name;

    // Create a destination
    const mockDestination = {
      name: "paris",
      description: "city of light",
      participants: "15",
      start: "2024-05-02",
      end: "2024-05-10",
      trips: [{ id: tripId1 }],
    };
    const createDestinationResponse = await request(DI.server)
      .post("/destinations")
      .send(mockDestination);
    destinationId = createDestinationResponse.body.id;
    destinationName = createDestinationResponse.body.name;
  });
  afterAll(async () => {
    // Delete the mock trip and destination
    await request(DI.server).delete("/trips/");

    await DI.orm.close(true);
    DI.server.close();
  });
  it("should search for a trip by name", async () => {
    const response = await request(DI.server).get(
      `/trips/search?name=${tripName}`
    );
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe(tripName); //which is france tour
  });
  it("should search for a trip by start date", async () => {
    const response = await request(DI.server).get(
      "/trips/search?start=2024-05-02"
    );
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].name).toBe(tripName); //which is france tour
    expect(response.body[1].name).toBe(tripName2); //which is london
  });
  it("should search for a trip by name and start date", async () => {
    const response = await request(DI.server).get(
      `/trips/search?name=${tripName}&start=2024-05-02`
    );
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe(tripName); //which is france tour
    expect(response.body[0].start).toBe("2024-05-02");
  });
  it("should not find any trip with false name ", async () => {
    const response = await request(DI.server).get("/trips/search?name=berlin");
    expect(response.status).toBe(404);
  });
  it("should not find any trip with false start date ", async () => {
    const response = await request(DI.server).get(
      "/trips/search?start=2024-05-03"
    );
    expect(response.status).toBe(404);
  });
  it("should not find any trip with false name and start date ", async () => {
    const response = await request(DI.server).get(
      "/trips/search?name=berlin&start=2024-05-03"
    );
    expect(response.status).toBe(404);
  });
  it("should search for a trip by destination name", async () => {
    const response = await request(DI.server).get(
      `/trips/destinationName?name=${destinationName}`
    );
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe(tripName); //which is france tour
    expect(response.body[0].destinations[0].name).toBe(destinationName); //which is paris
  });
  it("should not find any trip with false destination name ", async () => {
    const response = await request(DI.server).get(
      "/trips/destination?name=berlin"
    );
    expect(response.status).toBe(404);
  });
});
