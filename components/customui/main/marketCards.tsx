interface Title {
  title: string;
  number: number;
}

export default function MarketCard({ title, number }: Title) {
  return (
    <div className="w-[80%] sm:w-[40%] sm:h-[208px] h-[150px]  rounded-[20px] relative p-6 bg-white ">
      <h1 className="sm:text-3xl text-2xl text-primary font-bold">{title}</h1>
      <p className="sm:text-[80px] text-[50px] text-center  text-primary">{number}</p>
      <div className="text-center text-xl font-semibold text-primary">Бүртгэлтэй бонд</div>
      <div className="absolute inset-0 flex justify-center items-center overflow-hidden">
        <span
          className="sm:text-[250px] text-[150px] font-semibold text-primary opacity-5 transform -rotate-12 relative right-[5%] top-[20%]"
          aria-hidden="true"
        >
          {title}

        </span>
      </div>
    </div>
  );
}