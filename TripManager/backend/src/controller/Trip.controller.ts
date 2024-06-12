import { wrap } from "@mikro-orm/core";
import { Router } from "express";
import path from "path";
import { DI } from "..";
import {
  CreateTripDTO,
  CreateTripSchema,
  Trip,
  createDestinationDTOTrip,
} from "../entities";
// import { path } from "pdfkit";
const router = Router();
const PDFDocument = require("pdfkit");
const fs = require("fs");

router.get("/", async (req, res) => {
  const trips = await DI.TripRepository.find(
    {},
    { populate: ["destinations"] }
  );

  res.status(200).send(trips);
});

//create a route that returns all trips having a destination with a specific name
router.get("/destinationName", async (req, res) => {
  const desName = req.query.name;
  if (!desName) {
    return res.status(400).send({ message: "No name provided" });
  }
  const trips = await DI.TripRepository.find(
    {
      destinations: { name: { $like: `%${desName}%` } },
    },
    { populate: ["destinations"] }
  );

  if (trips.length == 0) {
    return res
      .status(404)
      .send({ message: "No trips found for this destination" });
  }
  res.status(200).send(trips);
});

//crate a route that allows to add one or more destination to a trip in a comma separated list of ids
router.patch("/:id/destinations", async (req, res) => {
  const trip = await DI.TripRepository.findOne(req.params.id, {
    populate: ["destinations"],
  });

  if (!trip) {
    return res.status(404).send({ message: "Trip not found" });
  }
  if (req.body.destinations) {
    const destinationIds = req.body.destinations.map((dest: any) => dest.id);
    const newDestinations = await DI.DestinationRepository.find({
      id: { $in: destinationIds },
    });

    const presentDestinations = trip.destinations || [];
    const mergedDestinations = [...presentDestinations, ...newDestinations];
    wrap(trip).assign({ destinations: mergedDestinations }, { em: DI.em });
    await DI.em.persistAndFlush(trip);
    await DI.TripRepository.populate(trip, ["destinations"]);
  }
  res.status(200).send(trip);
});

//a search function that returns all trips that have a speceific name and/or a start date
router.get("/search", async (req, res) => {
  const name = req.query.name;
  const startDate = req.query.start;

  if (!startDate) {
    console.log("start is empty");
    const trips = await DI.em.find(Trip, {
      name: { $like: `%${name}%` },
    });
    if (trips.length == 0) {
      return res.status(404).send({ message: "No trips found for this name" });
    }
    res.status(200).send(trips);
    return;
  }

  let tripsWithDate = [];
  if (!name) {
    console.log("name is empty");

    tripsWithDate = await DI.em.find(Trip, {
      start: startDate as string,
    });
    if (tripsWithDate.length == 0) {
      return res.status(404).send({ message: "No trips found for this date" });
    }

    res.status(200).send(tripsWithDate);
    return;
  }
  let trips = [];

  trips = await DI.em.find(Trip, {
    $and: [{ name: { $like: `%${name}%` } }, { start: startDate as string }],
  });

  if (trips.length == 0) {
    return res.status(404).send({ message: "No trips found for this name" });
  }

  res.status(200).send(trips);
});

//create a route that deletes a destination from a trip
router.delete("/:id/destination/:destId", async (req, res) => {
  const trip = await DI.TripRepository.findOne(req.params.id, {
    populate: ["destinations"],
  });

  if (!trip) {
    return res.status(404).send({ message: "Trip not found" });
  }
  const destination = await DI.DestinationRepository.findOne(
    req.params.destId,
    {
      populate: ["trips"],
    }
  );
  if (!destination) {
    return res.status(404).send({ message: "Destination not found" });
  }
  console.log("asdflksdhfklghsdl");
  console.log(destination);
  if (destination.trips.length === 1) {
    return res
      .status(403)
      .send({ message: "You can't delete the only Trip of a destination !" });
  }
  if (trip.destinations) {
    trip.destinations.remove(destination);
  }
  await DI.em.persistAndFlush(trip);
  await DI.TripRepository.populate(trip, ["destinations"]);
  res.json(trip);
});

router.post("/", async (req, res) => {
  const validatedData = await CreateTripSchema.validate(req.body).catch((e) => {
    res.status(400).json({ errors: e.errors });
  });
  if (!validatedData) {
    return;
  }
  const createTripDTO: CreateTripDTO = {
    ...validatedData,
  };
  // Check if participants is a number
  if (createTripDTO.participants) {
    //convert the string of prarticipants to a number
    const participants = Number(createTripDTO.participants);
    if (isNaN(participants)) {
      return res
        .status(400)
        .send({ message: "Invalid number of participants" });
    }
  }
  const start = new Date(createTripDTO.start);
  const end = new Date(createTripDTO.end);
  if (start.toString() == "Invalid Date" || end.toString() == "Invalid Date") {
    return res.status(400).send({ message: "Invalid date format" });
  }
  if (start > end) {
    return res
      .status(400)
      .send({ message: "Start date must be before end date" });
  }

  const trip = new Trip(createTripDTO);

  const newDestinations: createDestinationDTOTrip[] = [];
  const DestinationIds = [];
  if (createTripDTO.destinations) {
    for (const dest of createTripDTO.destinations) {
      if (dest.id) {
        DestinationIds.push(dest.id);
      }
    }

    const loadedDests = await DI.DestinationRepository.find({
      id: { $in: DestinationIds },
    });

    const mergedDestinations = [...loadedDests, ...newDestinations];
    console.log(mergedDestinations);
    wrap(trip).assign({ destinations: mergedDestinations }, { em: DI.em });
    console.log("555555555555");
    console.log(trip);
    await DI.em.persistAndFlush(trip);
    await DI.TripRepository.populate(trip, ["destinations"]);
    console.log(mergedDestinations);
  } else {
    await DI.em.persistAndFlush(trip);
  }

  res.status(201).send(trip);
});

router.delete("/:id", async (req, res) => {
  // Trip laden
  const existingTrip = await DI.TripRepository.findOne(
    {
      id: req.params.id,
    },
    { populate: ["destinations"] }
  );
  if (!existingTrip) {
    return res
      .status(404)
      .json({ errors: `You can't delete this id: id not found !` });
  }
  //const destinations = existingTrip.destinations;
  const destinations = await DI.DestinationRepository.find(
    {
      trips: { id: req.params.id },
    },
    { populate: ["trips"] }
  );
  console.log(destinations);
  for (const destination of destinations) {
    if (destination.trips.length === 1) {
      return res
        .status(403)
        .send({ message: "You can't delete the only Trip of a destination !" });
    }
  }
  await DI.em.remove(existingTrip).flush();
  return res.status(204).send({});
});

router.put("/:id", async (req, res) => {
  try {
    const trip = await DI.TripRepository.findOne(req.params.id, {
      populate: ["destinations"],
    });

    if (!trip) {
      return res.status(404).send({ message: "Trip not found" });
    }
    const validatedData = await CreateTripSchema.validate(req.body).catch(
      (e) => {
        res.status(400).json({ errors: e.errors });
      }
    );
    if (!validatedData) {
      return;
    }
    const updatedData = req.body;
    //make sure participants are in the right format
    if (updatedData.participants) {
      //convert the string of prarticipants to a number
      const participants = Number(updatedData.participants);
      if (isNaN(participants)) {
        return res
          .status(400)
          .send({ message: "Invalid number of participants " });
      }
    }

    const start = new Date(updatedData.start);
    if (start.toString() == "Invalid Date") {
      return res.status(400).send({ message: "Invalid date format" });
    }
    const end = new Date(updatedData.end);
    if (end.toString() == "Invalid Date") {
      return res.status(400).send({ message: "Invalid date format" });
    }
    if (start > end) {
      return res
        .status(400)
        .send({ message: "Start date must be before end date" });
    }
    // Id should not be altered !
    delete updatedData.id;
    const presentDestinationIds = trip.destinations?.map((dest) => dest.id);
    const presentDestinations = await DI.DestinationRepository.find(
      {
        id: { $in: presentDestinationIds },
      },
      { populate: ["trips"] }
    );

    console.log("99999999999");
    console.log(presentDestinations);
    const destinationIdsToLoad = req.body.destinations.map(
      (dest: any) => dest.id
    );
    const loadedDestinations = await DI.DestinationRepository.find(
      {
        id: { $in: destinationIdsToLoad },
      },
      { populate: ["trips"] }
    );

    console.log("##################");
    console.log(loadedDestinations);

    const destinationsNotToBeDeleted = [];
    for (const dest of presentDestinations) {
      if (dest.trips.length === 1) {
        destinationsNotToBeDeleted.push(dest);
      }
    }
    for (const _dest of destinationsNotToBeDeleted) {
      if (!loadedDestinations.find((dest) => dest.id === _dest.id)) {
        return res
          .status(403)
          .send({
            message:
              "This destination has only this trip , you can't remove it !",
          });
      }
    }

    trip.destinations?.removeAll();
    for (const destination of loadedDestinations) {
      trip.destinations?.add(destination);
    }

    delete updatedData.destinations;
    wrap(trip).assign(updatedData);
    await DI.em.persistAndFlush(trip);
    await DI.TripRepository.populate(trip, ["destinations"]);
    res.status(200).send(trip);
  } catch (e: any) {
    return res.status(400).send({ errors: [e.message] });
  }
});

//delete many destinations from a trip using array of trips in path

router.delete("/:id/destinations/:destinationIds", async (req, res) => {
  const trip = await DI.TripRepository.findOne(req.params.id, {
    populate: ["destinations"],
  });

  if (!trip) {
    return res.status(404).send({ message: "Trip not found" });
  }
  console.log(req.params.destinationIds);
  const destinationIds = req.params.destinationIds.split(",");

  const destinationsToRemove = await DI.DestinationRepository.find(
    {
      id: { $in: destinationIds },
    },
    { populate: ["trips"] }
  );
  if (destinationsToRemove?.length === 0) {
    return res.status(404).send({ message: "No destinations to remove" });
  }

  destinationsToRemove?.forEach((destination) => {
    if (destination.trips.length === 1) {
      return res
        .status(403)
        .send({ message: "You can't delete the only Trip of a destination !" });
    }
    trip.destinations?.remove(destination);
  });

  await DI.em.persistAndFlush(trip);
  await DI.TripRepository.populate(trip, ["destinations"]);
  res.status(204).send(trip);
});
//delete all trips
router.delete("/", async (req, res) => {
  await DI.TripRepository.nativeDelete({});
  return res.status(204).send({});
});

router.get("/generatePdf/:id", async (req, res) => {
  try {
    const trip = await DI.TripRepository.findOne(req.params.id, {
      populate: ["destinations"],
    });
    if (!trip) {
      return res.status(404).send({ message: "Trip not found" });
    }
    const doc = new PDFDocument();

    const filePath = path.join("./output", `output_${trip.name}.pdf`);

    const lineStyle = { width: 550, color: "#FEAE6F" }; 

    // Welcome text
    doc
      .font("Helvetica-Bold")
      .fontSize(30)
      .fillColor("#007bff")
      .text("Welcome to Your Trip Details!");
    doc.moveDown(0.5);

    // Trip Information
    doc
      .font("Helvetica")
      .fontSize(24)
      .fillColor("#028391")
      .text("Trip Details");
    doc
      .font("Helvetica")
      .fontSize(18)
      .fillColor("#028391")
      .text(`Name: ${trip?.name}`);
    doc
      .font("Helvetica")
      .fontSize(18)
      .fillColor("#028391")
      .text(`Description: ${trip?.description}`);
    doc
      .font("Helvetica")
      .fontSize(18)
      .fillColor("#028391")
      .text(`Participants: ${trip?.participants}`);
    doc
      .font("Helvetica")
      .fontSize(18)
      .fillColor("#028391")
      .text(`Start: ${trip?.start}`);
    doc
      .font("Helvetica")
      .fontSize(18)
      .fillColor("#028391")
      .text(`End: ${trip?.end}`);

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(lineStyle);
    doc.moveDown(0.5);

    // Destinations
    const destinationsArray = Array.from(trip?.destinations || []);
    destinationsArray.forEach((destination, index) => {
      // Draw line between destinations
      if (index !== 0) {
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(lineStyle);
        doc.moveDown(0.5);
      }
      doc
        .font("Helvetica")
        .fontSize(24)
        .fillColor("#AF47D2")
        .text(`Destination ${index + 1}`);
      doc
        .font("Helvetica")
        .fontSize(18)
        .fillColor("#AF47D2")
        .text(`Name: ${destination?.name}`);
      doc
        .font("Helvetica")
        .fontSize(18)
        .fillColor("#AF47D2")
        .text(`Description: ${destination?.description}`);
      doc
        .font("Helvetica")
        .fontSize(18)
        .fillColor("#AF47D2")
        .text(`Start: ${destination?.start}`);
      doc
        .font("Helvetica")
        .fontSize(18)
        .fillColor("#AF47D2")
        .text(`End: ${destination?.end}`);
      doc
        .font("Helvetica")
        .fontSize(18)
        .fillColor("#AF47D2")
        .text(`Activities: ${destination?.activities || "None"}`);
    });

    doc.end();

    doc.pipe(fs.createWriteStream(filePath));

    res.status(200).send({ message: "PDF generated successfully" });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(400).send("Error generating PDF");
  }
});

export const TripController = router;
