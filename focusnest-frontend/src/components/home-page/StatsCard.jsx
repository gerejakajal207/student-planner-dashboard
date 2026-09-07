export default function StatsCard({ data }) {
  const { icon: Icon, value, description, color } = data;
  const bgColor=`bg-${color}/20`
  const iconColor =`text-${color}`

  return (
    <div className="flex gap-3 rounded-2xl bg-white p-5 shadow-lg md:gap-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor}`}
      >
        <Icon className={iconColor} />
      </div>

      <div className="flex flex-col">
        <p className="text-2xl font-extrabold">{value}</p>
        <p className="text-base font-normal text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}