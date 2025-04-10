import { LineGraph } from "@/components/graph/line";
import { BarGraph } from "@/components/graph/bar";
import { MixedGraph } from "@/components/graph/mixed";

const generateDataset = () =>
  [...Array(9)].map((_, i) => ({
    name: String.fromCharCode(65 + i), // 65は'A'のUnicode値
    value: Math.floor(Math.random() * 100),
  }));

export default function Home() {
  const data = [
    {
      label: "Email",
      data: generateDataset(),
    },
    {
      label: "Direct",
      data: generateDataset(),
    },
  ];
  const mixedData = [
    {
      type: "bar" as const,
      label: "Union Ads",
      data: generateDataset(),
    },
    {
      type: "line" as const,
      label: "Video Ads",
      data: generateDataset(),
    },
  ];

  return (
    <main className="p-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="border">
          <LineGraph width={600} height={400} data={data} />
        </div>
        <div className="border">
          <BarGraph width={600} height={400} data={data} />
        </div>
      </div>
      <div className="mt-4 border">
        <MixedGraph width={1224} height={400} datasets={mixedData} />
      </div>
    </main>
  );
}
