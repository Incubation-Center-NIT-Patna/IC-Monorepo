export default function SkillSlider({ value, onChange }) {

  return (
    <input
      type="range"
      min={1}
      max={5}
      step={0.5}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-[#4FDBC8] cursor-pointer"
    />
  );
}
