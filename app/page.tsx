import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import RaidCalculator from "@/components/RaidCalculator";
import CraftOptimizer from "@/components/CraftOptimizer";
import SoftSide from "@/components/SoftSide";
import ReferenceChart from "@/components/ReferenceChart";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs
          tabs={[
            { id: "raid", label: "Raid Calculator", content: <RaidCalculator /> },
            { id: "optimizer", label: "Explosive Optimizer", content: <CraftOptimizer /> },
            { id: "softside", label: "Soft-Side & Turrets", content: <SoftSide /> },
            { id: "reference", label: "Raid Chart Reference", content: <ReferenceChart /> },
          ]}
        />
        <footer className="mt-12 pt-4 border-t border-seam text-xs text-ash flex flex-wrap gap-2 justify-between">
          <span>Game data mirrors rustlabs.com raiding tables — update in /data.</span>
          <span>Not affiliated with Facepunch Studios.</span>
        </footer>
      </div>
    </main>
  );
}
