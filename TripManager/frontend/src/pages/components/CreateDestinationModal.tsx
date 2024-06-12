import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  VStack,
} from "@chakra-ui/react";
import * as Yup from "yup";
import { OptionBase } from "chakra-react-select";
import { Form, Formik } from "formik";
import { InputControl, SubmitButton, TextareaControl } from "formik-chakra-ui";
import { GroupBase } from "react-select";
import { Destination, Trip } from "../../adapter_/api/__generated/api.ts";
import { useApiClient } from "../../adapter_/api/useApiClient.ts";
import ReactSelectControl from "../../components/ReactSelectControl.tsx";
import { parse, isDate } from "date-fns";

interface TagOption extends OptionBase {
  id?: string;
  label: string;
  value: string;
}

type destination_type = Omit<Destination, "id" | "createdAt" | "updatedAt"> &
  Partial<Pick<Destination, "id">>;
const parseDateString = (value: string, originalValue: string) => {
  const parsedDate = parse(originalValue, "yyyy-MM-dd", new Date());
  return isDate(parsedDate) ? parsedDate : new Date("");
};
export const CreateDestinationModal = ({
  initialValues,
  onSubmit,
  ...restProps
}: Omit<ModalProps, "children"> & {
  initialValues: destination_type | null;
  onSubmit?: (data: destination_type) => void;
}) => {
  const client = useApiClient();
  const validationSchema = Yup.object({
    trips: Yup.array()
      .min(1, "At least one trip is required")
      .required("Trips are required"),
    name: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is required"),
    start: Yup.date().required("Start date is required").typeError("date must be yyyy-mm-dd").transform(parseDateString),
    end: Yup.date().required("End date is required").typeError("date must be yyyy-mm-dd").transform(parseDateString),
});

  return (
    <Modal {...restProps}>
      <ModalOverlay />
      <Formik<destination_type>
        initialValues={{
          ...initialValues,
          trips:
            initialValues?.trips?.map((trip: Trip) => ({
              id: trip.id,
              label: trip.name ?? "",
              value: trip.name ?? "",
              name: trip.name ?? "", 
              description: trip.description ?? "", 
            })) ?? [],
          name: initialValues?.name ?? "",
          description: initialValues?.description ?? "",
          start: initialValues?.start ?? "",
          end: initialValues?.end ?? "",
          activities: initialValues?.activities ?? "",
        }}
              
        onSubmit={(e, formikHelpers) => {
          console.log("submit");
          onSubmit?.(e);
          formikHelpers.setSubmitting(false);
        }}
        validationSchema={validationSchema}
      >
        <ModalContent as={Form}>
          <ModalHeader>
            {initialValues ? " edit destination" : "create destination"}      
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <InputControl name={"name"} label={"Name"} isRequired />
              <TextareaControl
                name={"description"}
                label={"Description"}
                isRequired
              />
              <InputControl
                name={"start"}
                label={"start"}
                typeof="date"
                isRequired
              />

              <InputControl
                name={"end"}
                label={"end"}
                typeof="date"
                isRequired
              />
              <InputControl
                name={"activities"}
                label={"activities"}
                typeof="string"
              />
              <ReactSelectControl<TagOption, true, GroupBase<TagOption>>
                name="trips"
                label="trips"
                selectProps={{
                  isMulti: true,
                  defaultOptions: true,
                  loadOptions: async (inputValue) => {
                    const trips = await client.getTrips();
                    console.log(trips);
                    if (trips.status === 200) {
                      return trips.data
                        .filter((trip) => trip?.name?.includes(inputValue))
                        .map((trip) => ({
                          id: trip.id,
                          label: trip.name || "",
                          value: trip.name || "",
                        }));
                    }
                    return [];
                  },
                }}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <SubmitButton>
              {initialValues ? "edit Destination" : "create Destination"}
            </SubmitButton>
          </ModalFooter>
        </ModalContent>
      </Formik>
    </Modal>
  );
};

