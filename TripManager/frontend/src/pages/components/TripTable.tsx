import { Trip } from "../../adapter_/api/__generated";
import {
  HStack,
  IconButton,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";

export const TripTable = ({
  data,
  onClickDeleteTrip,
  onClickUpdateTrip,
}: {
  data: Trip[];
  onClickDeleteTrip: (trip: Trip) => void;
  onClickUpdateTrip: (trip: Trip) => void;
}) => {
  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>name</Th>
            <Th>description</Th>
            <Th>start-date</Th>
            <Th>end-date</Th>
            <Th>participants-number</Th>
            <Th>destinations</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((trip) => {
            return (
              <Tr key={trip.id}>
                <Td>{trip.name}</Td>
                <Td>{trip.description}</Td>
                <Td>{trip.start}</Td>
                <Td>{trip.end}</Td>
                <Td>{trip.participants}</Td>
                <Td>
                  <HStack>
                    {trip.destinations && trip.destinations.map((dest) => (
                      <Tag key={dest.id}>{dest.name}</Tag>
                    ))}
                  </HStack>
                </Td>
                <Td>
                  <IconButton
                    aria-label={"Eintrag löschen"}
                    icon={<DeleteIcon />}
                    onClick={() => onClickDeleteTrip(trip)}
                  />{" "}
                  <IconButton
                    aria-label={"Eintrag bearbeiten"}
                    icon={<EditIcon />}
                    onClick={() => onClickUpdateTrip(trip)}
                  />{" "}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
