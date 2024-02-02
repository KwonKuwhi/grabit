import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import axios, { privateApi } from '@/api/axios';
import { users } from '@/types/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChallengeProp, Challenge } from '@/types/types';

import { ListComponent1 } from './ComponentSeong';

function CreateChallenge() {
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 col-start-1 text-xl font-bold ">주제</div>
        <div className="col-span-1 col-start-1">
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
        <input className="col-span-2 col-start-2 p-2" placeholder="이름" />
      </div>
    </>
  );
}

function Tab({
  tab1,
  tab2,
  tab3,
  tab4,
  tab1content,
  tab2content,
  tab3content,
  tab4content,
}: {
  tab1: string;
  tab2: string;
  tab3?: string;
  tab4?: string;
  tab1content: JSX.Element;
  tab2content: JSX.Element;
  tab3content?: JSX.Element;
  tab4content?: JSX.Element;
}) {
  return (
    <div className="mt-10 w-full">
      <Tabs defaultValue={tab1} className="w-full">
        <TabsList>
          <TabsTrigger value={tab1}>{tab1}</TabsTrigger>
          <TabsTrigger value={tab2}>{tab2}</TabsTrigger>

          {tab3 && <TabsTrigger value={tab3}>{tab3}</TabsTrigger>}
          {tab4 && <TabsTrigger value={tab4}>{tab4}</TabsTrigger>}
        </TabsList>
        <TabsContent value={tab1}>{tab1content}</TabsContent>
        <TabsContent value={tab2}>{tab2content}</TabsContent>
        {tab3 && <TabsContent value={tab3}>{tab3content}</TabsContent>}
        {tab4 && <TabsContent value={tab4}>{tab4content}</TabsContent>}
      </Tabs>
    </div>
  );
}

const recordData = [29, 19, 3];
function Record() {
  return (
    <>
      <div className="flex justify-between text-xl">
        <div className="p-2 font-bold">전적</div>
        <div className="p-2">
          {recordData[0]}승 {recordData[1]}패 {recordData[2]}무
        </div>
      </div>
    </>
  );
}

function HotChallenge() {
  const [hotTopic, setHotTopic] = useState<string[]>([]);
  const [top1, setTop1] = useState<Challenge[]>([]);
  const [top2, setTop2] = useState<Challenge[]>([]);
  const [top3, setTop3] = useState<Challenge[]>([]);

  const [showList, setShowList] = useState<Challenge[]>([]);

  useEffect(() => {
    {
      privateApi
        .get('http://3.34.122.205:3000/popularChallenge')
        .then((response) => {
          console.log('HotTopicData', response.data);
          setHotTopic(response.data.popularTopics);
          setTop1(response.data.top1);
          setTop2(response.data.top2);
          setTop3(response.data.top3);
        })
        .catch((error) => {
          console.error('HotChallenge Component에서 오류발생 :', error);
        });
    }
  }, []);

  function showHotChallengeList(key: number) {
    key += 1;
    switch (key) {
      case 1:
        setShowList(top1);
        break;
      case 2:
        setShowList(top2);
        break;
      case 3:
        setShowList(top3);
        break;
      default:
        setShowList([]);
        break;
    }
  }

  return (
    <>
      <div className="flex gap-8 text-center hover:cursor-pointer">
        {hotTopic.map((topic, idx) => {
          return (
            <div
              key={idx}
              onClick={() => {
                showHotChallengeList(idx);
              }}
              className="m-2 w-full rounded-md border-2 border-solid  border-pink-200 bg-pink-100 p-1"
            >
              {topic}
            </div>
          );
        })}
      </div>
      {showList.length != 0
        ? showList.map((challenge: Challenge, idx: number) => {
            return <ListComponentWithPeriod key={idx} challenge={challenge}></ListComponentWithPeriod>;
          })
        : null}
    </>
  );
}

function Ranking() {
  const [ranking, setRanking] = useState<users[]>([]);
  useEffect(() => {
    {
      console.log('ranking component 실행');
      axios
        .get('http://3.34.122.205:3000/Ranking', {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') },
        })
        .then((response) => {
          console.log('랭킹 axios');
          console.log('ranking axios response', response);
          setRanking(response.data);
        })
        .catch((error) => {
          console.error('ranking component에서 axios 에러', error);
        });
    }
  }, []);
  return (
    <div className="flex flex-col gap-3 p-2 font-bold ">
      {ranking?.map((rank: users, idx) => {
        return (
          <div key={idx}>
            <div>{idx + 1}위 </div>
            <div>{rank.nickname}</div>
            <div>{rank.score_num}</div>
          </div>
        );
      })}
    </div>
  );
}
function ListComponentWithPeriod({ challenge }: ChallengeProp) {
  return (
    <div>
      <div className="mb-[5%] flex flex-col rounded-lg bg-gray-200 p-6 shadow-md">
        <Link to={`/challengeDetail/${challenge.challenge_id}`} className=" text-black no-underline">
          <div className="flex justify-between">
            <p>{challenge.challenge_name}</p>
            <p className="text-gray-500">
              {format(challenge.authentication_start_date, 'PP (EEE)', { locale: ko })} ~{' '}
              {format(challenge.authentication_end_date, 'PP (EEE)', { locale: ko })}
            </p>
          </div>
          <p>{challenge.goal_money}원</p>
        </Link>
      </div>
    </div>
  );
}
export { CreateChallenge, Tab, Record, HotChallenge, Ranking, ListComponentWithPeriod };
