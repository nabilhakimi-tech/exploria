import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// ─── 1. Profil Pengguna (Ibu Bapa / Staf / Pentadbir) ───────────────────────
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // matches Supabase Auth user ID
  email: text('email').notNull(),
  role: text('role', { enum: ['parent', 'staff', 'admin', 'student'] })
    .default('parent')
    .notNull(),
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  icNumber: text('ic_number'),
  photoUrl: text('photo_url'),
  isApproved: boolean('is_approved').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── 2. Profil Kanak-kanak ───────────────────────────────────────────────────
export const children = pgTable('children', {
  id: uuid('id').defaultRandom().primaryKey(),
  parentId: uuid('parent_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull(),
  fullName: text('full_name').notNull(),
  schoolType: text('school_type', { enum: ['SK', 'SMK'] })
    .default('SK')
    .notNull(),
  grade: text('grade').notNull(), // e.g. "Darjah 1", "Tingkatan 3"
  schoolName: text('school_name'),
  icNumber: text('ic_number'),
  gender: text('gender'),
  color: text('color'),
  xp: integer('xp').default(0).notNull(),
  level: integer('level').default(1).notNull(),
  avatarUrl: text('avatar_url'),
  email: text('email'),
  coins: integer('coins').default(200).notNull(),
  completedMissions: jsonb('completed_missions').$type<string[]>().default([]).notNull(),
  claimedMissions: jsonb('claimed_missions').$type<string[]>().default([]).notNull(),
  redeemedItems: jsonb('redeemed_items').$type<string[]>().default([]).notNull(),
  claimedLevelRewards: jsonb('claimed_level_rewards').$type<number[]>().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── 3. Subjek ──────────────────────────────────────────────────────────────
export const subjects = pgTable('subjects', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category', { enum: ['SK', 'SMK'] }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── 4. Bahan Pelajaran (PDF / Video / Nota Bab) ─────────────────────────────
export const lessonsMaterials = pgTable('lessons_materials', {
  id: uuid('id').defaultRandom().primaryKey(),
  subjectId: uuid('subject_id')
    .references(() => subjects.id, { onDelete: 'cascade' })
    .notNull(),
  quizId: uuid('quiz_id'),
  chapterTitle: text('chapter_title'),
  title: text('title').notNull(),
  type: text('type').notNull(), // 'pdf', 'video', 'notes'
  contentUrl: text('content_url').default(''),
  summary: text('summary'),
  keyPoints: jsonb('key_points').$type<string[]>(),
  formulaOrVocabulary: jsonb('formula_or_vocabulary').$type<string[]>(),
  examTip: text('exam_tip'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── 5. Kuiz & Pertandingan ─────────────────────────────────────────────────
export const quizzesTournaments = pgTable('quizzes_tournaments', {
  id: uuid('id').defaultRandom().primaryKey(),
  subjectId: uuid('subject_id')
    .references(() => subjects.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description'),
  emoji: text('emoji'),
  difficulty: text('difficulty'), // 'MUDAH', 'SEDERHANA', 'SUKAR'
  durationMinutes: integer('duration_minutes').default(10),
  isTournament: boolean('is_tournament').default(false).notNull(),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  isActive: boolean('is_active').default(false).notNull(),
  lastOpenedAt: timestamp('last_opened_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── 6. Soalan ──────────────────────────────────────────────────────────────
export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  quizId: uuid('quiz_id')
    .references(() => quizzesTournaments.id, { onDelete: 'cascade' })
    .notNull(),
  questionText: text('question_text').notNull(),
  options: jsonb('options').$type<string[]>().notNull(), // ["A", "B", "C", "D"]
  correctAnswer: text('correct_answer').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── 7. Percubaan Kuiz ──────────────────────────────────────────────────────
export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  childId: uuid('child_id')
    .references(() => children.id, { onDelete: 'cascade' })
    .notNull(),
  quizId: uuid('quiz_id')
    .references(() => quizzesTournaments.id, { onDelete: 'cascade' })
    .notNull(),
  score: integer('score').default(0).notNull(),
  passed: boolean('passed').default(false).notNull(),
  xpEarned: integer('xp_earned').default(0).notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});

// ─── 8. Anugerah & Sijil ────────────────────────────────────────────────────
export const rewardsCertificates = pgTable('rewards_certificates', {
  id: uuid('id').defaultRandom().primaryKey(),
  childId: uuid('child_id')
    .references(() => children.id, { onDelete: 'cascade' })
    .notNull(),
  type: text('type', { enum: ['badge', 'medal_bronze', 'medal_silver', 'medal_gold', 'certificate'] })
    .notNull(),
  title: text('title').notNull(),
  description: text('description'),
  qrCodeHash: text('qr_code_hash'),
  certId: text('cert_id'),
  score: integer('score'),
  competitionTitle: text('competition_title'),
  awardedAt: timestamp('awarded_at').defaultNow().notNull(),
});

// ─── 9. Pengumuman (Announcements) ───────────────────────────────────────────
export const announcements = pgTable('announcements', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').default('Umum'),
  targetAudience: text('target_audience').default('Semua'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── 10. Tempahan Fizikal (Medal & Sijil) ────────────────────────────────────
export const physicalOrders = pgTable('physical_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: text('order_number').notNull(),
  parentId: uuid('parent_id').references(() => profiles.id, { onDelete: 'set null' }),
  childId: uuid('child_id').references(() => children.id, { onDelete: 'set null' }),
  awardId: uuid('award_id').references(() => rewardsCertificates.id, { onDelete: 'set null' }),
  guardianName: text('guardian_name').notNull(),
  phone: text('phone').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  productType: text('product_type').notNull(), // 'bundle', 'medal', 'certificate'
  productName: text('product_name').notNull(),
  awardTitle: text('award_title'),
  childName: text('child_name'),
  totalAmount: integer('total_amount').notNull(),
  paymentMethod: text('payment_method').default('fpx'),
  status: text('status').default('Baru').notNull(), // 'Baru', 'Sedang Diproses', 'Dihantar'
  trackingNumber: text('tracking_number'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Types ──────────────────────────────────────────────────────────────────
export type Profile = InferSelectModel<typeof profiles>;
export type NewProfile = InferInsertModel<typeof profiles>;
export type Child = InferSelectModel<typeof children>;
export type NewChild = InferInsertModel<typeof children>;
export type Subject = InferSelectModel<typeof subjects>;
export type LessonMaterial = InferSelectModel<typeof lessonsMaterials>;
export type QuizTournament = InferSelectModel<typeof quizzesTournaments>;
export type Question = InferSelectModel<typeof questions>;
export type QuizAttempt = InferSelectModel<typeof quizAttempts>;
export type RewardCertificate = InferSelectModel<typeof rewardsCertificates>;
export type Announcement = InferSelectModel<typeof announcements>;
export type NewAnnouncement = InferInsertModel<typeof announcements>;
export type PhysicalOrder = InferSelectModel<typeof physicalOrders>;
export type NewPhysicalOrder = InferInsertModel<typeof physicalOrders>;

// ─── 11. Senarai Sekolah ─────────────────────────────────────────────────────
export const schools = pgTable('schools', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: text('type').default('SK').notNull(),
  code: text('code'),
  state: text('state').default('W.P. Kuala Lumpur'),
  aliases: jsonb('aliases').$type<string[]>().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type School = InferSelectModel<typeof schools>;
export type NewSchool = InferInsertModel<typeof schools>;