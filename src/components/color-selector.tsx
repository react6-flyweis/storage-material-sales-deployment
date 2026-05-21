export type ColorOption = { name: string; className: string };

export const DEFAULT_COLORS: ColorOption[] = [
  { name: "Default", className: "bg-gray-200 border border-gray-400" },
  { name: "Blue", className: "bg-blue-600" },
  { name: "Red", className: "bg-red-600" },
  { name: "Green", className: "bg-green-600" },
  { name: "Orange", className: "bg-orange-500" },
];

export const ROOF_COLORS: ColorOption[] = [
  { name: "Default", className: "bg-gray-200 border border-black" },
  { name: "Blue", className: "bg-blue-600" },
  { name: "Slate", className: "bg-slate-600" },
  { name: "Red", className: "bg-red-600" },
  { name: "Orange", className: "bg-orange-500" },
];

export default function ColorSelector({
  colors,
  value,
  onChange,
}: {
  colors: ColorOption[];
  value?: string | null;
  onChange: (name: string) => void;
}) {
  return (
    <div className="flex gap-2 p-2 border rounded-md h-9 items-center">
      {colors.map((c) => (
        <button
          key={c.name}
          type="button"
          title={c.name}
          className={`w-5 h-5 rounded-full ${c.className} ${
            value === c.name ? "ring-2 ring-offset-1 ring-blue-500" : ""
          }`}
          onClick={() => onChange(c.name)}
        />
      ))}
    </div>
  );
}
