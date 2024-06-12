import {
  Box,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";

const InfoModal = ({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data?: object[] | null;
}) => {
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Your Airport Information</ModalHeader>
          <ModalCloseButton />
          <ModalBody></ModalBody>
          {data ? (
            data.map((airport, index) => (
              <Box key={index} mb={4} borderRadius="md" p={4} ml={50} mr={50}>
                <VStack spacing={2} align="flex-start">
                    <Text fontWeight="bold" fontSize="lg">
                        Name
                    </Text>
                    <Text>{(airport as { name: string }).name}</Text>
                </VStack>
                <Divider mt={2} mb={2} />
                <VStack spacing={2} align="flex-start">
                    <Text fontWeight="bold" fontSize="lg">
                        City
                    </Text>
                    <Text>{(airport as { city: string }).city}</Text>
                </VStack>
                <Divider mt={2} mb={2} />
                <VStack spacing={2} align="flex-start">
                  <Text fontWeight="bold" fontSize="lg">
                    Region
                  </Text>
                  <Text>{(airport as { region: string }).region}</Text>
                </VStack>
                <Divider mt={2} mb={2} />
                <VStack spacing={2} align="flex-start">
                    <Text fontWeight="bold" fontSize="lg">
                        Timezone
                    </Text>
                    <Text>{(airport as { timezone: string }).timezone}</Text>
                </VStack>
                <Divider mt={2} mb={2} />
                <VStack spacing={2} align="flex-start">
                    <Text fontWeight="bold" fontSize="lg">
                        IATA Code
                    </Text>
                    <Text>{(airport as { iata: string }).iata}</Text>
                </VStack>
                <Divider mt={2} mb={2} />
                <VStack spacing={2} align="flex-start">
                    <Text fontWeight="bold" fontSize="lg">
                        Country
                    </Text>
                    <Text>{(airport as { country: string }).country}</Text>
                </VStack>
              </Box>
            ))
          ) : (
            <Box mb={4} borderRadius="md" p={4} ml={50} mr={50}>
              <Text fontWeight="bold" fontSize="lg">
                No Airport for this city
              </Text>{" "}
            </Box>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default InfoModal;
