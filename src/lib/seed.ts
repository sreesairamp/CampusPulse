import { PrismaClient } from '@prisma/client';
import { ENGINEERING_BRANCHES, ENGINEERING_YEARS } from './constants';
import { prisma } from './prisma';

const SAMPLE_PARTNERS = [
  {
    name: 'Rohan Sharma',
    email: 'rohan.s@rvce.edu.in',
    college: 'RV College of Engineering, Bengaluru',
    referralCode: 'RVCE-AI24',
    targetRegistrations: 60,
    clicks: 142,
  },
  {
    name: 'Sneha Patel',
    email: 'sneha.p@srmist.edu.in',
    college: 'SRM Institute of Science and Technology, Chennai',
    referralCode: 'SRM-PULSE',
    targetRegistrations: 60,
    clicks: 118,
  },
  {
    name: 'Aditya Verma',
    email: 'aditya.v@pes.edu',
    college: 'PES University, Bengaluru',
    referralCode: 'PES-GROWTH',
    targetRegistrations: 60,
    clicks: 96,
  },
  {
    name: 'Ananya Deshmukh',
    email: 'ananya.d@coep.ac.in',
    college: 'COEP Technological University, Pune',
    referralCode: 'COEP-AI60',
    targetRegistrations: 60,
    clicks: 84,
  },
  {
    name: 'Karthik Raja',
    email: 'karthik.r@vit.ac.in',
    college: 'Vellore Institute of Technology, Vellore',
    referralCode: 'VIT-FUTURE',
    targetRegistrations: 60,
    clicks: 110,
  },
  {
    name: 'Meera Nambiar',
    email: 'meera.n@nitc.ac.in',
    college: 'National Institute of Technology, Calicut',
    referralCode: 'NITC-NEXT',
    targetRegistrations: 60,
    clicks: 72,
  },
];

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Dhruv', 'Kabir', 'Rudra', 'Ananya', 'Diya', 'Gauri', 'Isha', 'Kavya', 'Khushi', 'Myra',
  'Navya', 'Pooja', 'Riya', 'Saanvi', 'Shreya', 'Tanvi', 'Ananya', 'Meera', 'Roshni', 'Varun',
  'Harsh', 'Pranav', 'Siddharth', 'Nikhil', 'Gautam', 'Kunal', 'Manish', 'Dev', 'Rahul', 'Neha'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Reddy', 'Rao', 'Nair', 'Iyer', 'Menon', 'Gupta', 'Singh',
  'Kumar', 'Joshi', 'Bose', 'Chatterjee', 'Deshmukh', 'Kulkarni', 'Bhat', 'Shetty', 'Pillai', 'Hegde'
];

export async function seedDemoData() {
  // Clear previous demo data
  await prisma.duplicateSubmission.deleteMany({ where: { isDemo: true } });
  await prisma.registration.deleteMany({ where: { isDemo: true } });
  await prisma.campusPartner.deleteMany({ where: { isDemo: true } });
  await prisma.expense.deleteMany({ where: { isDemo: true } });

  // Ensure campaign meta is set to Day 4 simulation
  await prisma.campaignMeta.upsert({
    where: { id: 'campuspulse_active_campaign' },
    update: {
      currentDay: 4,
      totalDays: 7,
      targetTotal: 500,
    },
    create: {
      id: 'campuspulse_active_campaign',
      title: 'Build Your First AI Project in 60 Minutes',
      targetTotal: 500,
      totalDays: 7,
      currentDay: 4,
      budgetCreative: 300,
      budgetPromotion: 1200,
      budgetContingency: 500,
    },
  });

  // Create demo campus partners
  const createdPartners = [];
  for (const p of SAMPLE_PARTNERS) {
    const partner = await prisma.campusPartner.create({
      data: {
        name: p.name,
        email: p.email,
        college: p.college,
        referralCode: p.referralCode,
        targetRegistrations: p.targetRegistrations,
        clicks: p.clicks,
        active: true,
        isDemo: true,
      },
    });
    createdPartners.push(partner);
  }

  // Generate 263 demo student records
  const registrationsToCreate = [];
  let studentCounter = 1;

  // 1. Campus Partner Registrations (146 total)
  // Rohan (RVCE): 38, Sneha (SRM): 31, Karthik (VIT): 28, Aditya (PES): 23, Ananya (COEP): 16, Meera (NITC): 10 = 146
  const partnerAllocations = [38, 31, 28, 23, 16, 10];
  createdPartners.forEach((partner, pIndex) => {
    const count = partnerAllocations[pIndex] || 15;
    for (let i = 0; i < count; i++) {
      const fn = FIRST_NAMES[(studentCounter * 3) % FIRST_NAMES.length];
      const ln = LAST_NAMES[(studentCounter * 7) % LAST_NAMES.length];
      const day = ((studentCounter % 4) + 1);
      const branch = ENGINEERING_BRANCHES[studentCounter % ENGINEERING_BRANCHES.length];
      const graduationYear = studentCounter % 5 === 0 ? ENGINEERING_YEARS[1] : ENGINEERING_YEARS[0];

      registrationsToCreate.push({
        fullName: `${fn} ${ln}`,
        email: `student.${studentCounter}.${fn.toLowerCase()}@${partner.college.split(',')[0].toLowerCase().replace(/[^a-z]/g, '')}.edu.in`,
        college: partner.college,
        graduationYear,
        branch,
        channel: 'CAMPUS_PARTNER',
        referralCode: partner.referralCode,
        myReferralCode: `STU-CP${studentCounter}X`,
        partnerId: partner.id,
        campaignDay: day,
        isDemo: true,
      });
      studentCounter++;
    }
  });

  // 2. Student Referrals (50)
  for (let i = 0; i < 50; i++) {
    const fn = FIRST_NAMES[(studentCounter * 5) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(studentCounter * 11) % LAST_NAMES.length];
    const day = ((studentCounter % 4) + 1);
    const branch = ENGINEERING_BRANCHES[studentCounter % ENGINEERING_BRANCHES.length];
    const graduationYear = ENGINEERING_YEARS[0];

    registrationsToCreate.push({
      fullName: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}.${studentCounter}@gmail.com`,
      college: ['Anna University, Chennai', 'BMS College of Engineering, Bengaluru', 'Thapar Institute, Patiala', 'PSG College of Technology, Coimbatore'][studentCounter % 4],
      graduationYear,
      branch,
      channel: 'STUDENT_REFERRAL',
      referralCode: `STU-REF${(studentCounter % 15) + 1}`,
      myReferralCode: `STU-SR${studentCounter}Y`,
      campaignDay: day,
      isDemo: true,
    });
    studentCounter++;
  }

  // 3. College Communities (32)
  for (let i = 0; i < 32; i++) {
    const fn = FIRST_NAMES[(studentCounter * 2) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(studentCounter * 13) % LAST_NAMES.length];
    const day = ((studentCounter % 4) + 1);
    const branch = ENGINEERING_BRANCHES[studentCounter % ENGINEERING_BRANCHES.length];

    registrationsToCreate.push({
      fullName: `${fn} ${ln}`,
      email: `comm.${fn.toLowerCase()}.${studentCounter}@student.in`,
      college: ['MIT World Peace University, Pune', 'JNTU Hyderabad', 'VJTI Mumbai', 'Manipal Institute of Technology'][studentCounter % 4],
      graduationYear: ENGINEERING_YEARS[0],
      branch,
      channel: 'COLLEGE_COMMUNITIES',
      referralCode: 'COMM-TECHCLUB',
      myReferralCode: `STU-CC${studentCounter}Z`,
      campaignDay: day,
      isDemo: true,
    });
    studentCounter++;
  }

  // 4. Targeted Email (20)
  for (let i = 0; i < 20; i++) {
    const fn = FIRST_NAMES[(studentCounter * 4) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(studentCounter * 9) % LAST_NAMES.length];
    const day = ((studentCounter % 4) + 1);
    const branch = ENGINEERING_BRANCHES[studentCounter % ENGINEERING_BRANCHES.length];

    registrationsToCreate.push({
      fullName: `${fn} ${ln}`,
      email: `outreach.${fn.toLowerCase()}.${studentCounter}@engg.org`,
      college: 'Selected Engineering Alumni & Newsletter Cohort',
      graduationYear: ENGINEERING_YEARS[0],
      branch,
      channel: 'TARGETED_EMAIL',
      referralCode: 'MAIL-EDITION1',
      myReferralCode: `STU-TE${studentCounter}W`,
      campaignDay: day,
      isDemo: true,
    });
    studentCounter++;
  }

  // 5. Direct / Unattributed (15)
  for (let i = 0; i < 15; i++) {
    const fn = FIRST_NAMES[(studentCounter * 6) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(studentCounter * 17) % LAST_NAMES.length];
    const day = ((studentCounter % 4) + 1);
    const branch = ENGINEERING_BRANCHES[studentCounter % ENGINEERING_BRANCHES.length];

    registrationsToCreate.push({
      fullName: `${fn} ${ln}`,
      email: `direct.${fn.toLowerCase()}.${studentCounter}@mail.com`,
      college: 'Autonomous Institute of Technology',
      graduationYear: ENGINEERING_YEARS[0],
      branch,
      channel: 'DIRECT',
      referralCode: null,
      myReferralCode: `STU-DIR${studentCounter}V`,
      campaignDay: day,
      isDemo: true,
    });
    studentCounter++;
  }

  await prisma.registration.createMany({
    data: registrationsToCreate,
  });

  // Simulated duplicate submissions
  const sampleDuplicates = [
    { email: registrationsToCreate[2].email, referralCode: 'RVCE-AI24', channel: 'CAMPUS_PARTNER' },
    { email: registrationsToCreate[15].email, referralCode: 'SRM-PULSE', channel: 'CAMPUS_PARTNER' },
    { email: registrationsToCreate[45].email, referralCode: 'COMM-TECHCLUB', channel: 'COLLEGE_COMMUNITIES' },
    { email: registrationsToCreate[80].email, referralCode: null, channel: 'DIRECT' },
  ];

  await prisma.duplicateSubmission.createMany({
    data: sampleDuplicates.map((dup) => ({
      email: dup.email,
      referralCode: dup.referralCode,
      channel: dup.channel,
      isDemo: true,
    })),
  });

  // Zero fake spend: In accordance with audit standards, no money is claimed to have been spent
  // unless explicitly recorded by an operator through the verified expense ledger.

  return { total: registrationsToCreate.length, partners: createdPartners.length };
}

