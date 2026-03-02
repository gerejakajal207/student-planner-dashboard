// REACT //
import { Plus, TrendingUp,Target, CheckCircle, Clock } from "lucide-react";

// COMPONENTS //
import QuoteCard from "../components/QuoteCard";
import StatsCard from "../components/home-page/StatsCard";

export default function HomePage() {
  const statsData = [
    {
      icon: Target,
      value: 12,
      description: "Today's Tasks",
      color: "blue-500",
    },
    {
      icon: CheckCircle,
      value: 8,
      description: "Completed Today",
      color: "green-500",
    },
    {
      icon: TrendingUp,
      value: 2,
      description: "In Progress",
      color: "purple-500",
    },
    {
      icon: Clock,
      value: 3,
      description: "Pending",
      color: "red-500",
    },
  ];
  return (
    <div className="m-5 flex flex-col gap-10">
      {/* Greeting and Quote Card Container */}
      <div className="flex flex-col items-center justify-center gap-5 rounded-2xl bg-[#ffffff] p-5 shadow-lg md:gap-10">
        {/* Greeting */}
        <div className="flex flex-col items-center justify-center gap-1">
          <p className="text-center text-xl font-bold md:text-3xl">Good Evening, Student!</p>
          <p className="text-[12px] text-neutral-400 md:text-sm">Ready to make today productive?</p>
        </div>
        <QuoteCard />
        <button className="flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-sm text-white transition hover:bg-blue-600 sm:px-6 sm:py-3 sm:text-base">
          <Plus size={18} />
          ADD TASK
        </button>
      </div>
      {/* Stats cards  */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((item, index) => (
          <StatsCard key={index} data={item} />
        ))}
      </div>
    </div>
  );
}
