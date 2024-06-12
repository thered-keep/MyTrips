import {  Options } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { Destination ,Trip,BaseEntity} from "./entities";
require("dotenv").config();

const options: Options = {
  type: "postgresql",
  dbName: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USER,
  schema:process.env.DB_SCHEMA,
  entities:[Trip,Destination,BaseEntity],
  debug: true,
};

export default options;