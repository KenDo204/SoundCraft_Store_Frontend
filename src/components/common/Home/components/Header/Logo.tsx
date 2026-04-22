const Logo: React.FC<{ isCompact?: boolean }> = ({ isCompact = false }) => (
  <a href="/" className="flex flex-col items-center justify-center transition-all duration-500">
    {!isCompact && (
      <div className="flex items-center gap-4 text-[9px] font-bold tracking-[0.3em] text-stone-400 mb-0.5 animate-in fade-in duration-500">
        <span>EST.</span>
        <span>2026</span>
      </div>
    )}
    <h1 className={`font-black tracking-tighter text-stone-900 leading-none transition-all duration-500 
      ${isCompact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'}`}>
      SOUND CRAFT
    </h1>
    {!isCompact && (
      <div className="flex items-center gap-4 text-[8px] font-bold tracking-[0.3em] text-stone-400 mt-1 animate-in fade-in zoom-in-95 duration-500">
        <span>MUSIC</span>
        <span>CO.</span>
      </div>
    )}
  </a>
);

export default Logo;
