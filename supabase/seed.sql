-- ===========================================================================
--  portodirly — data contoh (EN + ID)
--  Jalankan SETELAH schema.sql.  Aman dijalankan berulang: tidak ada
--  duplikasi, karena slug nama unik dipakai sebagai kunci "on conflict".
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Profil & pengaturan
-- ---------------------------------------------------------------------------

insert into public.profiles (
  id, full_name,
  status_label_en, status_label_id,
  kicker_en, kicker_id,
  headline_en, headline_id,
  tagline_en, tagline_id,
  cta_primary_label_en, cta_primary_label_id, cta_primary_href,
  cta_secondary_label_en, cta_secondary_label_id, cta_secondary_href,
  avatar_url,
  about_title_en, about_title_id,
  about_body_en, about_body_id,
  about_photo_url,
  email, phone,
  location_en, location_id,
  site_title_en, site_title_id,
  site_description_en, site_description_id
)
values (
  1,
  'Dirly Pratama',
  'Open to work', 'Terbuka untuk kerja',
  'Full-stack developer based in Indonesia', 'Full-stack developer dari Indonesia',
  'I build fast, accessible, and beautifully simple web products.',
  'Saya membuat produk web yang cepat, aksesibel, dan sederhana.',
  'I turn ideas into production-ready interfaces with clean architecture and careful attention to detail.',
  'Saya mengubah ide menjadi antarmuka siap pakai dengan arsitektur bersih dan perhatian pada detail.',
  'View my work', 'Lihat karya saya', '#projects',
  'Get in touch', 'Hubungi saya', '#contact',
  null,
  'A little about me', 'Sedikit tentang saya',
  E'I''m a full-stack developer who enjoys the whole journey — from shaping a rough idea into a clear product plan, to writing the server code that keeps it running, to polishing the last 10% of the interface that makes an app feel effortless.\n\nOver the past few years I''ve shipped dashboards, e-commerce storefronts, internal tools, and marketing sites. I care about performance budgets, accessible markup, and code that the next person can read without a map.',
  E'Saya seorang full-stack developer yang menikmati seluruh perjalanan — dari membentuk ide kasar menjadi rencana produk yang jelas, menulis kode server yang menjaga semuanya berjalan, hingga memoles 10% terakhir antarmuka yang membuat aplikasi terasa ringan.\n\nBeberapa tahun terakhir saya telah mengirim dashboard, toko e-commerce, tools internal, dan situs marketing. Saya peduli pada anggaran performa, markup yang aksesibel, dan kode yang mudah dibaca orang berikutnya.',
  null,
  'hello@dirly.dev', '+62 812 0000 0000',
  'Jakarta, Indonesia', 'Jakarta, Indonesia',
  'Dirly Pratama — Full-stack Developer', 'Dirly Pratama — Full-stack Developer',
  'Portfolio of Dirly Pratama, a full-stack developer building fast and accessible web products.',
  'Portofolio Dirly Pratama, full-stack developer yang membangun produk web cepat dan aksesibel.'
)
on conflict (id) do update set
  full_name = excluded.full_name,
  updated_at = now();

insert into public.settings (id, default_theme) values (1, 'system')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Sosial media
-- ---------------------------------------------------------------------------

insert into public.social_links (label, url, icon, sort_order, is_visible)
values
  ('GitHub',   'https://github.com/yourhandle', 'github',   1, true),
  ('LinkedIn', 'https://linkedin.com/in/yourhandle', 'linkedin', 2, true),
  ('X',        'https://x.com/yourhandle',      'x',        3, true),
  ('Dribbble', 'https://dribbble.com/yourhandle','dribbble', 4, false)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Keahlian
-- ---------------------------------------------------------------------------

insert into public.skills (name_en, name_id, category_en, category_id, icon, level, sort_order, is_visible)
values
  ('TypeScript',   'TypeScript',   'Frontend', 'Frontend', 'typescript', 92, 1,  true),
  ('React',        'React',        'Frontend', 'Frontend', 'react',      90, 2,  true),
  ('Next.js',      'Next.js',      'Frontend', 'Frontend', 'nextjs',     88, 3,  true),
  ('Tailwind CSS', 'Tailwind CSS', 'Frontend', 'Frontend', 'tailwind',   90, 4,  true),
  ('Node.js',      'Node.js',      'Backend',  'Backend',  'nodejs',     86, 5,  true),
  ('PostgreSQL',   'PostgreSQL',   'Backend',  'Backend',  'postgres',   80, 6,  true),
  ('Supabase',     'Supabase',     'Backend',  'Backend',  'supabase',   84, 7,  true),
  ('Docker',       'Docker',       'DevOps',   'DevOps',   'docker',     72, 8,  true),
  ('Figma',        'Figma',        'Design',   'Desain',   'figma',      70, 9,  true)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Proyek
-- ---------------------------------------------------------------------------

insert into public.projects (
  slug, title_en, title_id, summary_en, summary_id,
  description_en, description_id, category_en, category_id,
  cover_url, tech_tags, live_url, repo_url, is_featured, is_visible, sort_order
)
values
(
  'nimbus-analytics',
  'Nimbus Analytics', 'Nimbus Analytics',
  'Real-time product analytics dashboard with custom event pipelines.',
  'Dashboard analitik produk real-time dengan pipeline event kustom.',
  E'Nimbus ingests millions of events per day and turns them into live dashboards.\n\nThe hard part was not the charts — it was making filtering feel instant. I moved the hot path to a materialised view refreshed on a schedule, added a lightweight in-browser cache keyed by filter signature, and capped every query so a bad filter can never take the API down.\n\nI also built the whole admin experience: role-based access, saved views, and an export pipeline that streams CSV without buffering the result set in memory.',
  E'Nimbus memproses jutaan event per hari dan mengubahnya menjadi dashboard langsung.\n\nBagian sulitnya bukan grafiknya — melainkan membuat filter terasa instan. Saya memindahkan hot path ke materialised view yang dijadwalkan, menambahkan cache ringan di browser yang dikunci signature filter, dan membatasi setiap query agar filter buruk tidak pernah menjatuhkan API.\n\nSaya juga membangun seluruh pengalamannya: akses berbasis peran, saved view, dan pipeline export yang men-stream CSV tanpa menampung result set di memori.',
  'Web',
  'Next.js,TypeScript,PostgreSQL,Tailwind CSS',
  'https://example.com/nimbus', 'https://github.com/yourhandle/nimbus',
  true, true, 1
),
(
  'sagara-commerce',
  'Sagara Commerce', 'Sagara Commerce',
  'Headless storefront for an Indonesian lifestyle brand.',
  'Storefront headless untuk brand lifestyle Indonesia.',
  E'A headless storefront with server-rendered product pages, edge-cached category listings, and a checkout that survives flaky mobile connections.\n\nProduct pages are fully server-rendered for SEO, while the cart lives in a small client store with optimistic updates. Checkout uses an idempotency key so a double-tap on a slow connection cannot create two orders.',
  E'Storefront headless dengan halaman produk server-render, daftar kategori yang di-cache di edge, dan checkout yang bertahan pada koneksi mobile yang labil.\n\nHalaman produk dirender penuh di server demi SEO, sementara keranjang hidup di store client kecil dengan update optimis. Checkout memakai idempotency key sehingga ketukan ganda pada koneksi lambat tidak membuat dua pesanan.',
  'E-commerce',
  'Next.js,TypeScript,Supabase,Tailwind CSS',
  'https://example.com/sagara', 'https://github.com/yourhandle/sagara',
  true, true, 2
),
(
  'atlas-design-system',
  'Atlas Design System', 'Atlas Design System',
  'A component library and token pipeline used across five internal apps.',
  'Library komponen dan pipeline token yang dipakai di lima aplikasi internal.',
  E'Atlas is a design system with a token pipeline: designers edit tokens in Figma, a sync job pushes them to a JSON source of truth, and a build step generates Tailwind theme entries plus typed constants.\n\nThe win was not the tooling — it was adoption. I wrote migration codemods so existing apps could move incrementally, and shipped a lint rule that flags direct colour literals.',
  E'Atlas adalah design system dengan pipeline token: desainer mengedit token di Figma, job sync mendorongnya ke JSON sebagai sumber kebenaran, dan langkah build menghasilkan entri tema Tailwind plus konstanta bertipe.\n\nKemenangannya bukan pada tooling — melainkan adopsi. Saya menulis codemod migrasi agar aplikasi lama bisa berpindah bertahap, dan mengirim lint rule yang menandai literal warna langsung.',
  'Tooling',
  'React,TypeScript,Storybook',
  null, 'https://github.com/yourhandle/atlas',
  false, true, 3
),
(
  'lumen-mobile',
  'Lumen Companion', 'Lumen Companion',
  'Offline-first companion app for a meditation platform.',
  'Aplikasi pendamping offline-first untuk platform meditasi.',
  E'Lumen keeps downloaded sessions playable with no connection at all. I built a background sync queue that reconciles progress on reconnect, and made sure the audio player keeps its position across app restarts.\n\nStorage is a local SQLite file mirrored to the cloud when the device is back online, with conflict resolution that simply keeps the furthest progress.',
  E'Lumen menjaga sesi yang diunduh tetap bisa diputar tanpa koneksi sama sekali. Saya membangun antrean sync latar yang merekonsiliasi progres saat tersambung kembali, dan memastikan pemutar audio mempertahankan posisinya setelah aplikasi dibuka ulang.\n\nPenyimpanan berupa file SQLite lokal yang di-mirror ke cloud saat perangkat kembali online, dengan resolusi konflik yang sederhana: ambil progres terjauh.',
  'Mobile',
  'React Native,TypeScript,SQLite',
  null, 'https://github.com/yourhandle/lumen',
  false, true, 4
),
(
  'kilat-landing',
  'Kilat Landing Kit', 'Kilat Landing Kit',
  'A 100/100 Lighthouse landing page template with zero client JS on first paint.',
  'Template landing page Lighthouse 100/100 tanpa JS klien pada paint pertama.',
  E'A landing page that ships no JavaScript on first paint: the hero, pricing table, and FAQ are all server-rendered, with interactivity hydrated lazily only when scrolled into view.\n\nThe trick is a small IntersectionObserver island that loads the pricing toggle bundle on demand. Everything else is plain HTML and CSS, which keeps the page fast on 3G.',
  E'Landing page yang tidak mengirim JavaScript pada paint pertama: hero, tabel harga, dan FAQ semuanya dirender server, dengan interaktivitas yang di-hydrate secara malas hanya saat masuk viewport.\n\nRahasianya adalah island IntersectionObserver kecil yang memuat bundle toggle harga sesuai permintaan. Sisanya HTML dan CSS biasa, yang menjaga halaman tetap cepat di 3G.',
  'Web',
  'Next.js,Tailwind CSS',
  'https://example.com/kilat', 'https://github.com/yourhandle/kilat',
  false, true, 5
)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Pengalaman
-- ---------------------------------------------------------------------------

insert into public.experiences (
  role_en, role_id, company, company_url, location_en, location_id,
  start_date, end_date, description_en, description_id, sort_order, is_visible
)
values
(
  'Senior Full-stack Developer', 'Senior Full-stack Developer',
  'PT Nusantara Digital', 'https://example.com',
  'Jakarta, Indonesia', 'Jakarta, Indonesia',
  '2023-02-01', null,
  E'Lead a squad of four shipping the analytics platform. I owned the query layer, cut p95 dashboard load from 4.2s to 800ms, and set up the CI pipeline that now runs typecheck, lint, and integration tests on every pull request.',
  E'Memimpin squad beranggotakan empat orang yang mengirim platform analitik. Saya memegang lapisan query, memangkas p95 load dashboard dari 4,2 detik menjadi 800ms, dan memasang pipeline CI yang kini menjalankan typecheck, lint, dan integration test di setiap pull request.',
  1, true
),
(
  'Frontend Developer', 'Frontend Developer',
  'Karya Studio', 'https://example.com',
  'Bandung, Indonesia', 'Bandung, Indonesia',
  '2021-01-01', '2023-01-31',
  E'Built marketing sites and admin tools for a dozen client accounts. Introduced a shared component kit that removed roughly 30% of duplicated UI code across projects.',
  E'Membangun situs marketing dan tools admin untuk belasan akun klien. Memperkenalkan kit komponen bersama yang menghapus sekitar 30% kode UI duplikat antar proyek.',
  2, true
),
(
  'Junior Web Developer', 'Junior Web Developer',
  'Freelance', null,
  'Remote', 'Remote',
  '2019-06-01', '2020-12-31',
  E'Freelance work for small businesses: WordPress handoffs, custom themes, and the occasional Shopify build. Where I learned to scope a project honestly.',
  E'Pekerjaan freelance untuk bisnis kecil: handover WordPress, tema kustom, dan sesekali build Shopify. Di situlah saya belajar menakar proyek secara jujur.',
  3, true
)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Pendidikan
-- ---------------------------------------------------------------------------

insert into public.educations (
  institution, degree_en, degree_id, field_en, field_id,
  location_en, location_id, start_date, end_date,
  description_en, description_id, sort_order, is_visible
)
values
(
  'Universitas Indonesia',
  'Bachelor of Computer Science', 'Sarjana Ilmu Komputer',
  'Software Engineering', 'Rekayasa Perangkat Lunak',
  'Depok, Indonesia', 'Depok, Indonesia',
  '2017-08-01', '2021-06-30',
  E'Focused on distributed systems and human-computer interaction. Final year project: a scheduling engine for campus labs that is still in use.',
  E'Fokus pada sistem terdistribusi dan interaksi manusia-komputer. Proyek akhir: mesin penjadwalan lab kampus yang masih dipakai hingga kini.',
  1, true
),
(
  'FreeCodeCamp',
  'Responsive Web Design Certification', 'Sertifikasi Responsive Web Design',
  'Web Development', 'Pengembangan Web',
  'Online', 'Daring',
  '2019-01-01', '2019-05-30',
  E'Completed the full certification track, including the final certification projects.',
  E'Menyelesaikan seluruh jalur sertifikasi, termasuk proyek sertifikasi akhir.',
  2, true
)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Sertifikat
-- ---------------------------------------------------------------------------

insert into public.certificates (
  name_en, name_id, issuer_en, issuer_id,
  issued_date, expires_date, credential_url, image_url,
  sort_order, is_visible
)
values
(
  'AWS Certified Developer – Associate', 'AWS Certified Developer – Associate',
  'Amazon Web Services', 'Amazon Web Services',
  '2024-03-15', '2027-03-15',
  'https://example.com/cred/aws-dev', null,
  1, true
),
(
  'Meta Front-End Developer Professional Certificate', 'Meta Front-End Developer Professional Certificate',
  'Meta', 'Meta',
  '2023-08-01', null,
  'https://example.com/cred/meta-fe', null,
  2, true
),
(
  'Supabase Integration Certification', 'Supabase Integration Certification',
  'Supabase', 'Supabase',
  '2025-01-20', null,
  'https://example.com/cred/supabase', null,
  3, true
)
on conflict do nothing;
