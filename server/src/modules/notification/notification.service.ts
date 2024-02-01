import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { db } from 'db/db';
import { eq, gt } from 'drizzle-orm';
import { notification } from './schema';
import { friend } from '../friend/schema';
import { challenge } from '../challenge/schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addHours, addMonths } from 'date-fns';
@Injectable()
export class NotificationService {
  create(createNotificationDto: CreateNotificationDto) {
    return 'This action adds a new notification';
  }

  findAll() {}

  findOne = async (userid_num: number) => {
    console.log('userid_num >>>>>', userid_num);
    const result = await db
      .select()
      .from(notification)
      .where(eq(notification.userid_num, userid_num));

    console.log('result >>>>>', result);

    const friendJoin = await db
      .select()
      .from(notification)
      .leftJoin(friend, eq(notification.reference_id, friend.friend_id))
      .leftJoin(
        challenge,
        eq(notification.reference_id, challenge.challenge_id),
      );

    console.log('friendJoin >>>>>', friendJoin);

    if (result.length > 0) {
      const findFriend = await db
        .select({})
        .from(friend)
        .where(eq(friend.userid_num, userid_num));
      return result;
    } else {
      return { msg: '알림 없음' };
    }
  };

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    try {
      const dateNow = addHours(new Date(), 9);
      console.log('dateNow >>>>>', dateNow);

      const currentTime = await db.select().from(notification);

      for (let i = 0; i < currentTime.length; i++) {
        const time = currentTime[i].created_at
          .toLocaleString('en-US', {
            timeZone: 'Asia/Seoul',
          })
          .split(',')[0];

        const month = Number(time.split('/')[0]);
        const day = Number(time.split('/')[1]);
        const year = Number(time.split('/')[2]);

        const timenow = addMonths(new Date(year, month, day), 1);

        if (dateNow === timenow) {
          await db
            .delete(notification)
            .where(
              eq(notification.notification_id, currentTime[i].notification_id),
            );
        }
      }

      console.log('30일이 지난 알림 삭제');
    } catch (error) {
      console.error('에러 발생', error.message);
    }
  }
}
