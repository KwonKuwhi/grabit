import { ListComponent1 } from '@/components/ComponentSeong';
import { Link } from 'react-router-dom';

import { ListComponentWithButton, ListComponentWithoutButton } from '@/components/PreChallenge';
import { ListComponentWithPeriod } from '@/components/Component0117';
import { privateApi } from '@/api/axios';
import { RootState } from '@/store/store';
import { useEffect, useState } from 'react';
import { Challenge } from '@/types/types';
import { useDispatch, useSelector } from 'react-redux';
import { setHeaderInfo } from '@/store/headerSlice';

function ChallengeList() {
  const { userid_num } = useSelector((state: RootState) => state.login);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setHeaderInfo({ title: '챌린지 목록', backPath: '/main' }));
  }, [dispatch]);

  const [ingMyChallenge, setIngMyChallenge] = useState<Challenge[]>([]);
  const [preMyChallenge, setPreMyChallenge] = useState<Challenge[]>([]);
  const [publicChallenge, setPublicChallenge] = useState<Challenge[]>([]);

  // const { accessToken, refreshToken } = useSelector((state: RootState) => state.login);

  useEffect(() => {
    {
      privateApi
        .get('http://52.79.228.200:3000/challengeList')
        .then((response) => {
          console.log(response.data);
          setIngMyChallenge(response.data.ingMyChallenge);
          setPreMyChallenge(response.data.preMyChallenge);
          setPublicChallenge(response.data.prePublicChallenge);
        })
        .catch((error) => {
          console.error('ChallengeList에서  오류발생 :', error);
        });
    }
    // privateApi({
    //   method: 'GET',
    //   url: 'http://localhost:3000/challengeList',
    //   headers: {
    //     Authorization: `Bearer ${accessToken}`,
    //   },
    // });
  }, []);

  return (
    <div className="mt-8 flex flex-col gap-12">
      <h1>참여중인 챌린지</h1>
      {ingMyChallenge.map((challenge: Challenge) => {
        return (
          <Link to={`/challengeInProgress/${challenge.challenge_id}`} className=" text-black no-underline">
            <ListComponent1 challenge={challenge} />
          </Link>
        );
      })}

      <h1>참가 예정 챌린지</h1>

      {preMyChallenge.map((challenge: Challenge) => {
        return (
          <>
            {Number(challenge.userid_num) === Number(userid_num) ? (
              <ListComponentWithButton challenge={challenge} />
            ) : (
              <ListComponentWithoutButton challenge={challenge} />
            )}
          </>
        );
      })}

      <h1>열려있는 챌린지</h1>

      {publicChallenge.map((challenge: Challenge) => {
        return <ListComponentWithoutButton challenge={challenge} />;
      })}
    </div>
  );
}
export default ChallengeList;
