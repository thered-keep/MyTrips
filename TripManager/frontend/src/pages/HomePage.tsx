import { Box, Button, HStack, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export const HomePage = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bg="cyan.50"
    >
      <Box
        bg="cyan.100"
        p={5}
        shadow="md"
        borderWidth="1px"
        borderRadius="md"
        width={"50vw"}
        height={"80vh"}
      >
        <VStack spacing={5}>
          <HStack spacing={5} justifyContent="center">
            <Link to="/trips">
              <Button colorScheme="teal" variant="solid" fontSize="xx-large">
                Trips
              </Button>
            </Link>
            <Link to="/destinations">
              <Button colorScheme="teal" variant="solid" fontSize="xx-large">
                Destinations
              </Button>
            </Link>
          </HStack>
          <h2 style={{ fontSize: "2rem" }}>Welcome to Our Travel App</h2>
          <img
            src="https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?cs=srgb&dl=pexels-te-lensfix-380994-1371360.jpg&fm=jpg"
            alt="Trip"
          />
        </VStack>
      </Box>
    </Box>
  );
};
