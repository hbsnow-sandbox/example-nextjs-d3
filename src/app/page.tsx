import { LineGraph } from "@/components/graph/line";

const randomData = () =>
  [...Array(9)].map((_, i) => ({
    name: String.fromCharCode(65 + i), // 65は'A'のUnicode値
    value: Math.floor(Math.random() * 100),
  }));

export default function Home() {
  const data = randomData();

  return (
    <main className="p-8">
      <div className="border">
        <LineGraph width={600} height={400} data={data} />
      </div>
    </main>
  );
}
