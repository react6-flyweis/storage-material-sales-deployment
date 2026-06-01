import { useEffect } from "react";
import { Controller, useWatch } from "react-hook-form";
import type {
  Control,
  UseFormRegister,
  UseFormGetValues,
  UseFormSetValue,
  FieldArrayWithId,
} from "react-hook-form";
import { Upload, List } from "lucide-react";
import UploadImageDialog from "@/components/invoice/upload-image-dialog";
import ItemListDialog from "@/components/invoice/item-list-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TaxDialog from "@/components/invoice/tax-dialog";

import type { InvoiceFormValues } from "./invoice-form";

type FieldType = FieldArrayWithId<InvoiceFormValues, "lineItems", "fieldId">;

type LineItem = InvoiceFormValues["lineItems"][number];

type Props = {
  field: FieldType;
  index: number;
  item: LineItem;
  control: Control<InvoiceFormValues>;
  register: UseFormRegister<InvoiceFormValues>;
  getValues: UseFormGetValues<InvoiceFormValues>;
  setValue: UseFormSetValue<InvoiceFormValues>;
  remove: (index: number) => void;
  taxes?: { name: string; rate: string }[];
};

export default function InvoiceLineItem({
  index,
  item,
  control,
  register,
  getValues,
  setValue,
  remove,
  taxes = [],
}: Props) {
  const watchedLineItem = useWatch({
    control,
    name: `lineItems.${index}` as const,
  }) as LineItem | undefined;

  useEffect(() => {
    const currentItem = watchedLineItem ?? item;
    const rate = Number(currentItem?.rate ?? 0);
    const quantity = Number(currentItem?.quantity ?? 0);
    const subtotal = rate * quantity;
    const selectedTax = currentItem?.selectedTax;
    const matchingTax = taxes.find((tax) => tax.name === selectedTax);
    const derivedTax = matchingTax
      ? subtotal * (Number(matchingTax.rate || 0) / 100)
      : Number(currentItem?.tax ?? 0);
    const nextTotal = subtotal + derivedTax;

    if ((currentItem?.tax ?? 0) !== derivedTax) {
      setValue(`lineItems.${index}.tax`, derivedTax);
    }

    if ((currentItem?.total ?? 0) !== nextTotal) {
      setValue(`lineItems.${index}.total`, nextTotal);
    }
  }, [index, item, setValue, taxes, watchedLineItem]);

  const removeImage = (imageIndex: number) => {
    const items = getValues("lineItems") || [];
    const images = items[index]?.images || [];
    const newImages = images.filter((_, i) => i !== imageIndex);
    setValue(`lineItems.${index}.images`, newImages);
  };

  return (
    <div className="relative group">
      <button
        onClick={() => remove(index)}
        className="absolute md:-left-8 left-2 top-4 text-red-500 hover:text-red-700 group-hover:opacity-100 transition-opacity"
        title="Remove item"
      >
        <div className="md:w-5 md:h-5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white">
          <span className="h-0.5 w-3 bg-white"></span>
        </div>
      </button>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Main Item Row */}
        <div className="grid grid-cols-2 xl:grid-cols-12   bg-white divide-x">
          {/* Description & Item List - Full width on mobile */}
          <div className="col-span-2 md:col-span-5 p-3 flex items-center gap-4 border-b md:border-b-0 border-gray-100">
            <Input
              {...register(`lineItems.${index}.description` as const)}
              defaultValue={item?.description ?? undefined}
              placeholder="Description"
              className="text-gray-400 text-sm border-0 focus:ring-0 px-2"
            />
            <div className="ml-auto">
              <ItemListDialog
                initialItems={item?.items || []}
                onChange={(items: string[]) =>
                  setValue(`lineItems.${index}.items`, items)
                }
              >
                <button
                  type="button"
                  className="text-blue-500 flex items-center gap-1.5 text-xs font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                >
                  <List className="w-4 h-4" />
                  Item list
                </button>
              </ItemListDialog>
            </div>
          </div>

          {/* Rate */}
          <div className="col-span-1 md:col-span-2 p-3 flex flex-col md:flex-row items-start md:items-center justify-center border-b md:border-b-0 border-r border-gray-100 ">
            <span className="md:hidden text-gray-400 text-[10px] uppercase tracking-wide mb-1">
              Rate
            </span>
            <Input
              type="number"
              step="0.01"
              defaultValue={item?.rate ?? undefined}
              {...register(`lineItems.${index}.rate` as const, {
                valueAsNumber: true,
              })}
              placeholder="0.00"
              className="text-gray-600 text-sm border-0 focus:ring-0 w-full"
            />
          </div>

          {/* Markup */}
          {/* <div className="col-span-1 md:col-span-2 p-3 flex flex-col md:flex-row items-start md:items-center justify-center border-b md:border-b-0 border-gray-100">
            <span className="md:hidden text-gray-400 text-[10px] uppercase tracking-wide mb-1">
              Markup
            </span>
            <Controller
              control={control}
              name={`lineItems.${index}.markup` as const}
              defaultValue={item?.markup}
              render={({ field: selField }) => (
                <Select
                  value={selField.value}
                  onValueChange={selField.onChange}
                >
                  <SelectTrigger className="text-sm border-0 text-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Markup">Markup</SelectItem>
                    <SelectItem value="Fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div> */}

          {/* Quantity */}
          <div className="col-span-1 md:col-span-2  p-3 flex flex-col md:flex-row items-start md:items-center justify-center border-b md:border-b-0 ">
            <span className="md:hidden text-gray-400 text-[10px] uppercase tracking-wide mb-1">
              Quantity
            </span>
            <Input
              type="number"
              {...register(`lineItems.${index}.quantity` as const, {
                valueAsNumber: true,
              })}
              placeholder="1"
              className="text-gray-600 text-sm border-0 focus:ring-0 w-full"
              min={0}
            />
          </div>

          {/* Tax */}
          <div className="col-span-1 md:col-span-1 p-3 flex flex-col md:flex-row items-start md:items-center justify-center border-b md:border-b-0 border-gray-100">
            <span className="md:hidden text-gray-400 text-[10px] uppercase tracking-wide mb-1">
              Tax
            </span>
            <TaxDialog
              availableTaxes={taxes}
              initialSelected={item?.selectedTax ? [item.selectedTax] : []}
              onDone={(selected, updatedTaxes) => {
                setValue(`lineItems.${index}.selectedTax`, selected?.[0] || "");
                if (updatedTaxes) setValue("taxes", updatedTaxes);
              }}
            >
              <button
                type="button"
                className="text-blue-500 text-xs font-bold cursor-pointer"
              >
                {item?.selectedTax || "Tax"}
              </button>
            </TaxDialog>
          </div>

          {/* Total - Full width on mobile/special align */}
          <div className="col-span-2  p-3 flex items-center justify-between md:justify-end pr-6 bg-gray-50 md:bg-white">
            <span className="md:hidden text-gray-400 text-sm font-medium">
              Total:
            </span>
            <span className="text-gray-900 md:text-gray-600 text-base md:text-sm font-bold md:font-medium">
              $
              {(
                (item?.total ?? (item?.rate || 0) * (item?.quantity || 0)) ||
                0
              ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Notes Row */}
        <div className="border-t border-gray-100 p-0">
          <input
            type="text"
            placeholder="Notes"
            {...register(`lineItems.${index}.notes` as const)}
            className="w-full px-5 py-3 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:bg-gray-50/50 transition-colors border-0"
          />
        </div>

        {/* Upload Row */}
        <div className="border-t border-gray-100 p-3 bg-gray-50/10 flex items-center gap-4 flex-wrap">
          <UploadImageDialog
            onUpload={(files: File[]) => {
              const names = files.map((f) => f.name);
              const items = getValues("lineItems") || [];
              const images = items[index]?.images || [];
              const combined = [...images, ...names].slice(0, 4);
              setValue(`lineItems.${index}.images`, combined);
            }}
          >
            <Button
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50 h-9 rounded-full px-4 text-xs font-medium flex gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload photos
            </Button>
          </UploadImageDialog>
          <span className="text-gray-400 text-xs">(Max 4)</span>

          {(item?.images || []).map((image: string, idx: number) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-xs text-gray-500 bg-white/0 px-2 py-1 rounded-md"
            >
              <span className="truncate max-w-40">{image}</span>
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="text-red-500 hover:text-red-700 text-xs font-medium"
                title={`Remove ${image}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Items List Display */}
      {(item?.items || []).length > 0 && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {(item.items || []).map((it: string, i: number) => (
            <div key={i} className="bg-gray-100 px-3 py-1 rounded text-sm">
              {it}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
