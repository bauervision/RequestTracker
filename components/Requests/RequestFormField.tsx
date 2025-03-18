import React from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";

interface FieldData {
  description: string;
  label: string;
  isSwitch: boolean;
  value: string;
}
interface FileProps {
  data: FieldData;
}

function RequestFormField({ data }: FileProps) {
  return (
    <FormField
      //control={form.control}
      name="security_emails"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <FormLabel>{data.label}</FormLabel>
            <FormDescription>{data.description}</FormDescription>
          </div>
          <FormControl>
            {/* if this is a switch */}
            {data.isSwitch ? (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled
                aria-readonly
              />
            ) : (
              <Input
                id="delivery"
                value={data?.value}
                className="w-auto"
                onChange={() => console.log("Changed VALUE")}
              />
            )}

            {/* Otherwise render something else */}
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export default RequestFormField;
