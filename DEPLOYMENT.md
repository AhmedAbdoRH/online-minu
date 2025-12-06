# Online Menu - Vercel Deployment Guide

## استعداد المشروع للنشر على Vercel

المشروع جاهز تماماً للنشر على Vercel، وهي المنصة الأمثل لتطبيقات Next.js. 🚀

### الخطوات المنجزة:
1. ✅ الكود متوافق مع Next.js 15.
2. ✅ تم تحديث Middleware للعمل بشكل صحيح مع Vercel.
3. ✅ ملفات تعريف الارتباط (Cookies) تعمل بنظام `getAll`/`setAll` الجديد.
4. ✅ إعدادات الصور `next.config.ts` جاهزة.

### خطوات النشر على Vercel:

#### 1. ربط المستودع (Repository)
- ادخل إلى [Vercel Dashboard](https://vercel.com/dashboard).
- اضغط على **"Add New..."** ثم **"Project"**.
- اختر "Import" بجانب مستودع GitHub الخاص بالمشروع.

#### 2. إعدادات المشروع (Project Settings)
- **Framework Preset**: سيتم اكتشافه تلقائياً كـ `Next.js`.
- **Root Directory**: `./` (اتركه كما هو).
- **Build Command**: `next build` (أو `npm run build` - Vercel يعرف كلاهما).
- **Output Directory**: `.next` (تلقائي).

#### 3. متغيرات البيئة (Environment Variables)
في خانة **Environment Variables**، أضف القيم التالية (نفس القيم الموجودة في `.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app  # (حدث هذا بعد الحصول على النطاق)
NODE_ENV=production
```

#### 4. النشر (Deploy)
- اضغط على **"Deploy"**.
- انتظر بضع دقائق حتى تكتمل العملية.
- مبروك! موقعك يعمل الآن. 🎉

### ملاحظات إضافية:
- **Supabase Auth**: تأكد من إضافة رابط Vercel (مثلاً `https://project-name.vercel.app`) إلى قائمة "Site URL" و "Redirect URLs" في إعدادات Supabase Authentication.
- **Edge Functions**: إذا كنت تستخدم Supabase Edge Functions، فهي تعمل بشكل ممتاز مع Vercel.

### الدعم
إذا واجهت أي مشكلة، تحقق من "Logs" في لوحة تحكم Vercel.
