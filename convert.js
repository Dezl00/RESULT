const fs = require('fs');
const xlsx = require('xlsx');

// اسم ملف الإكسل الخاص بك (يجب أن يكون في نفس المجلد)
const EXCEL_FILE = 'results.xlsx';
const OUTPUT_FILE = 'data.json';

try {
    console.log('جاري قراءة ملف الإكسل...');
    
    // قراءة ملف الإكسل
    const workbook = xlsx.readFile(EXCEL_FILE);
    
    // اختيار الورقة الأولى من الملف
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // تحويل البيانات إلى JSON
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    // التأكد من وجود بيانات
    if (data.length === 0) {
        console.error('الملف فارغ أو لم يتمكن من قراءة البيانات.');
        process.exit(1);
    }
    
    // كتابة البيانات في ملف data.json
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf-8');
    
    console.log(`تم تحويل ${data.length} نتيجة بنجاح!`);
    console.log(`تم حفظ البيانات في ملف: ${OUTPUT_FILE}`);
    console.log('يمكنك الآن رفع التحديثات إلى GitHub.');

} catch (error) {
    console.error('حدث خطأ أثناء تحويل الملف:', error.message);
    console.log('\nتأكد من:');
    console.log('1. أن ملف الإكسل موجود باسم results.xlsx في نفس المجلد.');
    console.log('2. أنك قمت بتثبيت مكتبة xlsx بكتابة الأمر: npm install xlsx');
}
