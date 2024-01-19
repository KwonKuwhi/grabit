import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';

function CreateChallenge() {
    return (
        <>
            <div className="grid grid-cols-3 gap-4">
                <div className="col-start-1 col-span-2 font-bold text-xl ">주제</div>
                <div className="col-start-1 col-span-1">
                    <Select>
                        <SelectTrigger className="w-[100%]">
                            <SelectValue placeholder="Theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <input className="col-start-2 col-span-2 p-2" placeholder="이름" />
            </div>
        </>
    );
}

function Tab({
    tab1,
    tab2,
    tab1content,
    tab2content,
}: {
    tab1: string;
    tab2: string;
    tab1content: JSX.Element;
    tab2content: JSX.Element;
}) {
    return (
        <div className="w-full mt-10">
            <Tabs defaultValue={tab1} className="w-full">
                <TabsList>
                    <TabsTrigger value={tab1}>{tab1}</TabsTrigger>
                    <TabsTrigger value={tab2}>{tab2}</TabsTrigger>
                </TabsList>
                <TabsContent value={tab1}>{tab1content}</TabsContent>
                <TabsContent value={tab2}>{tab2content}</TabsContent>
            </Tabs>
        </div>
    );
}

const recordData = [29, 19, 3];
function Record() {
    return (
        <>
            <div className="flex justify-between text-xl">
                <div className="font-bold p-2">전적</div>
                <div className="p-2">
                    {recordData[0]}승 {recordData[1]}패 {recordData[2]}무
                </div>
            </div>
        </>
    );
}

function HotChallenge() {
    const [hotChallenge, setHotChallenge] = useState<string[]>([]);
    useEffect(() => {
        setHotChallenge(['물마시기', '걷기', '공부']);
        console.log(hotChallenge);
        //     {
        //         /* axios.post('/HotChallenge')
        //         .then(response => {
        //             console.log(response);
        //             setHotchallenge(response)
        //         })
        //         .catch(error)=>{
        //             console.error('HotChallenge Component에서 오류발생 :',error)
        //         } */
        //     }
    }, []);

    // const hotChallenge = ['물마시기', '걷기', '공부'];

    return (
        <>
            <div className="flex gap-2 text-center">
                {hotChallenge.map((value, idx) => {
                    return (
                        <div key={idx} className="rounded-lg bg-slate-100 w-full m-2 p-2">
                            {value}
                        </div>
                    );
                })}
            </div>
        </>
    );
}

function Ranking() {
    return (
        <div className="flex flex-col gap-3 p-2 font-bold ">
            <div> 1위 알아서뭐해 3000점</div>
            <div> 2위 망고가얼망고 2000점</div>
            <div> 3위 요씨 1000점</div>
            <div>.</div>
            <div>.</div>
            <div> 339위 나 1점</div>
        </div>
    );
}
export { CreateChallenge, Tab, Record, HotChallenge, Ranking };
