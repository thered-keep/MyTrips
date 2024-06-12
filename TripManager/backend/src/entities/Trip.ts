import { object, string } from 'yup';

import { Cascade, Collection, Entity, ManyToMany, Property } from '@mikro-orm/core';

import { BaseEntity } from './BaseEntity';
import { Destination } from './Destination';

@Entity()
export class Trip extends BaseEntity {
  @Property()
  participants?: string;

  @Property()
  description: string;

  @Property()
  start: string;

  @Property()
  end: string;

  @Property()
  name: string;

  // @ManyToMany(() => Destination, 'trips',{owner:true})
  // destinations?: Collection<Destination> = new Collection<Destination>(this);
  @ManyToMany(() => Destination ,destination => destination.trips)
  destinations? = new Collection<Destination>(this);

  constructor({
    name,
    description,
    start,
    end,
    participants = "0",
  }: CreateTripDTO) {
    super();
    this.name = name;
    this.start = start;
    this.end = end;
    this.description = description;
    this.participants = participants;
  }
}

export const CreateTripSchema = object({
  name: string().required(),
  description: string().required(),
  start: string().required(),
  end: string().required(),
});
export type createTripDTODestination = Partial<Pick<Destination, 'id' | 'name' | 'description'>>;

export type CreateTripDTO = {
  description: string;
  name:string;
  destinations?:createTripDTODestination[];
  participants?:string;
  start:string;
  end:string;
};


