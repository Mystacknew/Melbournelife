const fs = require('fs');
const path = require('path');

const sourceFolder = 'C:\\Users\\ravis\\Downloads\\Melbourne life story';
const targetFolder = path.join(__dirname, '..', 'public', 'images', 'story');

const imageRenameMap = [
  // CHAPTER 1: ARRIVAL
  { old: 'Gemini_Generated_Image_2g2vm12g2vm12g2v.png', new: 'arrival/01-skybus.jpg' },
  { old: 'Gemini_Generated_Image_q5hujhq5hujhq5hu.png', new: 'arrival/02-apartment-exterior.jpg' },
  { old: 'Gemini_Generated_Image_mo633bmo633bmo63.png', new: 'arrival/03-apartment-interior.jpg' },
  
  // CHAPTER 2: STUDENT LIFE
  { old: 'Gemini_Generated_Image_x3llkpx3llkpx3ll.png', new: 'student/01-campus.jpg' },
  { old: 'Gemini_Generated_Image_gb807ugb807ugb80 (1).png', new: 'student/02-lecture-hall.jpg' },
  { old: 'Gemini_Generated_Image_n54kd8n54kd8n54k (1).png', new: 'student/03-library.jpg' },
  { old: 'Gemini_Generated_Image_n54kd8n54kd8n54k.png', new: 'student/04-cafeteria.jpg' },
  { old: 'Gemini_Generated_Image_dyyi98dyyi98dyyi.png', new: 'student/05-job-search.jpg' },
  
  // CHAPTER 3: PART-TIME WORK
  { old: 'Gemini_Generated_Image_kzb0j6kzb0j6kzb0 (1).png', new: 'work/01-retail-store.jpg' },
  { old: 'Gemini_Generated_Image_kzb0j6kzb0j6kzb0 (2).png', new: 'work/02-cafe-barista.jpg' },
  { old: 'Gemini_Generated_Image_gb807ugb807ugb80 (3).png', new: 'work/03-warehouse.jpg' },
  { old: 'Gemini_Generated_Image_dapcgtdapcgtdapc (2).png', new: 'work/04-team-meeting.jpg' },
  
  // CHAPTER 4: CAREER DEVELOPMENT
  { old: 'Gemini_Generated_Image_z3bmtzz3bmtzz3bm (2).png', new: 'career/01-resume-writing.jpg' },
  { old: 'Gemini_Generated_Image_z3bmtzz3bmtzz3bm.png', new: 'career/02-job-interview.jpg' },
  { old: 'Gemini_Generated_Image_2p914m2p914m2p91 (1).png', new: 'career/03-office-work.jpg' },
  { old: 'Gemini_Generated_Image_dapcgtdapcgtdapc (1).png', new: 'career/04-networking.jpg' },
  
  // CHAPTER 5: SOCIAL LIFE
  { old: 'Gemini_Generated_Image_72w2oa72w2oa72w2.png', new: 'social/01-friends-park.jpg' },
  { old: 'Gemini_Generated_Image_3ljfgp3ljfgp3ljf (2).png', new: 'social/02-sports-cricket.jpg' },
  { old: 'Gemini_Generated_Image_3ljfgp3ljfgp3ljf (1).png', new: 'social/03-park-walk.jpg' },
  { old: 'Gemini_Generated_Image_w3e04w3e04w3e04w.png', new: 'social/04-beach.jpg' },
  
  // CHAPTER 6: FINANCIAL MANAGEMENT
  { old: 'Gemini_Generated_Image_78owtp78owtp78ow.png', new: 'finance/01-budget-planning.jpg' },
  { old: 'Gemini_Generated_Image_2p914m2p914m2p91.png', new: 'finance/02-bank-visit.jpg' },
  { old: 'Gemini_Generated_Image_kzb0j6kzb0j6kzb0.png', new: 'finance/03-shopping-smart.jpg' },
  
  // CHAPTER 7: HOUSING JOURNEY
  { old: 'Gemini_Generated_Image_z3bmtzz3bmtzz3bm (1).png', new: 'housing/01-apartment-inspection.jpg' },
  { old: 'Gemini_Generated_Image_dapcgtdapcgtdapc.png', new: 'housing/02-shared-house.jpg' },
  { old: 'Gemini_Generated_Image_gb807ugb807ugb80 (2).png', new: 'housing/03-moving-boxes.jpg' },
  
  // CHAPTER 8: TRANSPORTATION
  { old: 'Gemini_Generated_Image_69arn669arn669ar.png', new: 'transport/01-tram-station.jpg' },
  { old: 'Gemini_Generated_Image_3ljfgp3ljfgp3ljf.png', new: 'transport/02-bicycle-riding.jpg' },
  { old: 'Gemini_Generated_Image_oek2ppoek2ppoek2.png', new: 'transport/03-train-platform.jpg' },
  
  // CHAPTER 9: HEALTH & WELLBEING  
  { old: 'ml4h1pjmg5py4t.jpeg', new: 'health/01-gym-fitness.jpg' },
  { old: 'Gemini_Generated_Image_dapcgtdapcgtdapc (4).png', new: 'health/02-medical-checkup.jpg' },
  
  // CHAPTER 10: SUCCESS & CELEBRATION
  { old: 'Gemini_Generated_Image_gb807ugb807ugb80 (4).png', new: 'success/01-graduation.jpg' },
  { old: 'Gemini_Generated_Image_gb807ugb807ugb80.png', new: 'success/02-celebration.jpg' }
];

function createDirectories() {
  const chapters = ['arrival', 'student', 'work', 'career', 'social', 'finance', 'housing', 'transport', 'health', 'success'];
  console.log('\n📁 Creating folder structure...\n');
  chapters.forEach(chapter => {
    const dir = path.join(targetFolder, chapter);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created: images/story/${chapter}/`);
    }
  });
}

function organizeImages() {
  console.log('\n📸 Organizing images...\n');
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  imageRenameMap.forEach((mapping, index) => {
    const sourcePath = path.join(sourceFolder, mapping.old);
    const targetPath = path.join(targetFolder, mapping.new);
    try {
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✓ ${index + 1}/${imageRenameMap.length} ${mapping.new}`);
        successCount++;
      } else {
        console.log(`✗ Not found: ${mapping.old}`);
        errors.push(mapping.old);
        errorCount++;
      }
    } catch (error) {
      console.log(`✗ Error: ${mapping.old}`);
      errors.push(mapping.old);
      errorCount++;
    }
  });

  console.log('\n============================================================');
  console.log(`✓ Successfully organized: ${successCount}/${imageRenameMap.length} images`);
  if (errorCount > 0) {
    console.log(`✗ Errors: ${errorCount} images`);
  }
  console.log('============================================================');
}

console.log('\n============================================================');
console.log('🎮 MELBOURNE LIFE - Image Organization Script');
console.log('============================================================');

try {
  createDirectories();
  organizeImages();
  console.log('\n✅ Done! Images are ready to use in your game.\n');
} catch (error) {
  console.error('\n❌ Error:', error.message);
}