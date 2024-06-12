import { array, object, string } from 'yup';

import { Cascade, Collection, Entity, ManyToMany, ManyToOne, Property, Unique } from '@mikro-orm/core';

import { BaseEntity } from './BaseEntity';
import { Trip } from './Trip';
import { PrimaryKey } from "@mikro-orm/core";

@Entity()
export class Destination extends BaseEntity {
  @Property()
  @Unique()
  name: string;

  @Property()
  description: string;

  @Property()
  start: string;

  @Property()
  end: string;

  @Property()
  activities?: string;
  //@Property()
  //trips: Partial<Pick<Trip, "name" | "description" | "id">>[] | undefined;
  // @ManyToMany(() => Trip,trip=>trip.destinations)

  // //trips=new Collection<Trip>(this);
   @ManyToMany(() => Trip, (trip) => trip.destinations ,{owner:true	})
  // @ManyToMany({ entity: () => Trip, mappedBy: (o) => o.destinations })

  // @ManyToMany({
  //   entity: () => Trip,
  //   pivotTable: "trip_destination",
  //   joinColumn: "destinatino_id",
  //   inverseJoinColumn: "trip_id",
  // })

  //trips = new Collection<Trip>(this);
  trips = new Collection<Trip>(this);

  constructor({
    name,
    description,
    start,
    end,
    activities = "",
  }: CreateDestinationDTO) {
    super();
    this.name = name;
    this.description = description;
    this.activities = activities;
    this.end = end;
    this.start = start;
  }
}

export const CreateDestinationSchema = object({
  name: string().required(),
  description: string().required(),
  start: string().required(),
  end: string().required(),
  trips: array()
                .of(object({id: string().required()} ))
                .min(1)
                .required(),
});
export type createDestinationDTOTrip = Partial<Pick<Trip, 'id' | 'name' | 'description'>>;

export type CreateDestinationDTO = {
  description: string;
  name:string;
  activities?:string;
  start:string;
  end:string;
  trips:createDestinationDTOTrip[];
};


