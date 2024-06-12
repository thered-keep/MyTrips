import { Box, Flex, HStack } from "@chakra-ui/react";
import { ReactNode } from "react";

export const Header = ({ rightMenu }: { rightMenu?: ReactNode }) => {
  return (
    <HStack bg={"blue.400"} p={8} w={"100%"}>
      <Box flex={1}>Trip Advisor</Box>
      <Flex justifyContent={"flex-end"} flex={1}>
        {rightMenu}
      </Flex>
    </HStack>
  );
};
