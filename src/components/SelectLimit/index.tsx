interface SelectLimitProps {
  limit: number;
  onLimitChange: (limit: number) => void;
}

export default function SelectLimit({ limit, onLimitChange }: SelectLimitProps) {
  return (
    <div className="flex justify-between items-center relative flex-wrap">
      <div className="flex items-center gap-2">
        <p className="text-[14px] font-normal text-gray-700">Exibir</p>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="border text-[14px] font-normal text-gray-700 px-3 py-2 border-gray-300 outline-none rounded-lg bg-white focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6]"
        >
          {[30, 50, 100, 150].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <p className="text-[14px] font-normal text-gray-700">registros</p>
      </div>
    </div>
  );
}