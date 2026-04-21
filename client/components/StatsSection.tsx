export default function StatsSection() {
  const stats = [
    {
      icon: (
        <img src="/icons/homeicon1.png" alt="Users Icon" className="h-[72px]" />
      ),
      number: "25,000+",
      description: "users across India, Middle East & Europe",
    },
    {
      icon: (
        <img
          src="/icons/homeicon2.png"
          alt="Households Icon"
          className="h-[72px]"
        />
      ),
      number: "5,000+",
      description: "households trust CureMist",
    },
    {
      icon: (
        <img
          src="/icons/homeicon3.png"
          alt="Clinics Icon"
          className="h-[72px]"
        />
      ),
      number: "100+",
      description: "clinics are using CureMist",
    },
    {
      icon: (
        <img
          src="/icons/homeicon4.png"
          alt="Protection Icon"
          className="h-[72px]"
        />
      ),
      number: "99.9%",
      description: "Protection Against External Contaminants",
    },
  ];

  return (
    <section className="relative py-6 md:py-10 bg-white">
      <div className="absolute top-[-140px] md:bottom-[-100px] left-0 right-0 hidden md:block">
        <div className="container mx-auto px-4 md:px-6 lg:px-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-[#FFE9AE] to-[#FFD147] rounded-lg p-6 md:p-8 flex flex-col items-center text-center ring-1 ring-white/50 shadow-sm"
              >
                <div className="mb-4 md:mb-6 flex items-center justify-center h-[50px] md:h-[72px]">
                  <img
                    src={stat.icon.props.src}
                    alt={stat.icon.props.alt}
                    className="h-[50px] md:h-[72px]"
                  />
                </div>
                <div className="text-2xl md:text-4xl font-semibold text-black mb-2">
                  {stat.number}
                </div>
                <p className="text-sm md:text-lg font-medium text-black leading-tight">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="container mx-auto px-4 mb:mt-[-134px]">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-[#FFE9AE] to-[#FFD147] rounded-lg p-4 sm:p-5 flex flex-col items-center text-center ring-1 ring-white/50 shadow-sm w-full"
              >
                <div className="mb-2 sm:mb-3 flex items-center justify-center h-[36px] sm:h-[40px]">
                  <img
                    src={stat.icon.props.src}
                    alt={stat.icon.props.alt}
                    className="h-[36px] sm:h-[40px]"
                  />
                </div>
                <div className="text-lg sm:text-xl font-bold text-black mb-1 leading-tight">
                  {stat.number}
                </div>
                <p className="text-[11px] sm:text-xs font-semibold text-black leading-tight">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
