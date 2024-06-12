import express from "express";
import http from "http";
import { DestinationController } from "./controller/Destination.controller";
import { TripController } from "./controller/Trip.controller";

import {
  EntityManager,
  EntityRepository,
  MikroORM,
  RequestContext,
} from "@mikro-orm/core";
import { Destination, Trip } from "./entities";
require("dotenv").config();

const PORT = 3000;
export const app = express();

export const DI = {} as {
  server: http.Server;
  orm: MikroORM;
  em: EntityManager;
  DestinationRepository: EntityRepository<Destination>;
  TripRepository: EntityRepository<Trip>;
};

export const initializeServer = async () => {
  // dependency injection setup
  DI.orm = await MikroORM.init();
  DI.em = DI.orm.em;
  DI.DestinationRepository = DI.orm.em.getRepository(Destination);
  DI.TripRepository = DI.orm.em.getRepository(Trip);

  app.use((req, res, next) => {
    console.info(`New request to ${req.path}`);
    next();
  });

  // global middleware
  app.use(express.json());
  app.use((req, res, next) => RequestContext.create(DI.orm.em, next));

  // routes
  app.use("/Trips", TripController);
  app.use("/Destinations", DestinationController);

  DI.server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};
if (process.env.environment !== "test") {
  console.log(process.env.environment);
  initializeServer();
}
