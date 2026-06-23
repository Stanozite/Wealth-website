/* ============================================================
   Wealth Compass · brand config (single point of truth)
   TODO(Tin): เปลี่ยนชื่อบริษัท/โดเมน/ช่องทางติดต่อที่นี่ที่เดียว
   ทุกหน้า (nav, footer, JSON-LD, CTA) ดึงจากไฟล์นี้
   ============================================================ */
(function () {
  'use strict';
  window.BRAND = {
    // product name (the tools hub)
    product: { th: 'Wealth Compass', en: 'Wealth Compass' },
    mark: 'W',
    // firm name · placeholder until company name is final
    firm: { th: 'ทิน เวลธ์ แอดไวเซอรี่', en: 'Tin Wealth Advisory' },
    tagline: {
      th: 'เครื่องมือวางแผนการเงินมาตรฐานสากล สำหรับคนไทย',
      en: 'World-class financial planning tools, built for Thailand'
    },
    domain: 'https://wealthcompass.example.com', // TODO: real domain
    email: 'hello@example.com',                   // TODO: real email
    line: '@wealthcompass',                       // TODO: real LINE OA
    phone: '+66-0-0000-0000',                     // TODO: real phone
    formspree: '',                                 // TODO: Formspree endpoint e.g. https://formspree.io/f/xxxx
    locale: { geoRegion: 'TH-10', place: 'Bangkok, Thailand', lat: '13.7563', lon: '100.5018' },
    // Supabase backend (admin + articles DB) · run supabase/migrations/001_articles.sql first
    // Dashboard > Settings > API: Project URL + anon public key
    supabase: {
      url: '',       // e.g. https://abcd1234.supabase.co
      anonKey: ''    // anon public key (safe to expose · RLS protects writes)
    }
  };
})();
