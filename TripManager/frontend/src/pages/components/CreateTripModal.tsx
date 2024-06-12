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
import { OptionBase } from "chakra-react-select";
import { Form, Formik } from "formik";
import { InputControl, SubmitButton, TextareaControl } from "formik-chakra-ui";
import { GroupBase } from "react-select";
import * as Yup from "yup";
import { Destination, Trip } from "../../adapter_/api/__generated/api.ts";
import { useApiClient } from "../../adapter_/api/useApiClient.ts";
import ReactSelectControl from "../../components/ReactSelectControl.tsx";
import { parse, isDate } from "date-fns";

interface TagOption extends OptionBase {
  id?: string;
  label: string;
  value: string;
}

type trip_type = Omit<Trip, "id" | "createdAt" | "updatedAt"> &
  Partial<Pick<Trip, "id">>;
const parseDateString = (value: string, originalValue: string) => {
  const parsedDate = parse(originalValue, "yyyy-MM-dd", new Date());
  return isDate(parsedDate) ? parsedDate : new Date("");
};
export const CreateTripModal = ({
  initialValues,
  onSubmit,
  ...restProps
}: Omit<ModalProps, "children"> & {
  initialValues: trip_type | null;
  onSubmit?: (data: trip_type) => void;
}) => {
  const client = useApiClient();
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is required"),
    start: Yup.date().required("Start date is required").typeError("date must be yyyy-mm-dd").transform(parseDateString),
    end: Yup.date().required("End date is required").typeError("date must be yyyy-mm-dd").transform(parseDateString),
    participants: Yup.number().typeError("invalid number"),
  });
  return (
    <Modal {...restProps}>
      <ModalOverlay />

      <Formik<trip_type>
        initialValues={{
          ...initialValues,
          destinations:
            initialValues?.destinations?.map((destination: Destination) => ({
              id: destination.id,
              label: destination.name ?? "",
              value: destination.name ?? "",
              name: destination.name ?? "",
              description: destination.description ?? "",
              trips: destination.trips ?? [],
            })) ?? [],
          name: initialValues?.name ?? "",
          start: initialValues?.start ?? "",
          end: initialValues?.end ?? "",
          description: initialValues?.description ?? "",
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
            {initialValues ? " edit Trip" : "create trip"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <InputControl name={"name"} label={"Name"} />
              <TextareaControl name={"description"} label={"Description"} />
              <InputControl
                name={"start"}
                label={"Start"}
                typeof="date"
                isRequired
              />

              <InputControl
                name={"end"}
                label={"End"}
                typeof="date"
                isRequired
              />
              <InputControl name={"participants"} label={"Participants"} />
              <ReactSelectControl<TagOption, true, GroupBase<TagOption>>
                name="destinations"
                label="Destinations"
                selectProps={{
                  isMulti: true,
                  defaultOptions: true,
                  loadOptions: async (inputValue) => {
                    const dests = await client.getDestinations();
                    console.log(dests);
                    if (dests.status === 200) {
                      return dests.data
                        .filter((dest) => dest?.name?.includes(inputValue))
                        .map((dest) => ({
                          id: dest.id,
                          label: dest.name || "",
                          value: dest.name || "",
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
              {initialValues ? "edit Trip" : "create Trip"}
            </SubmitButton>
          </ModalFooter>
        </ModalContent>
      </Formik>
    </Modal>
  );
};
