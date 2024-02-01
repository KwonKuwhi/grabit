import AlarmList from '@/components/AlarmList';
import { useState, useEffect } from 'react';
import { privateApi } from '@/api/axios';

interface challengeAlarm {
  title: string;
  content: string;
}
interface friendAlarm {
  title: string;
  content: string;
}

function Alarm() {
  const [challengeAlarm, setChallengeAlarm] = useState<challengeAlarm[]>([
    {
      title: '알림1',
      content: '챌린지 신청입니다',
    },
    {
      title: '알림2',
      content: '챌린지 신청입니다',
    },
  ]);
  const [friendAlarm, setFriendAlarm] = useState<friendAlarm[]>([
    {
      title: '알림1',
      content: '친구 신청입니다',
    },
    {
      title: '알림2',
      content: '친구 신청입니다',
    },
  ]);
  useEffect(() => {
    {
      // privateApi
      //   .get(`http://3.34.122.205:3000/challengeDetail/${challenge_id}`)
      //   .then((response) => {
      //     console.log(response.data);
      //     setChallengeDetail(response.data.challengeDetail[0]);
      //     setChallengers(response.data.challengers);
      //   })
      //   .catch((error) => {
      //     console.error('ChallengeEdit에서 오류발생 :', error);
      //   });
    }
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">챌린지 알림</h1>
      <div className="list flex flex-col gap-4 p-4">
        {challengeAlarm.map((list, i) => {
          return <AlarmList key={i} title={list.title} content={list.content} />;
        })}
      </div>
      <h1 className="text-2xl font-extrabold">친구 알림</h1>
      <div className="list flex flex-col gap-4 p-4">
        {friendAlarm.map((list, i) => {
          return <AlarmList key={i} title={list.title} content={list.content} />;
        })}
      </div>
    </div>
  );
}

export default Alarm;
