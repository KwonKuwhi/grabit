import { Injectable } from '@nestjs/common';
import { ChallengeDto } from './dto/challenge.dto';
import {
  challenge,
  authentication,
  authentication_img_emoticon,
} from './schema';
import { users } from '../user/schema';
import { notification } from '../notification/schema';
import { db } from '../../../db/db';
import { eq, not, and, desc, arrayOverlaps } from 'drizzle-orm';
import {
  isBefore,
  isAfter,
  addHours,
  addMonths,
  subDays,
  differenceInDays,
  addDays,
} from 'date-fns';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ChallengeService {
  // 챌린지 생성
  newChallenge = async (
    login_userid_num: number,
    login_nickname: string,
    body: ChallengeDto,
  ) => {
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
    console.log(
      'service newChallenge body challenger userid_num > ',
      challenger_userid_num,
    );

    let challengers = [];
    for (let i = 0; i < challenger_userid_num.length; i++) {
      if (Number(challenger_userid_num[i]) !== login_userid_num) {
        challengers.push({
          userid_num: challenger_userid_num[i],
          isAccept: false,
          resultConfirm: false,
        });
      } else {
        challengers.push({
          userid_num: challenger_userid_num[i],
          isAccept: true,
          resultConfirm: false,
        });
      }
    }
    // console.log('service newChallenge challengers', challengers);

    // 챌린지 테이블에 추가하기
    const newChallenge = await db
      .insert(challenge)
      .values({
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
      })
      .returning(); // 생성하고 바로 객체로 반환받아서 값 사용할 수 있음

    // notification 테이블에 추가하기
    const challengeNotification = [];
    let noti: any;
    for (let i = 0; i < challenger_userid_num.length; i++) {
      // 챌린지를 생성하는 유저를 제외하고 알람 보내주기
      if (Number(challenger_userid_num[i]) !== login_userid_num) {
        noti = await db.insert(notification).values({
          userid_num: Number(challenger_userid_num[i]),
          reference_id: newChallenge[0].challenge_id,
          message: {
            challengeName: newChallenge[0].challenge_name,
            inviterName: login_nickname,
          },
          type: 'challenge/create',
          is_confirm: false,
        });
        challengeNotification.push(noti);
      }
    }

    return { newChallenge, challengeNotification };
  };

  // 챌린지 수락
  challengeAccept = async (userid_num: number, challenge_id: number) => {
    let challengeWait: any = await db
      .select({ challenger_userid_num: challenge.challenger_userid_num })
      .from(challenge)
      .where(eq(challenge.challenge_id, challenge_id));
    challengeWait = challengeWait[0].challenger_userid_num;

    for (let i = 0; i < challengeWait.length; i++) {
      if (challengeWait[i].userid_num === userid_num) {
        challengeWait[i].isAccept = true;
      }
    }

    return await db
      .update(challenge)
      .set({
        challenger_userid_num: challengeWait,
      })
      .where(eq(challenge.challenge_id, challenge_id));
  };

  // 챌린지 거절
  challengeReject = async (
    login_userid_num: number,
    login_nickname: string,
    challenge_id: number,
  ) => {
    let challengeWait: any = await db
      .select({ challenger_userid_num: challenge.challenger_userid_num })
      .from(challenge)
      .where(eq(challenge.challenge_id, challenge_id));
    challengeWait = challengeWait[0].challenger_userid_num;
    let newChallengeWait = [];
    for (let i = 0; i < challengeWait.length; i++) {
      if (challengeWait[i].userid_num !== login_userid_num) {
        newChallengeWait.push(challengeWait[i]);
      }
    }
    // console.log('service challengeReject challengeWait > ', newChallengeWait);

    const updateChallenge = await db
      .update(challenge)
      .set({
        challenger_userid_num: newChallengeWait,
      })
      .where(eq(challenge.challenge_id, challenge_id))
      .returning();

    let noti: any;
    noti = await db.insert(notification).values({
      userid_num: updateChallenge[0].userid_num,
      reference_id: updateChallenge[0].challenge_id,
      message: {
        challengeName: updateChallenge[0].challenge_name,
        rejectorName: login_nickname,
      },
      type: `challenge/reject/${login_userid_num}`,
      is_confirm: false,
    });

    if (updateChallenge[0].challenger_userid_num.length == 0) {
      noti = await db.insert(notification).values({
        userid_num: updateChallenge[0].userid_num,
        reference_id: updateChallenge[0].challenge_id,
        message: { challengeName: updateChallenge[0].challenge_name },
        type: 'challenge/delete/noChallenger',
        is_confirm: false,
      });
    }

    return updateChallenge;
  };

  // 챌린지 목록
  challengeList = async (userid_num: number) => {
    const today = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    const challengeAll = await db.select().from(challenge);
    let myChallenge = [];

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

    // 종료된 챌린지
    let endedMyChallenge = [];
    for (let i = 0; i < myChallenge.length; i++) {
      if (isBefore(myChallenge[i].authentication_end_date, new Date())) {
        for (let j = 0; j < myChallenge[i].challenger_userid_num.length; j++) {
          if (
            myChallenge[i].challenger_userid_num[j].userid_num === userid_num
          ) {
            if (myChallenge[i].challenger_userid_num[j].resultConfirm === false)
              endedMyChallenge.push(myChallenge[i]);
          }
        }
      }
    }
    console.log(
      '🚀 ~ ChallengeService ~ challengeList= ~ endedMyChallenge:',
      endedMyChallenge,
    );

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
    return {
      ingMyChallenge,
      preMyChallenge,
      endedMyChallenge,
      prePublicChallenge,
    };
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
  challengeDetail = async (
    login_userid_num: number,
    challenge_id: number,
    urls: any,
  ) => {
    const challengeDetail = await db
      .select()
      .from(challenge)
      .where(eq(challenge.challenge_id, challenge_id));

    // console.log(
    //   'service challengeDetail challengeDetail > ',
    //   challengeDetail[0],
    // ); // 해당 챌린지에 대한 정보

    // 로그인한 유저가 챌린지 인증 가능한 상태인지 확인
    let isAcceptable: boolean = true;
    let auth_num = 0;

    // 해당 챌린지에서 로그인한 유저가 인증한 내역을 모두 찾아서 배열로 저장
    const myAuth = await db
      .select()
      .from(authentication)
      .where(
        
        and(
          eq(authentication.challenge_id, challengeDetail[0].challenge_id),
          eq(authentication.userid_num, login_userid_num),
        ),
      );
    console.log('service myAuth > ', myAuth);
    let today = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Seoul',
    });
    today = today.split(',')[0];
    const year: number = Number(today.split('/')[2]);
    const month: number = Number(today.split('/')[0]);
    const day: number = Number(today.split('/')[1]);
    // console.log('service today > ', today);

    const period = differenceInDays(
      challengeDetail[0].authentication_end_date,
      challengeDetail[0].authentication_start_date,
    );

    let firstWeek;
    let lastWeek;
    const startDate = challengeDetail[0].authentication_start_date
      .toLocaleString('en-US', {
        timeZone: 'Asia/Seoul',
      })
      .split(',')[0]
      .split('/');
    const endDate = challengeDetail[0].authentication_end_date
      .toLocaleString('en-US', {
        timeZone: 'Asia/Seoul',
      })
      .split(',')[0];

    // 일주일씩 체크하는 기간이 2주이면 종료날짜가 주가 끝나는 두번째 시점
    if (period >= 14) {
      lastWeek = addDays(
        new Date(
          Number(startDate[2]),
          Number(startDate[0]) - 1,
          Number(startDate[1]),
        ),
        14,
      )
        .toLocaleString('en-US', {
          timeZone: 'Asia/Seoul',
        })
        .split(',')[0];
    }

    // 인증 기간이 일주일이거나 두 번째 일 때 첫 번째 인증 체크 시점
    if (period >= 7) {
      firstWeek = addDays(
        new Date(
          Number(startDate[2]),
          Number(startDate[0]) - 1,
          Number(startDate[1]),
        ),
        7,
      )
        .toLocaleString('en-US', {
          timeZone: 'Asia/Seoul',
        })
        .split(',')[0];
    }

    // console.log('service firstWeek > ', firstWeek);

    if (challengeDetail[0].term == 7) {
      // 매일 인증
      let last = myAuth.length;
      // 인증 첫 날에 대한 확인
      if (last > 0) {
        let lastAuth = myAuth[last - 1].created_at
          .toLocaleString('en-US', {
            timeZone: 'Asia/Seoul',
          })
          .split(',')[0];
        let yesterday: any = subDays(new Date(year, month - 1, day), 1);
        yesterday = yesterday
          .toLocaleString('en-US', {
            timeZone: 'Asia/Seoul',
          })
          .split(',')[0];
        if (lastAuth != yesterday) isAcceptable = false;
      }
      // console.log('service isAcceptable term 7 > ', isAcceptable);
    } else if (challengeDetail[0].term == 3) {
      // 주 3회 인증
      if (today === firstWeek) {
        if (myAuth.length < 3) isAcceptable = false;
      }
      if (today === lastWeek) {
        if (myAuth.length < 6) isAcceptable = false;
      }
    } else if (challengeDetail[0].term) {
      // 주 5회 인증
      if (today === firstWeek) {
        if (myAuth.length < 5) isAcceptable = false;
      }
      if (today === lastWeek) {
        if (myAuth.length < 10) isAcceptable = false;
      }
    }

    if (challengeDetail.length !== 0) {
      let challengers = []; // 챌린지에 참여하고 있는 모든 유저들에 대한 정보
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

      return { challengeDetail, challengers, urls, isAcceptable };
    } else return { msg: '존재하지 않는 챌린지입니다.' };
  };

  // 챌린지 상세 결과 페이지

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

    let updateChallenge: any = await db
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
      .where(eq(challenge.challenge_id, challenge_id))
      .returning();

    updateChallenge = updateChallenge[0];
    console.log(
      '🚀 ~ ChallengeService ~ patchChallengeEdit= ~ updateChallenge:',
      updateChallenge,
    );

    for (let i = 0; i < updateChallenge.challenger_userid_num.length; i++) {
      if (
        updateChallenge.userid_num !==
        updateChallenge.challenger_userid_num[i].userid_num
      ) {
        let noti = await db.insert(notification).values({
          userid_num: updateChallenge.challenger_userid_num[i].userid_num,
          reference_id: challenge_id,
          message: { challengeName: updateChallenge[0].challenge_name },
          type: 'challenge/modify',
          is_confirm: false,
        });
      }
    }
    return updateChallenge;
  };

  // 챌린지 삭제하기
  deleteChallengeEdit = async (challenge_id: number) => {
    let challengeInfo: any = await db
      .select({
        challenge_id: challenge.challenge_id,
        challenge_name: challenge.challenge_name,
        userid_num: challenge.userid_num,
        challenger_userid_num: challenge.challenger_userid_num,
      })
      .from(challenge)
      .where(eq(challenge.challenge_id, challenge_id));
    challengeInfo = challengeInfo[0];
    console.log(
      '🚀 ~ ChallengeService ~ deleteChallengeEdit ~ challenger:',
      challengeInfo,
    );
    console.log(challengeInfo.challenger_userid_num.length);
    for (let i = 0; i < challengeInfo.challenger_userid_num.length; i++) {
      if (
        challengeInfo.userid_num !==
        challengeInfo.challenger_userid_num[i].userid_num
      ) {
        let noti = await db.insert(notification).values({
          userid_num: challengeInfo.challenger_userid_num[i].userid_num,
          reference_id: challenge_id,
          message: {
            challengeName: challengeInfo.challenge_name,
          },
          type: 'challenge/delete/byOwner',
          is_confirm: false,
        });
      }
    }

    // return await db
    //   .delete(challenge)
    //   .where(eq(challenge.challenge_id, challenge_id));

    // 일단 알림만 보내주고 30일 이후에 db에서 삭제해줘야 함. -> 알림 조회될 때 없으면 충돌 발생하기 때문
    return 'success';
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
    userid_num: number,
  ) => {
    return await db
      .delete(authentication_img_emoticon)
      .where(
        and(
          eq(
            authentication_img_emoticon.authentication_img_comment_emoticon,
            authentication_img_emoticon_id,
          ),
          eq(
            authentication_img_emoticon.authentication_img_comment_userid_num,
            userid_num,
          ),
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

  // challenge 승자 업데이트
  async challengeWinner(
    winner: number[],
    challenge_id: number,
    userid_num: number,
  ) {
    let visible = 'show';
    if (winner.length === 0 || winner === undefined) {
      visible = 'show';
    } else {
      // winner 추가하기
      const addWinner = await db
        .update(challenge)
        .set({ winner_userid_num: winner })
        .where(eq(challenge.challenge_id, challenge_id));

      visible = 'hide';
    }

    // 이긴 유저들을 winner배열에 넣어줌
    const winnerArray: number[] = [];
    const findWinner = await db
      .select({ winner_userid_num: challenge.winner_userid_num })
      .from(challenge)
      .where(eq(challenge.challenge_id, challenge_id));

    for (let element of findWinner) {
      await winnerArray.push(...element.winner_userid_num);
    }

    console.log('winnerArray', winnerArray);

    // Body로 들어온 winner 마다 score 추가
    // winner_userid_num에 내 userid_num이 포함되지 않으면 -50점
    // 먼저 내가 포함 되어 있는지 찾기
    const score = findWinner[0].winner_userid_num.includes(userid_num);

    const minusScore = await db.select();

    // if(findWinner[0] === )
  }

  // challenge 종료 score 올리기
  // async challengeScore(challenge_id: number) {}

  // challenge 테이블에서 challenger_userid_num.length가 0이면서 authentication_start_date로 부터 30일 지났으면 삭제
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    const everyChallenge = await db.select().from(challenge);
    console.log('everyChallenge', everyChallenge);

    const dateNow = addHours(new Date(), 9);

    for (let i = 0; i < everyChallenge.length; i++) {
      const time = everyChallenge[i].authentication_start_date
        .toLocaleString('en-US', {
          timeZone: 'Asia/Seoul',
        })
        .split(',')[0];

      const month = Number(time.split('/')[0]);
      const day = Number(time.split('/')[1]);
      const year = Number(time.split('/')[2]);

      const timeNow = addMonths(new Date(year, month - 1, day), 1);
      console.log(`timeNow${i} >>> `, timeNow);
      console.log('dateNow >>> ', dateNow);

      if (dateNow === timeNow || dateNow > timeNow) {
        await db
          .delete(challenge)
          .where(eq(challenge.challenge_id, everyChallenge[i].challenge_id));
      }
    }
    console.log('30일이 지난 챌린지 삭제');
  }
}
