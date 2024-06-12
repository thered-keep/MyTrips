import { Destination } from "../../adapter_/api/__generated";
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
import { DeleteIcon, EditIcon, SearchIcon } from "@chakra-ui/icons";

export const DestinationTable = ({
  data,
  onClickDeleteDestination,
  onClickUpdateDestination,
  onClickAeroprtDestination,
}: {
  data: Destination[];
  onClickDeleteDestination: (destination: Destination) => void;
  onClickUpdateDestination: (destination: Destination) => void;
  onClickAeroprtDestination: (destination: Destination) => void;
}) => {
  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>name</Th>
            <Th>description</Th>
            <Th>trips</Th>
            <Th>activities</Th>
            <Th>start-date</Th>
            <Th>end-date</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((destination) => {
            return (
              <Tr key={destination.id}>
                <Td>{destination.name}</Td>
                <Td>{destination.description}</Td>

                <Td>
                  <HStack>
                    {destination.trips &&
                      destination.trips.map((trip) => (
                        <Tag key={trip.id}>{trip.name}</Tag>
                      ))}
                  </HStack>
                </Td>
                <Td>{destination.activities}</Td>
                <Td>{destination.start}</Td>
                <Td>{destination.end}</Td>
                <Td>
                  <IconButton
                    aria-label={"Eintrag löschen"}
                    icon={<DeleteIcon />}
                    onClick={() => onClickDeleteDestination(destination)}
                  />{" "}
                  <IconButton
                    aria-label={"Eintrag bearbeiten"}
                    icon={<EditIcon />}
                    onClick={() => onClickUpdateDestination(destination)}
                  />{" "}
                  <IconButton
                    aria-label={"Eintrag bearbeiten"}
                    icon={<SearchIcon />} 
                    onClick={() => onClickAeroprtDestination(destination)}
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
