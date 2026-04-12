import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Info, AlertTriangle } from "lucide-react";

interface DutyResult {
  cifValue: number;
  importDuty: number;
  exciseDuty: number;
  vat: number;
  idf: number;
  rdl: number;
  total: number;
  effectiveRate: number;
}

function calculateKRADuty(
  cifUSD: number,
  engineCC: number,
  fuelType: string,
  kesRate: number
): DutyResult {
  const cifKES = cifUSD * kesRate;

  // Import Duty: 25%
  const importDuty = cifKES * 0.25;

  // Excise Duty based on engine size and fuel type
  let exciseRate = 0.20;
  if (fuelType === "electric") {
    exciseRate = 0.25;
  } else if (engineCC > 2500) {
    exciseRate = 0.35;
  } else if (engineCC > 1500) {
    exciseRate = 0.25;
  } else {
    exciseRate = 0.20;
  }
  const exciseDuty = (cifKES + importDuty) * exciseRate;

  // VAT: 16% on (CIF + Import Duty + Excise Duty)
  const vatBase = cifKES + importDuty + exciseDuty;
  const vat = vatBase * 0.16;

  // IDF: 3.5%
  const idf = cifKES * 0.035;

  // RDL: 2%
  const rdl = cifKES * 0.02;

  const total = importDuty + exciseDuty + vat + idf + rdl;
  const effectiveRate = (total / cifKES) * 100;

  return { cifValue: cifKES, importDuty, exciseDuty, vat, idf, rdl, total, effectiveRate };
}

function formatKES(amount: number): string {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);
}

export default function KRACalculator() {
  const [cifUSD, setCifUSD] = useState("");
  const [engineCC, setEngineCC] = useState("");
  const [fuelType, setFuelType] = useState("petrol");
  const [kesRate, setKesRate] = useState("130");
  const [result, setResult] = useState<DutyResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);

  const handleCalculate = () => {
    const cif = parseFloat(cifUSD);
    const cc = parseInt(engineCC);
    const rate = parseFloat(kesRate);

    if (!cif || !cc || !rate) return;

    const duty = calculateKRADuty(cif, cc, fuelType, rate);
    setResult(duty);
    setIsCalculated(true);
  };

  const ResultRow = ({ label, amount, highlight }: { label: string; amount: number; highlight?: boolean }) => (
    <div className={`flex items-center justify-between py-3 border-b border-white/5 ${highlight ? "text-white font-bold text-base" : "text-gray-300"}`}>
      <span className="text-sm">{label}</span>
      <span className={`font-mono ${highlight ? "text-primary text-lg" : "text-sm"}`}>{formatKES(amount)}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <Calculator className="w-3.5 h-3.5" />
              Kenya Revenue Authority
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Import Duty Calculator
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Estimate your KRA import costs for vehicles coming from Japan or any other country. 
              Based on official KRA duty rates.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calculator Form */}
            <div className="bg-card border border-white/8 rounded-2xl p-8">
              <h2 className="font-serif text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Vehicle Details
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-400 font-bold block mb-2">
                    CIF Value (USD) *
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 8000"
                    value={cifUSD}
                    onChange={e => setCifUSD(e.target.value)}
                    className="bg-background border-white/10 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Cost + Insurance + Freight in USD</p>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-400 font-bold block mb-2">
                    Engine Size (CC) *
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 1500"
                    value={engineCC}
                    onChange={e => setEngineCC(e.target.value)}
                    className="bg-background border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-400 font-bold block mb-2">
                    Fuel Type *
                  </label>
                  <Select value={fuelType} onValueChange={setFuelType}>
                    <SelectTrigger className="bg-background border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">{"Petrol (≤1500cc: 20%, 1501-2500cc: 25%, >2500cc: 35%)"}</SelectItem>
                      <SelectItem value="diesel">{"Diesel (≤1500cc: 20%, 1501-2500cc: 25%, >2500cc: 35%)"}</SelectItem>
                      <SelectItem value="hybrid">Hybrid (same as petrol)</SelectItem>
                      <SelectItem value="electric">Electric (25% flat rate)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-400 font-bold block mb-2">
                    USD to KES Exchange Rate
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 130"
                    value={kesRate}
                    onChange={e => setKesRate(e.target.value)}
                    className="bg-background border-white/10 text-white"
                  />
                </div>

                <Button
                  onClick={handleCalculate}
                  className="w-full rounded-sm uppercase tracking-widest font-bold"
                  disabled={!cifUSD || !engineCC || !kesRate}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Duty
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {result && isCalculated ? (
                <div className="bg-card border border-white/8 rounded-2xl p-8">
                  <h2 className="font-serif text-xl font-bold text-white mb-6">Duty Breakdown</h2>

                  <ResultRow label="CIF Value (KES)" amount={result.cifValue} />
                  <ResultRow label="Import Duty (25%)" amount={result.importDuty} />
                  <ResultRow label={`Excise Duty (${fuelType === "electric" ? "25" : engineCC && parseInt(engineCC) > 2500 ? "35" : parseInt(engineCC) > 1500 ? "25" : "20"}%)`} amount={result.exciseDuty} />
                  <ResultRow label="VAT (16%)" amount={result.vat} />
                  <ResultRow label="IDF (3.5%)" amount={result.idf} />
                  <ResultRow label="Railway Development Levy (2%)" amount={result.rdl} />

                  <div className="mt-4 pt-4 border-t border-primary/30">
                    <ResultRow label="Total Import Taxes" amount={result.total} highlight />
                  </div>

                  <div className="mt-4 bg-primary/10 border border-primary/20 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">Total Cost (CIF + Duty)</span>
                      <span className="font-bold text-white font-mono">{formatKES(result.cifValue + result.total)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Effective Tax Rate</span>
                      <span className="font-bold text-primary">{result.effectiveRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-white/8 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                  <Calculator className="w-16 h-16 text-gray-700 mb-4" />
                  <p className="text-gray-500">Enter vehicle details to calculate import duty</p>
                </div>
              )}

              {/* KRA Rates Reference */}
              <div className="bg-card border border-white/8 rounded-2xl p-6">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  KRA Duty Rates Reference
                </h3>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between"><span>Import Duty</span><span className="text-white">25% of CIF</span></div>
                  <div className="flex justify-between"><span>Excise (≤1500cc petrol/diesel)</span><span className="text-white">20%</span></div>
                  <div className="flex justify-between"><span>Excise (1501-2500cc)</span><span className="text-white">25%</span></div>
                  <div className="flex justify-between"><span>{"Excise (>2500cc)"}</span><span className="text-white">35%</span></div>
                  <div className="flex justify-between"><span>Excise (Electric)</span><span className="text-white">25%</span></div>
                  <div className="flex justify-between"><span>VAT</span><span className="text-white">16%</span></div>
                  <div className="flex justify-between"><span>Import Declaration Fee (IDF)</span><span className="text-white">3.5%</span></div>
                  <div className="flex justify-between"><span>Railway Development Levy</span><span className="text-white">2%</span></div>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-600/20 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-200/70">
                  This calculator provides estimates only. KRA uses CRSP (Current Retail Selling Price) 
                  which may differ from purchase price. Additional charges may apply. 
                  Consult a licensed clearing agent for official valuations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
