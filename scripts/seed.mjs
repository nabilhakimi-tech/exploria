import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function seed() {
  console.log('🚀 Memulakan penghijrahan dan kemasukan data ke dalam Supabase...');

  // 1. Ensure optional columns exist
  await sql`
    ALTER TABLE children
    ADD COLUMN IF NOT EXISTS school_name TEXT,
    ADD COLUMN IF NOT EXISTS gender TEXT,
    ADD COLUMN IF NOT EXISTS color TEXT;
  `;

  await sql`
    ALTER TABLE quizzes_tournaments
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS emoji TEXT,
    ADD COLUMN IF NOT EXISTS difficulty TEXT,
    ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 10;
  `;

  await sql`
    ALTER TABLE rewards_certificates
    ADD COLUMN IF NOT EXISTS score INTEGER,
    ADD COLUMN IF NOT EXISTS cert_id TEXT,
    ADD COLUMN IF NOT EXISTS competition_title TEXT;
  `;

  console.log('✅ Struktur lajur jadual diselaraskan.');

  // Clean existing rows in cascade order
  await sql`TRUNCATE rewards_certificates, quiz_attempts, questions, quizzes_tournaments, lessons_materials, subjects, children, profiles CASCADE;`;
  console.log('🧹 Jadual dikosongkan untuk kemasukan data rasmi.');

  // 2. Profiles (Parents, Staff, Admin)
  const ahmadId = '11111111-1111-1111-1111-111111111111';
  const sitiId = '22222222-2222-2222-2222-222222222222';
  const tanId = '33333333-3333-3333-3333-333333333333';
  const muthuId = '44444444-4444-4444-4444-444444444444';
  const staffId = '55555555-5555-5555-5555-555555555555';
  const adminId = '66666666-6666-6666-6666-666666666666';

  await sql`
    INSERT INTO profiles (id, email, role, full_name, phone, ic_number, is_approved)
    VALUES 
      (${ahmadId}, 'ahmad@example.com', 'parent', 'Ahmad bin Razak', '012-3456789', '850101-10-5555', true),
      (${sitiId}, 'siti@example.com', 'parent', 'Siti Nurhaliza binti Osman', '013-9876543', '880303-08-6666', true),
      (${tanId}, 'tan@example.com', 'parent', 'Tan Ah Kao', '019-1112222', '800505-14-7777', true),
      (${muthuId}, 'muthu@example.com', 'parent', 'Muthusamy a/l Ramasamy', '016-3334444', '820707-10-8888', true),
      (${staffId}, 'staff@exploria.my', 'staff', 'Aina binti Zulkifli (Staf Exploria)', '017-8889999', '900202-14-1111', true),
      (${adminId}, 'admin@exploria.my', 'admin', 'Pentadbir Utama Exploria', '011-99990000', '800101-14-9999', true);
  `;
  console.log('✅ Profil pengguna dimasukkan ke Supabase.');

  // 3. Children
  const adamId = 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const aisyahAhmadId = 'a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const aisyahOsmanId = 'a3333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const tanMeiLingId = 'a4444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const tanWeiMingId = 'a5555555-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const raviId = 'a6666666-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  await sql`
    INSERT INTO children (id, parent_id, full_name, school_type, grade, school_name, gender, color, xp, level, avatar_url)
    VALUES
      (${adamId}, ${ahmadId}, 'Adam bin Ahmad', 'SK', 'Darjah 4', 'SK Bandar Baru Bangi', 'Lelaki', '#5aa99b', 1250, 5, '👦'),
      (${aisyahAhmadId}, ${ahmadId}, 'Aisyah binti Ahmad', 'SK', 'Darjah 2', 'SK Bandar Baru Bangi', 'Perempuan', '#3f8f9a', 800, 3, '👧'),
      (${aisyahOsmanId}, ${sitiId}, 'Aisyah binti Osman', 'SMK', 'Tingkatan 2', 'SMK Jalan Empat', 'Perempuan', '#f5994a', 500, 2, '👧'),
      (${tanMeiLingId}, ${tanId}, 'Tan Mei Ling', 'SK', 'Darjah 5', 'SJK(C) Sungai Chua', 'Perempuan', '#e8574f', 2100, 6, '👧'),
      (${tanWeiMingId}, ${tanId}, 'Tan Wei Ming', 'SMK', 'Tingkatan 1', 'SMK Jalan Reko', 'Lelaki', '#7a6be0', 1800, 5, '👦'),
      (${raviId}, ${muthuId}, 'Ravi a/l Muthusamy', 'SK', 'Darjah 3', 'SJK(T) Kajang', 'Lelaki', '#7fb8d6', 800, 3, '👦');
  `;
  console.log('✅ Rekod anak/pelajar dimasukkan ke Supabase.');

  // 4. Subjects (valid hex UUIDs)
  const sainsSkId = 'ba111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const mathSkId = 'ba222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const bmSkId = 'ba333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const biSkId = 'ba444444-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const sainsSmkId = 'ba555555-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const mathSmkId = 'ba666666-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const bmSmkId = 'ba777777-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  await sql`
    INSERT INTO subjects (id, title, description, category)
    VALUES
      (${sainsSkId}, 'Sains SK', 'Eksplorasi Sains Alam, Angkasa Lepas, Daya, dan Sistem Suria', 'SK'),
      (${mathSkId}, 'Matematik SK', 'Nombor Bulat, Sifir Pantas, Pecahan, Perpuluhan dan Wang', 'SK'),
      (${bmSkId}, 'Bahasa Melayu SK', 'Tatabahasa, Imbuhan, Simpulan Bahasa, dan Pemahaman Teks', 'SK'),
      (${biSkId}, 'Bahasa Inggeris SK', 'English Grammar, Vocabulary, Phonics and Reading Comprehension', 'SK'),
      (${sainsSmkId}, 'Sains SMK', 'Biologi Sel, Kimia Organik, dan Asas Fizik Menengah Rendah', 'SMK'),
      (${mathSmkId}, 'Matematik SMK', 'Algebra, Persamaan Linear, Geometri dan Statistik Menengah', 'SMK'),
      (${bmSmkId}, 'Bahasa Melayu SMK', 'Komsas Puisi/Prosa, Tatabahasa Lanjutan dan Karangan Deskriptif', 'SMK');
  `;
  console.log('✅ Subjek dimasukkan ke Supabase.');

  // 5. Lessons & Materials
  await sql`
    INSERT INTO lessons_materials (subject_id, title, type, content_url)
    VALUES
      (${sainsSkId}, 'Modul Lengkap Sistem Suria & Planet', 'pdf', 'https://exploria.my/materials/sains-sistem-suria.pdf'),
      (${sainsSkId}, 'Video Interaktif: Penerokaan Galaksi & Angkasa Lepas', 'video', 'https://www.youtube.com/watch?v=libKVRa01L8'),
      (${mathSkId}, 'Nota Padat Pecahan, Perpuluhan & Peratus', 'pdf', 'https://exploria.my/materials/matematik-pecahan.pdf'),
      (${mathSkId}, 'Video Trik Pantas Sifir 1 hingga 12', 'video', 'https://www.youtube.com/watch?v=example-sifir'),
      (${bmSkId}, 'Panduan Simpulan Bahasa Bergambar', 'pdf', 'https://exploria.my/materials/bm-simpulan-bahasa.pdf'),
      (${biSkId}, 'English Grammar & Action Verbs Flashcards', 'pdf', 'https://exploria.my/materials/english-verbs.pdf'),
      (${sainsSmkId}, 'Modul Struktur Sel Haiwan & Tumbuhan Tingkatan 1-3', 'pdf', 'https://exploria.my/materials/smk-sel.pdf'),
      (${mathSmkId}, 'Panduan Formula Algebra & Ungkapan Algebra Tingkatan 2', 'pdf', 'https://exploria.my/materials/smk-algebra.pdf');
  `;
  console.log('✅ Bahan pelajaran & modul dimasukkan ke Supabase.');

  // 6. Quizzes & Tournaments (valid hex UUIDs)
  const spaceCompId = 'ca111111-cccc-cccc-cccc-cccccccccccc';
  const mathCompId = 'ca222222-cccc-cccc-cccc-cccccccccccc';
  const spellingCompId = 'ca333333-cccc-cccc-cccc-cccccccccccc';

  const quizSpaceDailyId = 'ca444444-cccc-cccc-cccc-cccccccccccc';
  const quizMathDailyId = 'ca555555-cccc-cccc-cccc-cccccccccccc';
  const quizBmDailyId = 'ca666666-cccc-cccc-cccc-cccccccccccc';
  const quizBiDailyId = 'ca777777-cccc-cccc-cccc-cccccccccccc';

  await sql`
    INSERT INTO quizzes_tournaments (id, subject_id, title, description, emoji, difficulty, duration_minutes, is_tournament, start_time, end_time, is_active)
    VALUES
      (${spaceCompId}, ${sainsSkId}, 'Cabaran Sains & Angkasa Lepas Kebangsaan 2026', 'Peperiksaan rasmi menguji astronomi, graviti, sistem suria dan teknologi angkasa lepas.', '🚀', 'SEDERHANA', 10, true, NOW() - INTERVAL '5 days', NOW() + INTERVAL '15 days', true),
      (${mathCompId}, ${mathSkId}, 'Olimpiad Matematik & Pantas Sifir Exploria 2026', 'Peperiksaan berprestij menguji kepantasan sifir, penyelesaian masalah berayat dan pecahan.', '🧮', 'SUKAR', 10, true, NOW() - INTERVAL '2 days', NOW() + INTERVAL '20 days', true),
      (${spellingCompId}, ${biSkId}, 'National Spelling & Vocabulary Grand Prix', 'Pertandingan ejaan dan kosa kata Bahasa Inggeris tahap kebangsaan yang dinilai secara automatik.', '🇬🇧', 'SEDERHANA', 15, true, NOW() + INTERVAL '10 days', NOW() + INTERVAL '25 days', false),
      (${quizSpaceDailyId}, ${sainsSkId}, 'Kuiz Sains: Sistem Suria & Planet', 'Kuiz santai mengenal 8 planet dan matahari.', '🪐', 'MUDAH', 5, false, null, null, true),
      (${quizMathDailyId}, ${mathSkId}, 'Kuiz Matematik: Pecahan & Sifir', 'Latihan pantas sifir dan pecahan asas.', '➗', 'MUDAH', 5, false, null, null, true),
      (${quizBmDailyId}, ${bmSkId}, 'Kuiz Bahasa Melayu: Simpulan Bahasa & Imbuhan', 'Uji kefahaman simpulan bahasa harian dan imbuhan awalan.', '📚', 'SEDERHANA', 5, false, null, null, true),
      (${quizBiDailyId}, ${biSkId}, 'English Word Adventure', 'Master vocabulary and everyday English phrases.', '🔤', 'MUDAH', 5, false, null, null, true);
  `;
  console.log('✅ Kuiz harian dan pertandingan rasmi dimasukkan ke Supabase.');

  // 7. Questions
  // Questions for Space Competition
  await sql`
    INSERT INTO questions (quiz_id, question_text, options, correct_answer)
    VALUES
      (${spaceCompId}, 'Planet manakah yang dikenali sebagai "Planet Merah" kerana kehadiran besi oksida pada permukaannya?', ${sql.json(['Utarid', 'Zuhrah', 'Marikh', 'Musytari'])}, 'Marikh'),
      (${spaceCompId}, 'Apakah sumber tenaga utama bagi Sistem Suria kita?', ${sql.json(['Bulan', 'Matahari', 'Bima Sakti', 'Komet Halley'])}, 'Matahari'),
      (${spaceCompId}, 'Daya manakah yang mengekalkan planet-planet sentiasa beredar dalam orbit mengelilingi Matahari?', ${sql.json(['Daya Geseran', 'Daya Magnet', 'Daya Graviti', 'Daya Tolakan Udara'])}, 'Daya Graviti'),
      (${spaceCompId}, 'Berapakah bilangan planet rasmi dalam Sistem Suria kita?', ${sql.json(['7 planet', '8 planet', '9 planet', '10 planet'])}, '8 planet'),
      (${spaceCompId}, 'Objek angkasa yang menghasilkan cahaya sendiri dikenali sebagai:', ${sql.json(['Planet', 'Satelit semula jadi', 'Bintang', 'Asteroid'])}, 'Bintang'),
      (${spaceCompId}, 'Lapisan atmosfera Bumi yang melindungi hidupan daripada radiasi ultraviolet berbahaya ialah:', ${sql.json(['Lapisan Troposfera', 'Lapisan Ozon', 'Lapisan Mesosfera', 'Lapisan Eksosfera'])}, 'Lapisan Ozon'),
      (${spaceCompId}, 'Fenomena pasang surut air laut di Bumi dipengaruhi terutamanya oleh tarikan graviti:', ${sql.json(['Bulan', 'Marikh', 'Zuhal', 'Stesen Angkasa Antarabangsa'])}, 'Bulan'),
      (${spaceCompId}, 'Teleskop angkasa tercanggih yang dilancarkan pada tahun 2021 untuk meneroka galaksi purba ialah:', ${sql.json(['Hubble Telescope', 'James Webb Space Telescope', 'Voyager 1', 'Apollo 11'])}, 'James Webb Space Telescope');
  `;

  // Questions for Math Competition
  await sql`
    INSERT INTO questions (quiz_id, question_text, options, correct_answer)
    VALUES
      (${mathCompId}, 'Berapakah hasil darab bagi 9 × 8?', ${sql.json(['64', '72', '81', '68'])}, '72'),
      (${mathCompId}, 'Cari nilai bagi: (12 × 5) + (7 × 6) = ?', ${sql.json(['102', '108', '96', '112'])}, '102'),
      (${mathCompId}, 'Sebuah roket memerlukan 8 unit bahan api untuk setiap minit penerbangan. Berapakah unit diperlukan untuk 7 minit?', ${sql.json(['48 unit', '54 unit', '56 unit', '64 unit'])}, '56 unit'),
      (${mathCompId}, 'Jika 6 × [ ? ] = 54, apakah nilai dalam kurungan?', ${sql.json(['7', '8', '9', '11'])}, '9'),
      (${mathCompId}, 'Berapakah nilai pecahan bagi 3/4 daripada 60?', ${sql.json(['45', '40', '50', '35'])}, '45'),
      (${mathCompId}, '72 dibahagi dengan 8, kemudian didarab dengan 4 ialah:', ${sql.json(['28', '32', '36', '40'])}, '36'),
      (${mathCompId}, 'Adam mempunyai 120 biji guli. Dia memberi 2/5 daripadanya kepada adiknya. Berapakah baki guli Adam?', ${sql.json(['48', '60', '72', '80'])}, '72'),
      (${mathCompId}, 'Berapakah nombor gandaan 7 yang terletak antara 40 dan 50?', ${sql.json(['42 dan 49', '44 dan 48', '43 dan 47', '41 dan 48'])}, '42 dan 49');
  `;

  // Daily Science Questions
  await sql`
    INSERT INTO questions (quiz_id, question_text, options, correct_answer)
    VALUES
      (${quizSpaceDailyId}, 'Bulan adalah contoh kepada:', ${sql.json(['Satelit semula jadi', 'Planet kerdil', 'Bintang bersinar', 'Asteroid'])}, 'Satelit semula jadi'),
      (${quizSpaceDailyId}, 'Planet yang terbesar dalam Sistem Suria ialah:', ${sql.json(['Bumi', 'Marikh', 'Musytari', 'Neptun'])}, 'Musytari'),
      (${quizSpaceDailyId}, 'Berapakah masa yang diambil oleh Bumi untuk melengkapkan satu putaran pada paksinya?', ${sql.json(['12 jam', '24 jam', '365 hari', '30 hari'])}, '24 jam');
  `;

  // Daily Math Questions
  await sql`
    INSERT INTO questions (quiz_id, question_text, options, correct_answer)
    VALUES
      (${quizMathDailyId}, 'Berapakah 1/2 + 1/4?', ${sql.json(['2/6', '3/4', '1/4', '2/4'])}, '3/4'),
      (${quizMathDailyId}, 'Nilai bagi 7 × 7 ialah:', ${sql.json(['42', '49', '56', '54'])}, '49'),
      (${quizMathDailyId}, 'Tukarkan 0.75 kepada bentuk pecahan termudah:', ${sql.json(['1/2', '3/4', '2/3', '4/5'])}, '3/4');
  `;

  // Daily BM Questions
  await sql`
    INSERT INTO questions (quiz_id, question_text, options, correct_answer)
    VALUES
      (${quizBmDailyId}, 'Apakah maksud simpulan bahasa "Ulat Buku"?', ${sql.json(['Orang yang suka membaca buku', 'Orang yang malas belajar', 'Buku yang telah rosak', 'Orang yang kuat tidur'])}, 'Orang yang suka membaca buku'),
      (${quizBmDailyId}, 'Pilih kata kerja berimbuhan yang betul bagi ayat: Ali sedang _____ bola di padang.', ${sql.json(['berlari', 'menyepak', 'bermain', 'sepakan'])}, 'menyepak');
  `;

  // Daily BI Questions
  await sql`
    INSERT INTO questions (quiz_id, question_text, options, correct_answer)
    VALUES
      (${quizBiDailyId}, 'Choose the correct plural form of "child":', ${sql.json(['childs', 'children', 'childrens', 'childes'])}, 'children'),
      (${quizBiDailyId}, 'She _____ to school every morning by bus.', ${sql.json(['go', 'goes', 'going', 'gone'])}, 'goes');
  `;
  console.log('✅ Bank soalan penuh dimasukkan ke Supabase.');

  // 8. Quiz Attempts (Historical learning activities)
  await sql`
    INSERT INTO quiz_attempts (child_id, quiz_id, score, passed, xp_earned, completed_at)
    VALUES
      (${adamId}, ${quizSpaceDailyId}, 90, true, 45, NOW() - INTERVAL '1 hour'),
      (${aisyahAhmadId}, ${quizMathDailyId}, 70, true, 35, NOW() - INTERVAL '4 hours'),
      (${adamId}, ${quizBmDailyId}, 60, true, 30, NOW() - INTERVAL '2 days'),
      (${aisyahAhmadId}, ${quizSpaceDailyId}, 100, true, 50, NOW() - INTERVAL '4 days'),
      (${adamId}, ${quizMathDailyId}, 80, true, 40, NOW() - INTERVAL '6 days'),
      (${aisyahAhmadId}, ${quizBiDailyId}, 80, true, 40, NOW() - INTERVAL '9 days'),
      (${tanMeiLingId}, ${quizMathDailyId}, 95, true, 50, NOW() - INTERVAL '1 day'),
      (${tanWeiMingId}, ${quizSpaceDailyId}, 85, true, 45, NOW() - INTERVAL '2 days'),
      (${raviId}, ${quizBmDailyId}, 75, true, 35, NOW() - INTERVAL '3 days');
  `;
  console.log('✅ Percubaan & aktiviti kuiz dimasukkan ke Supabase.');

  // 9. Rewards & Certificates
  await sql`
    INSERT INTO rewards_certificates (child_id, type, title, description, qr_code_hash, cert_id, score, competition_title, awarded_at)
    VALUES
      (${adamId}, 'medal_gold', 'Cabaran Sains & Angkasa Lepas Kebangsaan 2026', 'Anugerah Pingat Emas Peperiksaan Rasmi Kebangsaan dengan markah 100%', 'EXP-EMAS-2026-8492', 'EXP-EMAS-2026-8492', 100, 'Cabaran Sains & Angkasa Lepas Kebangsaan 2026', NOW() - INTERVAL '1 day'),
      (${aisyahAhmadId}, 'certificate', 'Sijil Kehadiran Penuh Bulanan', 'Hadir dan menyelesaikan aktiviti pembelajaran konsisten selama 30 hari', 'EXP-ATTEND-2026-1024', 'EXP-ATTEND-2026-1024', 100, 'Program Kehadiran Cemerlang Exploria', NOW() - INTERVAL '15 days'),
      (${adamId}, 'badge', 'Pemenang Kuiz Sains Berturut', 'Mencapai tempat teratas dalam modul sains angkasa', 'EXP-BADGE-2026-5512', 'EXP-BADGE-2026-5512', 90, 'Kuiz Sains Mingguan', NOW() - INTERVAL '10 days'),
      (${aisyahAhmadId}, 'medal_silver', 'Bintang Sains & Eksplorasi', 'Anugerah pencapaian sains darjah rendah', 'EXP-MEDAL-2026-3391', 'EXP-MEDAL-2026-3391', 85, 'Eksplorasi Sains Muda', NOW() - INTERVAL '20 days'),
      (${tanMeiLingId}, 'medal_gold', 'Olimpiad Matematik & Pantas Sifir Exploria 2026', 'Anugerah Pingat Emas Olimpiad Matematik Kebangsaan', 'EXP-EMAS-2026-9931', 'EXP-EMAS-2026-9931', 95, 'Olimpiad Matematik & Pantas Sifir Exploria 2026', NOW() - INTERVAL '3 days');
  `;
  console.log('✅ Sijil dan anugerah dimasukkan ke Supabase.');

  console.log('🎉 SELESAI: Kesemua dummy data telah berjaya dimasukkan ke dalam database Supabase!');
  await sql.end();
}

seed().catch((err) => {
  console.error('❌ Ralat semasa seeding database:', err);
  process.exit(1);
});
