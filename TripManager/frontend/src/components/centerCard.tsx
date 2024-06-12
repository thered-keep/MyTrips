import { Box, Center } from "@chakra-ui/react";

export const CenterCard = ({ children }: { children: React.ReactNode }) => {
  return (
    //center , minH 400,w =400 ,borderradsius lg,bordershadow md,p=4,bg white,_dark= bg : gray.700
    <Center h={"full"}>
      <Box
        minH={400}
        w={400}
        borderRadius={"lg"}
        boxShadow={"md"}
        p={4}
        bg={"white"}
        _dark={{ bg: "gray.700" }}
      >
        {children}
      </Box>
    </Center>
  );
};
