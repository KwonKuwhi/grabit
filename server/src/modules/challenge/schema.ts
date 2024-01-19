import {
  integer,
  pgTable,
  serial,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '../user/schema';

export const challenge = pgTable('challenge', {
  challenge_id: serial('challenge_id').primaryKey(),
  userid_num: integer('userid_num').references(() => users.userid_num, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
  challenge_name: varchar('challenge_name', { length: 200 }).notNull(),
  topic: varchar('topic', { length: 50 }).notNull(),
  challenger_userid_num: integer('challenger_userid_num').array().notNull(),
  goal_money: integer('goal_money').notNull(),
  deadline: varchar('deadline', { length: 20 }).notNull(),
  winner_userid_num: integer('winner_userid_num').array(),
  authentication_term: integer('authentication_term').notNull(),
  authentication_time: varchar('authentication_time', {
    length: 100,
  }).notNull(),
});

export const challengeRelations = relations(users, ({ many }) => ({
  posts: many(challenge),
}));

export const authentication = pgTable('authentication', {
  authentication_id: serial('authentication_id').primaryKey(),
  challenge_id: integer('challenge_id').references(
    () => challenge.challenge_id,
    { onDelete: 'cascade', onUpdate: 'cascade' },
  ),
  created_at: timestamp('created_at').defaultNow().notNull(),
  userid_num: integer('userid_num').notNull(),
  authentication_img: varchar('authentication_img', {
    length: 200,
  }).notNull(),
});

export const authenticationRelations = relations(challenge, ({ many }) => ({
  posts: many(authentication),
}));

export const authentication_img_emoticon = pgTable(
  'authentication_img_emoticon',
  {
    authentication_img_emoticon_id: serial(
      'authentication_img_emoticon_id',
    ).primaryKey(),
    authentication_id: integer('authentication_id').references(
      () => authentication.authentication_id,
      { onDelete: 'cascade', onUpdate: 'cascade' },
    ),
    authentication_img_comment_userid_num: integer(
      'authentication_img_comment_userid_num',
    ).notNull(),
    authentication_img_comment_emoticon: integer(
      'authentication_img_comment_emoticon',
    ).notNull(),
  },
);

export const authenticationEmoticonRelations = relations(
  authentication,
  ({ many }) => ({
    posts: many(authentication_img_emoticon),
  }),
);
