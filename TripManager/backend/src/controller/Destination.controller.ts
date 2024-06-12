import { wrap } from "@mikro-orm/core";
import { Router } from "express";

import { DI } from "../";
import {
  CreateDestinationDTO,
  CreateDestinationSchema,
  Destination,
} from "../entities";

const router = Router();

router.get("/", async (req, res) => {
  const trips = await DI.DestinationRepository.find(
    {},
    { populate: ["trips"] }
  );
  res.status(200).send(trips);
});
router.get("/:id", async (req, res) => {
  const destination = await DI.DestinationRepository.findOne(req.params.id, {
    populate: ["trips"],
  });
  if (!destination) {
    return res.status(404).send({ message: "Destination not found" });
  }
  res.json(destination);
});
router.post("/", async (req, res) => {
  const validatedData = await CreateDestinationSchema.validate(req.body).catch(
    (e) => {
      res.status(400).json({ errors: e.errors });
    }
  );
  if (!validatedData) {
    return;
  }
  const createDestDTO: CreateDestinationDTO = {
    ...validatedData,
  };

  console.log("after createDTO");
  const start = new Date(createDestDTO.start);
  const end = new Date(createDestDTO.end);
  if (start.toString() == "Invalid Date" || end.toString() == "Invalid Date") {
    return res.status(400).send({ message: "Invalid date format" });
  }
  if (start > end) {
    return res
      .status(400)
      .send({ message: "Start date must be before end date" });
  }

  const dest = new Destination(createDestDTO);

  const TripsIds = [];
  try {
    for (const trip of createDestDTO.trips) {
      if (trip.id) {
        console.log(trip.id);
        TripsIds.push(trip.id);
      }
    }

    const loadedTrips = await DI.TripRepository.find({ id: { $in: TripsIds } });
    if (loadedTrips.length === 0) {
      return res.status(404).send({ message: "No trips found" });
    }
    wrap(dest).assign({ trips: loadedTrips }, { em: DI.em });

    await DI.em.persistAndFlush(dest);
    await DI.DestinationRepository.populate(dest, ["trips"]);
  } catch (e) {
    return res.status(400).send(e);
  }
  res.status(201).send(dest);
});

router.delete("/:id", async (req, res) => {
  // Trip laden
  const existingDestination = await DI.DestinationRepository.findOne({
    id: req.params.id,
  });
  if (!existingDestination) {
    return res
      .status(403)
      .json({ errors: [`You can't delete this id: id not found !`] });
  }
  await DI.em.remove(existingDestination).flush();
  return res.status(204).send({});
});

router.put("/:id", async (req, res) => {
  try {
    const dest = await DI.DestinationRepository.findOne(req.params.id, {
      populate: ["trips"],
    });

    if (!dest) {
      return res.status(404).send({ message: "Destination not found" });
    }
    const validatedData = await CreateDestinationSchema.validate(
      req.body
    ).catch((e) => {
      console.log("ok");
      res.status(400).json({ errors: e.errors });
    });
    if (!validatedData) {
      return;
    }

    const updatedData = req.body;

    if (updatedData.start) {
      const start = new Date(updatedData.start);
      if (start.toString() == "Invalid Date") {
        return res.status(400).send({ message: "Invalid date format" });
      }
    }
    if (updatedData.end) {
      const end = new Date(updatedData.end);
      if (end.toString() == "Invalid Date") {
        return res.status(400).send({ message: "Invalid date format" });
      }
    }
    if (updatedData.start > updatedData.end) {
      return res
        .status(400)
        .send({ message: "Start date must be before end date" });
    }
    // Id should not be altered when testing using Postman
    delete updatedData.id;

    const toLoadTripIds = req.body.trips.map((trip: any) => trip.id);
    const loadedTrips = await DI.TripRepository.find(
      { id: { $in: toLoadTripIds } },
      { populate: ["destinations"] }
    );
    console.log("llllllllllllll");
    console.log(loadedTrips);
    wrap(dest).assign(req.body);
    await DI.em.persistAndFlush(dest);
    res.json(dest);
  } catch (e: any) {
    return res.status(400).send({ errors: [e.message] });
  }
});
router.get("/airport/:id", async (req, res) => {
  const destination = await DI.DestinationRepository.findOne(req.params.id, {
    populate: ["trips"],
  });
  if (!destination) {
    return res.status(404).send({ message: "Destination not found" });
  }

  try {
    const cityName = destination.name;
    const baseApiUrl = process.env.api_base_url;
    const apiKey = process.env.api_key;
    const countryCodeResponse = await fetch(
      baseApiUrl +
        `city?X-Api-Key=${apiKey}&name=${cityName}`
    );
    let countryCode = "";
    if (countryCodeResponse.status === 200) {
      const responseJson = await countryCodeResponse.json();
      countryCode = responseJson[0].country;
    } else {
      console.log("country code not found");
    return res.status(404).send({ message: "No country found for this city" });
    }
    const airportResponse = await fetch(
      baseApiUrl +
        `airports?X-Api-Key=${apiKey}&country=${countryCode}&city=${cityName}`
    );
    if (airportResponse.status === 200) {
      const airportJson = await airportResponse.json();
      res.status(200).send(airportJson);
      
    } else {
      return res.status(404).send({ message: "No airport found for this city" });
    }
  } catch (error) {
    console.error("Error fetching airport data:", error);
          return res.status(400).send({error});
  }
});

export const DestinationController = router;
