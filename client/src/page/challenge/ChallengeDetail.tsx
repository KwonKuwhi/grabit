import { Label } from '@/components/ui/label';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Challenge, users } from '@/types/types';
import { ko } from 'date-fns/locale';

import { format } from 'date-fns';
import { useDispatch } from 'react-redux';
import { setHeaderInfo } from '@/store/headerSlice';

function ChallengeDetail() {
  const dispatch = useDispatch();

  const { challenge_id } = useParams();
  const [challengeDetail, setChallengeDetail] = useState<Challenge>();
  const [challengers, setChallengers] = useState<users[]>([
    {
      userid_num: 1,
      login_type: 'normal',
      userid: 'userid',
      social_userid: 'userid',
      password: 'password',
      name: 'name',
      nickname: 'nickname',
      profile_img: null,
      score_num: 30,
      money: 1000,
    },
  ]);

  useEffect(() => {
    dispatch(setHeaderInfo({ title: '챌린지 상세', backPath: -1 }));
  }, [dispatch]);

  useEffect(() => {
    console.log(challenge_id);
    axios
      .get(`http://3.34.122.205:3000/challengeDetail/${challenge_id}`)
      .then((response): void => {
        console.log('response', response.data);
        setChallengeDetail(response.data.challengeDetail[0]);
        setChallengers(response.data.challengers);
      })
      .catch((error): void => {
        console.error('ChallengeDetail에서 axios 오류:', error);
      });
  });

  return (
    <div className="container ">
      <h1 className="py-4 text-3xl font-bold">챌린지 정보</h1>

      <div>
        <div className="user-list flex">
          <h2 className="flex w-full py-4 text-xl font-bold">참여자</h2>
          <div className="flex w-fit items-center space-x-2">
            <Label className="w-8">공개</Label>
          </div>
        </div>

        <div className="user-list flex flex-col gap-4">
          <div className="flex items-center gap-2">
            {challengers.map((challenger: users, idx) => {
              return (
                <div className="flex items-center gap-2 " key={idx}>
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <span>임시 닉</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <h2 className="py-4 text-xl font-bold">챌린지명</h2>
      <div>{challengeDetail != undefined && challengeDetail.challenge_name}</div>
      <h2 className="py-4 text-xl font-bold">주제</h2>
      <div>{challengeDetail != undefined && challengeDetail.topic}</div>

      <h2 className="py-4 text-xl font-bold">시작날짜</h2>
      <div>
        {challengeDetail != undefined && format(challengeDetail.authentication_start_date, 'PPP EEE', { locale: ko })}
      </div>
      <h2 className="py-4 text-xl font-bold">끝날짜</h2>
      <div>
        {challengeDetail != undefined && format(challengeDetail.authentication_end_date, 'PPP EEE', { locale: ko })}
      </div>

      <h2 className="py-4 text-xl font-bold">인증 주기</h2>
      <div>주 {challengeDetail != undefined && challengeDetail.term}일</div>

      <h2 className="py-4 text-xl font-bold">인증 시간</h2>
      <div>
        {challengeDetail != undefined &&
          challengeDetail.authentication_start_time + '시 ~ ' + challengeDetail.authentication_end_time + '시 '}
      </div>

      <div className="user-list flex flex-col gap-4 pt-4">
        <Button>참가하기</Button>
        <Button>확인</Button>
      </div>
    </div>
  );
}

export default ChallengeDetail;
