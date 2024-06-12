import { Box, Button, HStack, Input, useDisclosure } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Destination,
  PostTripsRequest,
  PutTripsTripIdRequest,
  Trip,
} from "../adapter_/api/__generated";
import { useApiClient } from "../adapter_/api/useApiClient.ts";
import { BaseLayout } from "../layout/BaseLayout.tsx";
import { CreateTripModal } from "./components/CreateTripModal.tsx";
import { TripTable } from "./components/TripTable.tsx";
export const TripsPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const client = useApiClient();
  const [trips, setTrips] = useState<Trip[]>([]);
  const onLoadData = useCallback(async () => {
    const res = await client.getTrips();
    console.log(res.data);
    setTrips(res.data);
  }, [client]);

  useEffect(() => {
    onLoadData();
  }, [onLoadData]);

  const onCreateTrip = async (data: PostTripsRequest) => {
    console.log("begin create trip");
    console.log(data);
    console.log("end create trip");
    try {
      await client.postTrips(data);
      onClose();
      await onLoadData();
    } catch (e: any) {
      alert(e.response.data.message);
    }
  };

  const onDeleteTrip = async (trip: Trip) => {
    console.log("begin delete trip");
    try {
      await client.deleteTripsTripId(trip.id);
      await onLoadData();
    } catch (e) {
      alert("Error: You can't delete the only Trip of a destination !");
    }
  };

  const [tripToBeUpdated, setTripToBeUpdated] = useState<Trip | null>(null);

  const onClickUpdateTrip = async (trip: Trip) => {
    setTripToBeUpdated(trip);
    onOpen();
  };

  const onUpdateTrip = async (trip: PutTripsTripIdRequest) => {
    if (!tripToBeUpdated) {
      return;
    }
    try {
      await client.putTripsTripId(tripToBeUpdated?.id, trip);
      console.log("begin update trip");
      console.log(trip);
      onClose();
      await onLoadData();
      setTripToBeUpdated(null);
    } catch (e: any) {
      alert(e.response.data.message);
    }
  };
  const [searchName, setSearchName] = useState("");
  const [searchStart, setSearchStart] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  console.log(searchName);
  console.log(searchStart);
  const searchTripName = async (searchName: string, searchStart: string) => {
    try {
      const response = await client.getTripsSearchNameStart(
        searchName,
        searchStart
      );
      console.log(response.data);
      if (response.status != 200) {
        console.log("no trips found");
        setTrips([]);
        return;
      }
      setTrips(response.data);
    } catch (err) {
      setTrips([]);
    }
  };

  const searchTripsWithDestination = async (name: string) => {
    if (name === "") {
      const allTrips = await client.getTrips();
      setTrips(allTrips.data);
      return;
    }
    try {
      const response = await client.getTripsDestinationName(name);
      console.log(response.data);
      if (response.status != 200) {
        setTrips([]);
        return;
      }
      setTrips(response.data);
    } catch (err) {
      setTrips([]);
    }
  };
  useEffect(() => {
    console.log("searchDestination: " + searchDestination);
    searchTripsWithDestination(searchDestination);
  }, [searchDestination]);
  useEffect(() => {
    console.log("searchName: " + searchName);
    console.log("searchStart: " + searchStart);
    searchTripName(searchName, searchStart);
  }, [searchName, searchStart]);
  return (
    <BaseLayout>
      <Box>
        <HStack justifyContent={"space-between"}>
          <Button
            variant={"solid"}
            colorScheme={"blue"}
            fontSize="x-large"
            onClick={() => {
              onOpen();
            }}
          >
            Add a new trip
          </Button>

          <Link to="/home">
            <Button colorScheme="blue" variant="solid" fontSize="x-large">
              Back
            </Button>
          </Link>
        </HStack>
        <Input
          colorScheme="blue"
          size="md"
          variant="ghost"
          margin={4}
          borderRadius="md"
          borderWidth="1px"
          borderColor="gray.300"
          _hover={{ borderColor: "gray.400" }}
          _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
          width={"20%"}
          type="text"
          placeholder="search trip"
          onChange={(e) => setSearchName(e.target.value)}
        />

        <Input
          variant="ghost"
          margin={4}
          placeholder="search start date"
          onChange={(e) => setSearchStart(e.target.value)}
          type="date"
          colorScheme="blue"
          size="md"
          borderRadius="md"
          borderWidth="1px"
          borderColor="gray.300"
          _hover={{ borderColor: "gray.400" }}
          _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
          width={"20%"}
        />

        <Input
          type="text"
          margin={4}
          variant="ghost"
          placeholder="search destination"
          onChange={(e) => setSearchDestination(e.target.value)}
          colorScheme="blue"
          size="md"
          borderRadius="md"
          borderWidth="1px"
          borderColor="gray.300"
          _hover={{ borderColor: "gray.400" }}
          _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
          width={"20%"}
        />
        <CreateTripModal
          initialValues={tripToBeUpdated}
          isOpen={isOpen}
          onClose={() => {
            setTripToBeUpdated(null);
            onClose();
          }}
          onSubmit={(updatedTrip) => {
            const updatedDests = updatedTrip.destinations;
            const updatedDestIds =
              updatedTrip.destinations?.map((destination: Destination) => {
                return {
                  id: destination.id ?? undefined,
                  label: destination.name,
                  value: destination.name,
                };
              }) ?? [];
            if (tripToBeUpdated) {
              console.log("update trip");
              console.log(updatedTrip);
              console.log("update destinaionaoindoi");
              console.log(updatedDests);
              onUpdateTrip({
                ...updatedTrip,
                destinations: updatedDestIds,
                start: updatedTrip.start ?? "",
                end: updatedTrip.end ?? "",
              });
            } else {
              onCreateTrip({
                ...updatedTrip,
                destinations: updatedDestIds,
                start: updatedTrip.start ?? "",
                end: updatedTrip.end ?? "",
              });
            }
          }}
        />

        <TripTable
          data={trips}
          onClickDeleteTrip={onDeleteTrip}
          onClickUpdateTrip={onClickUpdateTrip}
        />
      </Box>
    </BaseLayout>
  );
};
