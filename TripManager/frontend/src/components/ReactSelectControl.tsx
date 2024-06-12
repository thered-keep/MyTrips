import { AsyncCreatableProps, AsyncSelect } from "chakra-react-select";
import { useField } from "formik";
import { BaseProps, FormControl } from "formik-chakra-ui";
import { GroupBase } from "react-select";


export type SelectControlProps<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
> = BaseProps & {
  selectProps?: AsyncCreatableProps<Option, IsMulti, Group>;
  };
export const ReactSelectControl = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>(
  props: SelectControlProps<Option, IsMulti, Group>,
) => {
  const { name, label, selectProps, children, ...rest } = props;
  const [field, _meta, helper] = useField(name);


  return (
    <FormControl name={name} label={name} isInvalid={!!_meta.error} {...rest}>
      <AsyncSelect
        {...field}
        id={name}
        value={field.value}
        {...selectProps}
        onChange={(e) => {
          helper.setValue(e);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
      />
    </FormControl>
  );
};

export default ReactSelectControl;
