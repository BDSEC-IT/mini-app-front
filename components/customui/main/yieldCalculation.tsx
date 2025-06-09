import Calculator from "./calculator"
import YieldCalculationResult from "./yieldCalculationResult"
export default function YieldCalculation(){
    return(
        <div className="sm:h-[80vh] 2xl:mx-[20%] xl:mx-[10%] md:mx-[100px] mx-[20px]  h-[80vh] sm:py-0 my-[40px] place-content-center ">


<div className="text-4xl text-center mb-[100px]">
Өгөөжийн тооцоолол
</div>
<div className="flex flex-wrap justify-between ">
<div className="w-[55%]">
<Calculator/>
</div>
<div className="w-[40%]">
<YieldCalculationResult/>
</div>
</div>

        </div>
    )
}