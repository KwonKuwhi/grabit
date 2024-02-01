import { Injectable } from '@nestjs/common';
import { ChallengeDto } from './dto/challenge.dto';
import {
  challenge,
  authentication,
  authentication_img_emoticon,
} from './schema';
import { users } from '../user/schema';
import { db } from '../../../db/db';
import { eq, not, and, desc, arrayOverlaps } from 'drizzle-orm';
import { isBefore, isAfter } from 'date-fns';
import { s3Middleware } from 'src/middleware/s3.middleware';
import { read } from 'fs';
import { Console } from 'console';

@Injectable()
export class ChallengeService {
  // 챌린지 생성
  newChallenge = async (login_userid_num: number, body: ChallengeDto) => {
    let {
      challenge_name,
      is_public,
      topic,
      auth_keyword,
      challenger_userid_num,
      goal_money,
      term,
      authentication_start_date,
      authentication_end_date,
      authentication_start_time,
      authentication_end_time,
    } = body;

    let challengers = [];
    for (let i = 0; i < challenger_userid_num.length; i++) {
      if (Number(challenger_userid_num[i]) !== login_userid_num) {
        challengers.push({
          userid_num: challenger_userid_num[i],
          isAccept: false,
        });
      } else {
        challengers.push({
          userid_num: challenger_userid_num[i],
          isAccept: true,
        });
      }
    }
    // console.log('service newChallenge challengers', challengers);

    return await db.insert(challenge).values({
      challenge_name,
      userid_num: login_userid_num,
      is_public,
      topic,
      auth_keyword,
      challenger_userid_num: challengers,
      goal_money,
      term,
      authentication_start_date: new Date(authentication_start_date),
      authentication_end_date: new Date(authentication_end_date),
      authentication_start_time,
      authentication_end_time,
    });
  };

  // 챌린지 목록
  challengeList = async (userid_num: number) => {
    const today = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    const challengeAll = await db.select().from(challenge);
    let myChallenge = [];
    console.log('service challengeList challengeAll > ', challengeAll);
    console.log(
      'service challengeList > ',
      challengeAll[1].challenger_userid_num,
    );
    for (let i = 0; i < challengeAll.length; i++) {
      for (let j = 0; j < challengeAll[i].challenger_userid_num.length; j++) {
        if (
          challengeAll[i].challenger_userid_num[j].userid_num === userid_num
        ) {
          myChallenge.push(challengeAll[i]);
        }
      }
    }
    console.log('service challengeList myChallenge > ', myChallenge);
    // 참여중인 챌린지
    let ingMyChallenge = [];
    for (let i = 0; i < myChallenge.length; i++) {
      if (
        isBefore(myChallenge[i].authentication_start_date, new Date()) &&
        isAfter(myChallenge[i].authentication_end_date, new Date())
      ) {
        ingMyChallenge.push(myChallenge[i]);
      }
    }

    // 참가 예정 챌린지
    let preMyChallenge = [];
    for (let i = 0; i < myChallenge.length; i++) {
      if (isAfter(myChallenge[i].authentication_start_date, new Date())) {
        preMyChallenge.push(myChallenge[i]);
      }
    }

    // 열려있는 챌린지
    const publicChallengeAll = await db
      .select()
      .from(challenge)
      .where(eq(challenge.is_public, true));
    let publicChallenge = [];
    for (let i = 0; i < publicChallengeAll.length; i++) {
      for (
        let j = 0;
        j < publicChallengeAll[i].challenger_userid_num.length;
        j++
      ) {
        if (
          publicChallengeAll[i].challenger_userid_num[j].userid_num !==
          userid_num
        ) {
          publicChallenge.push(publicChallengeAll[i]);
        }
      }
    }
    let prePublicChallenge = [];
    for (let i = 0; i < publicChallenge.length; i++) {
      if (isAfter(publicChallenge[i].authentication_start_date, new Date())) {
        prePublicChallenge.push(publicChallenge[i]);
      }
    }
    return { ingMyChallenge, preMyChallenge, prePublicChallenge };
  };

  // 인기 있는 챌린지 주제
  getPopularChallenge = async () => {
    const topics = await db.select({ topic: challenge.topic }).from(challenge);
    let topicCounts = [
      { name: '운동', count: 0 },
      { name: '셀프케어', count: 0 },
      { name: '독서', count: 0 },
      { name: '학습', count: 0 },
      { name: '취미', count: 0 },
      { name: '생활습관', count: 0 },
      { name: '저축', count: 0 },
    ];
    for (let i = 0; i < topics.length; i++) {
      if (topics[i].topic === '운동') topicCounts[0].count++;
      else if (topics[i].topic === '셀프케어') topicCounts[1].count++;
      else if (topics[i].topic === '독서') topicCounts[2].count++;
      else if (topics[i].topic === '학습') topicCounts[3].count++;
      else if (topics[i].topic === '취미') topicCounts[4].count++;
      else if (topics[i].topic === '생활습관') topicCounts[5].count++;
      else if (topics[i].topic === '저축') topicCounts[6].count++;
    }
    // count 기준으로 내림차순 정렬
    topicCounts.sort((a, b) => b.count - a.count);
    const popularTopic = topicCounts.slice(0, 3);
    const popularTopics = popularTopic.map((topic) => topic.name);
    console.log('s3middleware service popularTopics', popularTopics);
    const top1 = await db
      .select()
      .from(challenge)
      .where(eq(challenge.topic, popularTopics[0]))
      .orderBy(desc(challenge.created_at))
      .limit(3);
    const top2 = await db
      .select()
      .from(challenge)
      .where(eq(challenge.topic, popularTopics[1]))
      .orderBy(desc(challenge.created_at))
      .limit(3);
    const top3 = await db
      .select()
      .from(challenge)
      .where(eq(challenge.topic, popularTopics[2]))
      .orderBy(desc(challenge.created_at))
      .limit(3);
    return { popularTopics, top1, top2, top3 };
  };

  // 챌린지 상세 정보 보기
  challengeDetail = async (challenge_id: number, urls: any) => {
    const challengeDetail = await db
      .select()
      .from(challenge)
      .where(eq(challenge.challenge_id, challenge_id));

    console.log('service challengeDetail service urls > ', urls);

    if (challengeDetail.length !== 0) {
      let challengers = [];
      for (
        let i = 0;
        i < challengeDetail[0].challenger_userid_num.length;
        i++
      ) {
        let challenger = await db
          .select()
          .from(users)
          .where(
            eq(
              users.userid_num,
              challengeDetail[0].challenger_userid_num[i].userid_num,
            ),
          );

        await challengers.push(challenger[0]);
      }

      return { challengeDetail, challengers, urls };
    } else return { msg: '존재하지 않는 챌린지입니다.' };
  };

  // 챌린지 수정 페이지 보기
  getChallengeEdit = async (challenge_id: number) => {
    const challengeDetail = await db
      .select()
      .from(challenge)
      .where(eq(challenge.challenge_id, challenge_id));

    return challengeDetail;
  };

  // 챌린지 수정하기
  patchChallengeEdit = async (body: ChallengeDto, challenge_id: number) => {
    const {
      challenge_name,
      topic,
      auth_keyword,
      goal_money,
      term,
      authentication_start_date,
      authentication_end_date,
      authentication_start_time,
      authentication_end_time,
    } = body;
    return await db
      .update(challenge)
      .set({
        challenge_name: challenge_name,
        topic: topic,
        auth_keyword: auth_keyword,
        goal_money: goal_money,
        term: term,
        authentication_start_date: new Date(authentication_start_date),
        authentication_end_date: new Date(authentication_end_date),
        authentication_start_time: authentication_start_time,
        authentication_end_time: authentication_end_time,
        updated_at: new Date(),
      })
      .where(eq(challenge.challenge_id, challenge_id));
  };

  // 챌린지 삭제하기
  deleteChallengeEdit = async (challenge_id: number) => {
    return await db
      .delete(challenge)
      .where(eq(challenge.challenge_id, challenge_id));
  };

  // 챌린지 인증하기
  newChallengeAuth = async (
    login_userid_num: number,
    challenge_id: number,
    file: string,
  ) => {
    if (file) {
      let fileName: any = file.split('?')[0].split('.com/')[1];

      await db.insert(authentication).values({
        challenge_id: challenge_id,
        userid_num: login_userid_num,
        authentication_img: fileName,
        authentication_status: false,
      });
      return file;
    } else
      return {
        msg: '이미 인증하신 유저입니다.',
      };
  };

  // 테스트 (s3 이미지 get 요청)
  // 챌린지 인증사진 상세 보기
  getChallengeAuth = async (
    challenge_id: number,
    authentication_id: number,
    fileUrl: any,
  ) => {
    const emoticon = await db
      .select()
      .from(authentication_img_emoticon)
      .where(
        and(
          eq(authentication_img_emoticon.authentication_id, authentication_id),
        ),
      );
    return { fileUrl, emoticon };
  };

  // 챌린지 인증사진에 대한 이모티콘 취소 요청
  deleteChallengeAuthEmoticon = async (
    challenge_id: number,
    authentication_id: number,
    authentication_img_emoticon_id: number,
  ) => {
    return await db
      .delete(authentication_img_emoticon)
      .where(
        eq(
          authentication_img_emoticon.authentication_img_emoticon_id,
          authentication_img_emoticon_id,
        ),
      );
  };

  // 챌린지 인증사진에 대한 이모티콘 요청
  newChallengeAuthEmoticon = async (
    login_userid_num: number,
    body: any,
    challenge_id: number,
    authentication_id: number,
  ) => {
    const { authentication_img_comment_emoticon } = body;
    return await db.insert(authentication_img_emoticon).values({
      authentication_id,
      authentication_img_comment_userid_num: login_userid_num,
      authentication_img_comment_emoticon,
    });
  };

  // 테스트 (s3 이미지 patch 요청)
  patchChallengeAuth = async (
    challenge_id: number,
    authentication_id: number,
    file: string,
  ) => {
    let fileName: any = file.split('?')[0].split('.com/')[1];

    const updateImg = await db
      .update(authentication)
      .set({
        authentication_img: fileName,
      })
      .where(eq(authentication.authentication_id, authentication_id));
    return file;
  };

  // 테스트 (s3 이미지 delete 요청)
  deleteChallengeAuth = async (
    challenge_id: number,
    authentication_id: number,
  ) => {
    return await db
      .delete(authentication)
      .where(eq(authentication.authentication_id, authentication_id));
  };

  // 챌린지 히스토리 조회
  getChallengeHistory = async (userid_num: number) => {
    // 모든 챌린지 찾기
    const challengeAll = await db.select().from(challenge);
    let myChallenge = [];
    for (let i = 0; i < challengeAll.length; i++) {
      for (let j = 0; j < challengeAll[i].challenger_userid_num.length; j++) {
        if (
          challengeAll[i].challenger_userid_num[j].userid_num === userid_num &&
          challengeAll[i].challenger_userid_num[j].isAccept === true
        ) {
          myChallenge.push(challengeAll[i]);
        }
      }
    }
    let history = [];
    let today = new Date()
      .toLocaleString('en-US', { timeZone: 'Asia/Seoul' })
      .split(',')[0];
    for (let i = 0; i < myChallenge.length; i++) {
      if (
        isAfter(
          today,
          myChallenge[i].authentication_end_date
            .toLocaleString('en-US', {
              timeZone: 'Asia/Seoul',
            })
            .split(',')[0],
        )
      )
        console.log(
          myChallenge[i].authentication_end_date
            .toLocaleString('en-US', {
              timeZone: 'Asia/Seoul',
            })
            .split(',')[0],
        );
      history.push(myChallenge[i]);
    }
    let win = 0, // 승리 횟수
      lose = 0; // 패배 횟수
    const total = history.length; // 총 챌린지 횟수
    for (let i = 0; i < history.length; i++) {
      if (
        history[i].winner_userid_num !== null &&
        history[i].winner_userid_num.includes(Number(userid_num))
      )
        win++;
      else lose++;
    }

    console.log('history >> ', history);
    return { history, total, win, lose };
  };
}
