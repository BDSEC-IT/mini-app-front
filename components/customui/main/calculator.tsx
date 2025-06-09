import { Input } from "@/components/ui/input"
export default function Calculator(){
    return(
        <div className="bg-accent h-[40vh] p-[40px]  rounded-[30px] ">
            <div className="flex justify-between mb-5">
    <div className="w-[40%]">
Хөрөнгө оруулах дүн
    </div>
    <div>
        <Input className="border-b-[1px]  bg-transparent border-solid border-t-0 border-l-0 border-r-0 rounded-none ">
        </Input>

    </div>
            </div>
            <div className="flex justify-between mb-5">
    <div className="w-[40%]">
Нийт хугцаа
    </div>
    <div>
        <Input className="border-b-[1px] bg-transparent  border-solid border-t-0 border-l-0 border-r-0 rounded-none ">
        </Input>

    </div>
            </div>
            <div className="flex justify-between mb-5">
    <div className="">
Бонд
    </div>
    <div>
        <Input className="border-b-[1px] bg-transparent  border-solid border-t-0 border-l-0 border-r-0 rounded-none ">
        </Input>

    </div>
    
            </div>
            <div className="flex justify-between mb-10">
    <div className="w-[40%]">
Хөрөнгө оруулалтын хүү
    </div>
    <div>
        <Input className="border-b-[1px] bg-transparent  border-solid border-t-0 border-l-0 border-r-0 rounded-none ">
        </Input>

    </div>
            </div>
            <div className="flex justify-between ">
    <div className="w-[40%]">
Хүүгийн орлогийн албан татвар     </div>
    <div>
    <div className="text-start flex justify-start w-[170px]">
    5%    </div>
      

    </div>
            </div>
        </div>
    )

}