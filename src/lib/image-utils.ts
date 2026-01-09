import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.2, // أقصى حجم 200 كيلوبايت لضمان السرعة وتوفير المساحة
    maxWidthOrHeight: 1200, // أقصى عرض أو طول 1200 بكسل
    useWebWorker: false, // تعطيل الـ Web Worker لأنه يسبب مشاكل أحياناً في WebView الأندرويد
    fileType: 'image/webp', // تحويل الصور إلى تنسيق WebP لتقليل الحجم بشكل أكبر
  };

  try {
    const compressedFile = await imageCompression(file, options);
    // نضمن أن الملف الجديد له اسم مناسب وامتداد صحيح
    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
    return new File([compressedFile], newFileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Image compression error:', error);
    return file; // في حال حدوث خطأ، نعود للملف الأصلي لضمان استمرار العملية
  }
}
