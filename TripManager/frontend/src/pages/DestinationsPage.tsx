import { Box, Button, HStack, useDisclosure } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Destination,
  PostDestinationsRequest,
  PutDestinationsDestIdRequest,
} from "../adapter_/api/__generated/index.ts";
import { useApiClient } from "../adapter_/api/useApiClient.ts";
import { BaseLayout } from "../layout/BaseLayout.tsx";
import InfoModal from "./components/AirportInformationModal.tsx";
import { CreateDestinationModal } from "./components/CreateDestinationModal.tsx";
import { DestinationTable } from "./components/DestinationTable.tsx";
export const DestinationPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenInfo,
    onOpen: onOpenInfo,
    onClose: onCloseInfo,
  } = useDisclosure();
  const [modalData, setModalData] = useState(null);
  const client = useApiClient();
  const [dests, setDests] = useState<Destination[]>([]);
  const onLoadData = useCallback(async () => {
    const res = await client.getDestinations();
    console.log(res.data);
    setDests(res.data);
  }, [client]);
  useEffect(() => {
    onLoadData();
  }, [onLoadData]);
  const onCreateDestination = async (data: PostDestinationsRequest) => {
    console.log("begin create destination");
    console.log(data);
    console.log("end create destination");
    try {
      await client.postDestinations(data);
      onClose();
      await onLoadData();
    } catch (e: any) {
      if (e.response && e.response.data) {
        const errorData = e.response.data;

        if (
          errorData.name === "UniqueConstraintViolationException" &&
          errorData.constraint === "destination_name_unique"
        ) {
          alert(
            "A destination with this name already exists. Please choose a different name."
          );
        } else {
          alert(
            "An error occurred while creating the destination. Please try again."
          );
        }
      } else {
        alert(
          "An error occurred while creating the destination. Please try again."
        );
      }
    }
  };
  const onDeleteDestination = async (destination: Destination) => {
    await client.deleteDestinationsDestId(destination.id);
    await onLoadData();
  };

  const [destToBeUpdated, setDestToBeUpdated] = useState<Destination | null>(
    null
  );

  const onClickUpdateDestination = async (destination: Destination) => {
    setDestToBeUpdated(destination);
    onOpen();
  };
  const onClickAeroprtDestination = async (destination: Destination) => {
    try {
      const res = await fetch(`api/destinations/airport/${destination.id}`);

      if (res.status === 200) {
        const data = await res.json();
        setModalData(data);
        onOpenInfo();
        console.log(data);
      } else {
        setModalData(null);
        onOpenInfo();
      }
    } catch (error) {
      setModalData(null);
      onOpenInfo();
    }
  };

  const onUpdateDestination = async (
    destination: PutDestinationsDestIdRequest
  ) => {
    if (!destToBeUpdated) {
      return;
    }
    try {
      await client.putDestinationsDestId(destToBeUpdated?.id, destination);
      onClose();
      await onLoadData();
      setDestToBeUpdated(null);
    } catch (e: any) {
      alert(e.response.data.message);
    }
  };

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
            Add a new destination
          </Button>

          <Link to="/home">
            <Button colorScheme="blue" variant="solid" fontSize="x-large">
              Back
            </Button>
          </Link>
        </HStack>
        <CreateDestinationModal
          initialValues={destToBeUpdated}
          isOpen={isOpen}
          onClose={() => {
            setDestToBeUpdated(null);
            onClose();
          }}
          onSubmit={(updatedDestination) => {
            const updatedTrips =
              updatedDestination.trips?.map((trip) => {
                return { id: trip.id ?? undefined, name: trip.name };
              }) ?? [];
            if (destToBeUpdated) {
              onUpdateDestination({
                ...updatedDestination,
                trips: updatedTrips,
              });
            } else {
              onCreateDestination({
                ...updatedDestination,
                trips: updatedTrips,
              });
            }
          }}
        />
        <InfoModal isOpen={isOpenInfo} onClose={onCloseInfo} data={modalData} />
        <DestinationTable
          data={dests}
          onClickDeleteDestination={onDeleteDestination}
          onClickUpdateDestination={onClickUpdateDestination}
          onClickAeroprtDestination={onClickAeroprtDestination}
        />
      </Box>
    </BaseLayout>
  );
};
