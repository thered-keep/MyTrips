import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import { DI, initializeServer } from "../src";

const mockTrip = {
  name: "Paris",
  description: "city of love",
  participants: "15",
  start: "2024-05-02",
  end: "2024-05-10",
};
let mockTrip2 = {
  name: "London",
  description: "London eye",
  participants: "5",
  start: "2024-05-02",
  end: "2024-05-10",
};
let mockTrip2Id: string;
let mockTripId: string;
let mockTripStartDate: string;

let mockDestination: object;
let mockDestinationId: string;
let mockDestinationName: string;

describe("destinationController", () => {
  beforeAll(async () => {
    await initializeServer();
    DI.orm.config.set("dbName", "express-test-db");
    //DI.orm.config.getLogger().setDebugMode(false);
    DI.orm.config.set("allowGlobalContext", true);
    await DI.orm.config.getDriver().reconnect();
    await DI.orm.getSchemaGenerator().refreshDatabase();

    // Create a mock trip and destination
    const createTripResponse = await request(DI.server)
      .post("/trips")
      .send(mockTrip);
    mockTripId = createTripResponse.body.id;
    mockTripStartDate = createTripResponse.body.start;
    const createTripResponse2 = await request(DI.server)
      .post("/trips")
      .send(mockTrip2);
    mockTrip2Id = createTripResponse2.body.id;
    mockDestination = {
      name: "Berlin",
      description: "Berlin test ",
      start: "2024-05-02",
      end: "2024-05-10",
      trips: [{ id: mockTripId }],
    };

    const createDestinationResponse = await request(DI.server)
      .post("/destinations")
      .send(mockDestination);
    mockDestinationId = createDestinationResponse.body.id;
    mockDestinationName = createDestinationResponse.body.name;
  });

  afterAll(async () => {
    // Delete the mock trip and destination
    await request(DI.server).delete("/destinations/" + mockDestinationId);
    await request(DI.server).delete("/trips/" + mockTrip2Id);
    await request(DI.server).delete("/trips/" + mockTripId);

    await DI.orm.close(true);
    DI.server.close();
  });


  it("should not create a new destination without at least one trip", async () => {
    const destination = {
      name: "Destination 1",
      description: "Destination 1 description",
      start: "2024-05-02T17:12:40.567Z",
      end: "2024-05-07T17:12:40.567Z",
      trips: [],
    };

    const response = await request(DI.server)
      .post("/destinations/")
      .send(destination);

    expect(response.status).toBe(400);
  });

  it("should create a new destination with at least one trip", async () => {
    const destination = {
      name: "Frankfurt",
      description: " description",
      start: "2024-05-02",
      end: "2024-05-07",
      trips: [{ id: mockTripId }],
    };

    const response = await request(DI.server)
      .post("/destinations")
      .send(destination);

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe(destination.name);
    expect(response.body.start).toBe(destination.start);
    expect(response.body.end).toBe(destination.end);
  });
  it("should get all destinations", async () => {
    const response = await request(DI.server).get("/destinations");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
  it("should get a destination by id", async () => {
    const response = await request(DI.server).get(
      "/destinations/" + mockDestinationId
    );
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(mockDestinationId);
    expect(response.body.name).toBe(mockDestinationName);
  });
  it("it should update a destination", async () => {
    const updatedDestination = {
      name: "Updated destination",
      description: "Updated description",
      start: "2024-05-02",
      end: "2024-05-07",
      trips: [{ id: mockTrip2Id }],
    };
    const response = await request(DI.server)
      .put("/destinations/" + mockDestinationId)
      .send(updatedDestination);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(mockDestinationId);
    expect(response.body.name).toBe(updatedDestination.name);
    expect(response.body.start).toBe(updatedDestination.start);
    expect(response.body.end).toBe(updatedDestination.end);
    expect(response.body.trips[0].id).toBe(mockTrip2Id);
  });
  it("should delete a destination", async () => {
    const response = await request(DI.server).delete(
      "/destinations/" + mockDestinationId
    );
    expect(response.status).toBe(204);
    const getResponse = await request(DI.server).get(
      "/destinations/" + mockDestinationId
    );
    expect(getResponse.status).toBe(404);
  });
  it("should not delete a destination that does not exist", async () => {
    const response = await request(DI.server).delete("/destinations/123");
    expect(response.status).toBe(403);
  });
  it("should not get a destination that does not exist", async () => {
    const response = await request(DI.server).get("/destinations/123");
    expect(response.status).toBe(404);
  });
});
