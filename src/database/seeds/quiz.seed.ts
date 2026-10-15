import { SeedDataSource } from "../data-source";
import { ChallengeEntity } from "src/modules/challenge/entities/challenge.entity";
import { ChallengeType } from "src/modules/challenge/enums/challenge-type.enum";
import { QuizEntity } from "src/modules/challenge/entities/quiz.entity";
import { QuizQuestionEntity } from "src/modules/challenge/entities/quiz-question.entity";




type QuizQuestionSeed = {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: 'A' | 'B' | 'C' | 'D';
};

type DailyQuizSeed = {
    quizDate: string;
    title: string;
    questions: [
        QuizQuestionSeed,
        QuizQuestionSeed,
        QuizQuestionSeed,
        QuizQuestionSeed,
        QuizQuestionSeed,
        QuizQuestionSeed,
        QuizQuestionSeed,
        QuizQuestionSeed,
        QuizQuestionSeed,
        QuizQuestionSeed,
    ];
};




const DAILY_GK_CHALLENGE_ID = '57b04546-8101-400f-b03f-c74f847bff6b';
const quizSeeds: DailyQuizSeed[] = [
    {
        quizDate: '2026-10-15',
        title: 'Daily GK Quiz',
        questions: [
            {
                question:
                    'Which one of the following is INCORRECTLY matched?',
                optionA: 'Atharva-Veda - Knowledge of magic formulas',
                optionB: 'Rig Veda - Knowledge of the Hymns of Praise',
                optionC: 'Yajur-Veda - Knowledge of sacrificial formulas',
                optionD: 'Sama-Veda - Knowledge of Science',
                correctOption: 'D',
            },
            {
                question: 'Mohenjo-daro lies on the bank of which river?',
                optionA: 'Ravi',
                optionB: 'Indus',
                optionC: 'Ghaggar',
                optionD: 'Saraswati',
                correctOption: 'B',
            },
            {
                question: 'Which of the following ancient works was written by Abhijnanashakuntalam’s author?',
                optionA: 'Bhasa',
                optionB: 'Shudraka',
                optionC: 'Aryabhat',
                optionD: 'Kalidasa',
                correctOption: 'D',
            },
            {
                question:
                    'Which is an ancient Sanskrit text on medicine and surgery?',
                optionA: 'Arthashastra',
                optionB: 'Raghuvamsha',
                optionC: 'Sushruta Samhita',
                optionD: 'Abhijnanashakuntala',
                correctOption: 'C',
            },
            {
                question:
                    '"Vipasa" is the Rigvedic name of which river?',
                optionA: 'Chenab',
                optionB: 'Beas',
                optionC: 'Jhelum',
                optionD: 'Ravi',
                correctOption: 'B',
            },
            {
                question: 'What is the birthplace of Lord Gautama Buddha?',
                optionA: 'Lumbini',
                optionB: 'Sarnath',
                optionC: 'Bodh Gaya',
                optionD: 'Vaishali',
                correctOption: 'A',
            },
            {
                question: 'Who wrote the book Indica?',
                optionA: 'Megasthenes',
                optionB: 'Aristotle',
                optionC: 'Chanakya',
                optionD: 'None of these',
                correctOption: 'A',
            },
            {
                question: 'Vedic religion was also known as ______.',
                optionA: 'Buddhism',
                optionB: 'Brahmanism',
                optionC: 'Jainism',
                optionD: 'Hedonism',
                correctOption: 'B',
            },
            {
                question:
                    'Which prominent ancient city was excavated in 1921 in Montgomery district, on the banks of the Ravi River?',
                optionA: 'Kanauj',
                optionB: 'Harappa',
                optionC: 'Vaishali',
                optionD: 'Magadha',
                correctOption: 'B',
            },
            {
                question: 'Chandragupta I was succeeded by his son ______.',
                optionA: 'Samudragupta',
                optionB: 'Bhanugupta',
                optionC: 'Skandagupta',
                optionD: 'Purugupta',
                correctOption: 'A',
            },
        ],
    },
    {
        quizDate: '2026-10-16',
        title: 'Daily GK Quiz',
        questions: [
            {
                question:
                    "Who was India's first Chairman of the Planning Commission?",
                optionA: 'Pandit Jawaharlal Nehru',
                optionB: 'J. B. Kripalani',
                optionC: 'Sardar Vallabhbhai Patel',
                optionD: 'Dr. Rajendra Prasad',
                correctOption: 'A',
            },
            {
                question: 'Shyok River is a tributary of which river?',
                optionA: 'Brahmaputra',
                optionB: 'Indus',
                optionC: 'Ganges',
                optionD: 'Yamuna',
                correctOption: 'B',
            },
            {
                question:
                    'The Indus Water Treaty (IWT) was signed between which two countries?',
                optionA: 'Pakistan and India',
                optionB: 'Myanmar and India',
                optionC: 'Tibet and India',
                optionD: 'Nepal and India',
                correctOption: 'A',
            },
            {
                question:
                    'Which of the following is the birthplace of Saint Vallabhacharya, the reformer and founder of the Vallabh Sect?',
                optionA: 'Champanaranya',
                optionB: 'Odagaon',
                optionC: 'Pipili',
                optionD: 'Raghurajpur',
                correctOption: 'A',
            },
            {
                question: 'Article 123 of the Constitution of India deals with:',
                optionA: 'Ordinance-making power of the Judge',
                optionB: 'Ordinance-making power of the President',
                optionC: 'Ordinance-making power of the Prime Minister',
                optionD: 'Ordinance-making power of the Governor',
                correctOption: 'B',
            },
            {
                question: 'Which of the following is the only active volcano in India?',
                optionA: 'Agatti Island',
                optionB: 'Majuli Island',
                optionC: 'Pamban Island',
                optionD: 'Barren Island',
                correctOption: 'D',
            },
            {
                question:
                    'Jelep La Pass is a trade route between Sikkim and which country?',
                optionA: 'Nepal',
                optionB: 'Bangladesh',
                optionC: 'China',
                optionD: 'Bhutan',
                correctOption: 'C',
            },
            {
                question:
                    'Classical dance Mohiniyattam originally belongs to which state?',
                optionA: 'Odisha',
                optionB: 'Gujarat',
                optionC: 'Kerala',
                optionD: 'Assam',
                correctOption: 'C',
            },
            {
                question:
                    'The Radcliffe Line demarcated the boundary between India and which country at Partition?',
                optionA: 'Pakistan',
                optionB: 'Myanmar',
                optionC: 'Afghanistan',
                optionD: 'China',
                correctOption: 'A',
            },
            {
                question: 'Which famous Sanskrit poet wrote Gita Govinda?',
                optionA: 'Premchand',
                optionB: 'Kalidasa',
                optionC: 'Goswami',
                optionD: 'Jayadeva',
                correctOption: 'D',
            },
        ],
    },
    {
        quizDate: '2026-10-17',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'When did the Constitution of India come into force?',
                optionA: '15 August 1947',
                optionB: '26 January 1950',
                optionC: '2 October 1948',
                optionD: '30 January 1949',
                correctOption: 'B',
            },
            {
                question: 'Who is called the creator of the Indian Constitution?',
                optionA: 'Mahatma Gandhi',
                optionB: 'Dr. B. R. Ambedkar',
                optionC: 'Jawaharlal Nehru',
                optionD: 'Sardar Patel',
                correctOption: 'B',
            },
            {
                question: 'Where is the Supreme Court located in India?',
                optionA: 'Mumbai',
                optionB: 'Kolkata',
                optionC: 'New Delhi',
                optionD: 'Chennai',
                correctOption: 'C',
            },
            {
                question: 'What is the tenure of the President of India?',
                optionA: '4 years',
                optionB: '5 years',
                optionC: '6 years',
                optionD: '7 years',
                correctOption: 'B',
            },
            {
                question: 'What is the normal tenure of the Lok Sabha?',
                optionA: '4 years',
                optionB: '5 years',
                optionC: '6 years',
                optionD: '7 years',
                correctOption: 'B',
            },
            {
                question: 'How many Houses are there in the Indian Parliament?',
                optionA: '1',
                optionB: '2',
                optionC: '3',
                optionD: '4',
                correctOption: 'B',
            },
            {
                question: 'Why is the Rajya Sabha called a permanent House?',
                optionA: 'It is not elected',
                optionB: 'It cannot be dissolved',
                optionC: 'Its tenure is 10 years',
                optionD: 'It is directly controlled by the President',
                correctOption: 'B',
            },
            {
                question: 'In which Part of the Constitution are Fundamental Rights included?',
                optionA: 'Part II',
                optionB: 'Part III',
                optionC: 'Part IV',
                optionD: 'Part V',
                correctOption: 'B',
            },
            {
                question: 'Who presided over the Constituent Assembly of India?',
                optionA: 'Dr. Rajendra Prasad',
                optionB: 'Dr. B. R. Ambedkar',
                optionC: 'Jawaharlal Nehru',
                optionD: 'Sardar Patel',
                correctOption: 'A',
            },
            {
                question: 'What is the supreme law of India?',
                optionA: 'Parliament',
                optionB: 'The Constitution',
                optionC: 'The President',
                optionD: 'The Judiciary',
                correctOption: 'B',
            },
        ],
    },
    {
        quizDate: '2026-10-18',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'How many Schedules are there in the Indian Constitution?',
                optionA: '10',
                optionB: '11',
                optionC: '12',
                optionD: '14',
                correctOption: 'C',
            },
            {
                question: 'Who was the first President of India?',
                optionA: 'Dr. Rajendra Prasad',
                optionB: 'Dr. Radhakrishnan',
                optionC: 'Jawaharlal Nehru',
                optionD: 'Dr. B. R. Ambedkar',
                correctOption: 'A',
            },
            {
                question: 'Who appoints the Prime Minister of India?',
                optionA: 'Lok Sabha',
                optionB: 'President',
                optionC: 'State Assembly',
                optionD: 'Supreme Court',
                correctOption: 'B',
            },
            {
                question: 'Which Article provides for the proclamation of a National Emergency?',
                optionA: 'Article 352',
                optionB: 'Article 356',
                optionC: 'Article 360',
                optionD: 'Article 370',
                correctOption: 'A',
            },
            {
                question: 'Who appoints the Governor of an Indian state?',
                optionA: 'Chief Minister',
                optionB: 'President',
                optionC: 'Prime Minister',
                optionD: 'Parliament',
                correctOption: 'B',
            },
            {
                question: 'Which Part of the Constitution deals with the Directive Principles of State Policy?',
                optionA: 'Part II',
                optionB: 'Part III',
                optionC: 'Part IV',
                optionD: 'Part V',
                correctOption: 'C',
            },
            {
                question: 'What is the minimum voting age in India?',
                optionA: '16 years',
                optionB: '18 years',
                optionC: '21 years',
                optionD: '25 years',
                correctOption: 'B',
            },
            {
                question: 'What is the maximum permitted elected strength of the Lok Sabha under the current constitutional framework?',
                optionA: '545',
                optionB: '550',
                optionC: '500',
                optionD: '530',
                correctOption: 'B',
            },
            {
                question: 'Which country is considered a major source of the parliamentary system adopted by India?',
                optionA: 'United States',
                optionB: 'Britain',
                optionC: 'France',
                optionD: 'Canada',
                correctOption: 'B',
            },
            {
                question: 'What is the constitutional process for removing the President of India for violation of the Constitution called?',
                optionA: 'Impeachment',
                optionB: 'Motion of no confidence',
                optionC: 'Emergency',
                optionD: 'Dissolution',
                correctOption: 'A',
            },
        ],
    },
    {
        quizDate: '2026-10-19',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'When did the Jallianwala Bagh massacre take place?',
                optionA: '1919',
                optionB: '1920',
                optionC: '1930',
                optionD: '1942',
                correctOption: 'A',
            },
            {
                question: 'By what name is the rebellion of 1857 commonly known in India?',
                optionA: 'First War of Independence',
                optionB: 'Non-Cooperation Movement',
                optionC: 'Quit India Movement',
                optionD: 'Salt Satyagraha',
                correctOption: 'A',
            },
            {
                question: 'In which year did the Dandi March take place?',
                optionA: '1920',
                optionB: '1930',
                optionC: '1942',
                optionD: '1919',
                correctOption: 'B',
            },
            {
                question: 'In which year was Bhagat Singh executed?',
                optionA: '1931',
                optionB: '1930',
                optionC: '1929',
                optionD: '1940',
                correctOption: 'A',
            },
            {
                question: 'Which of the following is a major site of the Indus Valley Civilization?',
                optionA: 'Harappa',
                optionB: 'Pataliputra',
                optionC: 'Taxila',
                optionD: 'Ayodhya',
                correctOption: 'A',
            },
            {
                question: 'To which dynasty did Emperor Ashoka belong?',
                optionA: 'Mauryan dynasty',
                optionB: 'Gupta dynasty',
                optionC: 'Chola dynasty',
                optionD: 'Kushan dynasty',
                correctOption: 'A',
            },
            {
                question: 'Who commissioned the construction of the Taj Mahal?',
                optionA: 'Akbar',
                optionB: 'Shah Jahan',
                optionC: 'Babur',
                optionD: 'Aurangzeb',
                correctOption: 'B',
            },
            {
                question: 'In which year did the First Battle of Panipat take place?',
                optionA: '1526',
                optionB: '1556',
                optionC: '1761',
                optionD: '1857',
                correctOption: 'A',
            },
            {
                question: 'Who is generally regarded as the founder of the Gupta dynasty?',
                optionA: 'Sri Gupta',
                optionB: 'Chandragupta I',
                optionC: 'Skandagupta',
                optionD: 'Kumaragupta',
                correctOption: 'A',
            },
            {
                question: 'In which year did the Quit India Movement begin?',
                optionA: '1930',
                optionB: '1942',
                optionC: '1919',
                optionD: '1920',
                correctOption: 'B',
            },
        ],
    },
    {
        quizDate: '2026-10-20',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'What was the full name of Emperor Akbar?',
                optionA: 'Jalal-ud-din Muhammad Akbar',
                optionB: 'Nasir-ud-din Muhammad Akbar',
                optionC: 'Mohammad Akbar',
                optionD: 'Firoz Akbar',
                correctOption: 'A',
            },
            {
                question: 'In which region of India was the Chola dynasty most prominent?',
                optionA: 'North India',
                optionB: 'East India',
                optionC: 'South India',
                optionD: 'West India',
                correctOption: 'C',
            },
            {
                question: 'In which year did the Simon Commission arrive in India?',
                optionA: '1928',
                optionB: '1930',
                optionC: '1919',
                optionD: '1942',
                correctOption: 'A',
            },
            {
                question: 'Lord Mountbatten was the last Viceroy of British India.',
                optionA: 'True',
                optionB: 'False',
                optionC: 'Partially correct',
                optionD: 'Not known',
                correctOption: 'A',
            },
            {
                question: 'How many Vedas are there?',
                optionA: '2',
                optionB: '3',
                optionC: '4',
                optionD: '5',
                correctOption: 'C',
            },
            {
                question: 'In which year did the Battle of Plassey take place?',
                optionA: '1757',
                optionB: '1764',
                optionC: '1857',
                optionD: '1526',
                correctOption: 'A',
            },
            {
                question: 'Who was the teacher and adviser of Chandragupta Maurya?',
                optionA: 'Chanakya',
                optionB: 'Kalidasa',
                optionC: 'Tansen',
                optionD: 'Aryabhata',
                correctOption: 'A',
            },
            {
                question: 'Who founded the Mughal dynasty in India?',
                optionA: 'Akbar',
                optionB: 'Babur',
                optionC: 'Humayun',
                optionD: 'Aurangzeb',
                correctOption: 'B',
            },
            {
                question: 'In which year did passenger railway services begin in India?',
                optionA: '1853',
                optionB: '1857',
                optionC: '1885',
                optionD: '1905',
                correctOption: 'A',
            },
            {
                question: 'In which year was the Indian National Congress established?',
                optionA: '1885',
                optionB: '1905',
                optionC: '1919',
                optionD: '1942',
                correctOption: 'A',
            },
        ],
    },
    {
        quizDate: '2026-10-21',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'Which is the longest river in India?',
                optionA: 'Yamuna',
                optionB: 'Ganga',
                optionC: 'Brahmaputra',
                optionD: 'Godavari',
                correctOption: 'B',
            },
            {
                question: 'Which is the largest state of India by area?',
                optionA: 'Uttar Pradesh',
                optionB: 'Rajasthan',
                optionC: 'Maharashtra',
                optionD: 'Madhya Pradesh',
                correctOption: 'B',
            },
            {
                question: 'Kanchenjunga is located in which Indian state?',
                optionA: 'Uttarakhand',
                optionB: 'Himachal Pradesh',
                optionC: 'Sikkim',
                optionD: 'Assam',
                correctOption: 'C',
            },
            {
                question: 'What is the capital of India?',
                optionA: 'Mumbai',
                optionB: 'New Delhi',
                optionC: 'Chennai',
                optionD: 'Jaipur',
                correctOption: 'B',
            },
            {
                question: 'The Thar Desert is primarily located in which Indian state?',
                optionA: 'Gujarat',
                optionB: 'Rajasthan',
                optionC: 'Haryana',
                optionD: 'Punjab',
                correctOption: 'B',
            },
            {
                question: 'Which Indian state has the longest coastline?',
                optionA: 'Gujarat',
                optionB: 'Maharashtra',
                optionC: 'Tamil Nadu',
                optionD: 'Kerala',
                correctOption: 'A',
            },
            {
                question: 'In which direction does the Narmada River primarily flow?',
                optionA: 'East to West',
                optionB: 'West to East',
                optionC: 'North to South',
                optionD: 'South to North',
                correctOption: 'A',
            },
            {
                question: 'Which is the highest mountain peak located in India?',
                optionA: 'Nanda Devi',
                optionB: 'Kanchenjunga',
                optionC: 'Dhaulagiri',
                optionD: 'Aravalli',
                correctOption: 'B',
            },
            {
                question: 'The Sundarbans Delta is formed mainly by which river system?',
                optionA: 'Ganga-Brahmaputra',
                optionB: 'Godavari',
                optionC: 'Krishna',
                optionD: 'Cauvery',
                correctOption: 'A',
            },
            {
                question: 'Which is the largest freshwater lake in India by surface area?',
                optionA: 'Wular Lake',
                optionB: 'Chilika Lake',
                optionC: 'Loktak Lake',
                optionD: 'Sambhar Lake',
                correctOption: 'A',
            },
        ],
    },
    {
        quizDate: '2026-10-22',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'What is the southernmost point of Indian territory?',
                optionA: 'Kanyakumari',
                optionB: 'Indira Point',
                optionC: 'Rameswaram',
                optionD: 'Lakshadweep',
                correctOption: 'B',
            },
            {
                question: 'The Deccan Plateau is located primarily in which part of India?',
                optionA: 'North India',
                optionB: 'South India',
                optionC: 'East India',
                optionD: 'North-East India',
                correctOption: 'B',
            },
            {
                question: 'Chilika Lake is located in which state?',
                optionA: 'Odisha',
                optionB: 'West Bengal',
                optionC: 'Bihar',
                optionD: 'Assam',
                correctOption: 'A',
            },
            {
                question: 'Which Indian state has the longest coastline?',
                optionA: 'Tamil Nadu',
                optionB: 'Gujarat',
                optionC: 'Maharashtra',
                optionD: 'Andhra Pradesh',
                correctOption: 'B',
            },
            {
                question: 'In which direction does the Aravalli Range extend?',
                optionA: 'North-East to South-West',
                optionB: 'South-West to North-East',
                optionC: 'North-West to South-East',
                optionD: 'East to West',
                correctOption: 'B',
            },
            {
                question: 'Which place is widely recognized as the wettest place in India?',
                optionA: 'Shillong',
                optionB: 'Mawsynram',
                optionC: 'Cherrapunji',
                optionD: 'Guwahati',
                correctOption: 'B',
            },
            {
                question: 'From which Indian state does the Kaveri River originate?',
                optionA: 'Kerala',
                optionB: 'Tamil Nadu',
                optionC: 'Karnataka',
                optionD: 'Maharashtra',
                correctOption: 'C',
            },
            {
                question: 'Which of these is a major natural port on the west coast of India?',
                optionA: 'Mumbai',
                optionB: 'Kandla',
                optionC: 'Visakhapatnam',
                optionD: 'Kolkata',
                correctOption: 'A',
            },
            {
                question: 'What type of region is Ladakh commonly classified as?',
                optionA: 'Tropical desert',
                optionB: 'Cold desert',
                optionC: 'Coastal plain',
                optionD: 'Tropical plateau',
                correctOption: 'B',
            },
            {
                question: 'From which country does the Brahmaputra River enter India?',
                optionA: 'Nepal',
                optionB: 'Bhutan',
                optionC: 'China',
                optionD: 'Myanmar',
                correctOption: 'C',
            },
        ],
    },
    {
        quizDate: '2026-10-23',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'Why is human blood red?',
                optionA: 'Oxygen alone',
                optionB: 'Hemoglobin',
                optionC: 'Carbon',
                optionD: 'Nitrogen',
                correctOption: 'B',
            },
            {
                question: 'What type of celestial object is the Sun?',
                optionA: 'Planet',
                optionB: 'Satellite',
                optionC: 'Star',
                optionD: 'Comet',
                correctOption: 'C',
            },
            {
                question: 'What is the chemical formula of water?',
                optionA: 'CO2',
                optionB: 'H2O',
                optionC: 'O2',
                optionD: 'H2SO4',
                correctOption: 'B',
            },
            {
                question: 'Where is the headquarters of ISRO located?',
                optionA: 'Mumbai',
                optionB: 'Bengaluru',
                optionC: 'New Delhi',
                optionD: 'Chennai',
                correctOption: 'B',
            },
            {
                question: 'Which is the hardest naturally occurring mineral on the Mohs scale?',
                optionA: 'Gold',
                optionB: 'Iron',
                optionC: 'Diamond',
                optionD: 'Silver',
                correctOption: 'C',
            },
            {
                question: 'How many bones are typically present in an adult human body?',
                optionA: '200',
                optionB: '206',
                optionC: '210',
                optionD: '215',
                correctOption: 'B',
            },
            {
                question: 'Which disease is caused by a deficiency of Vitamin C?',
                optionA: 'Night blindness',
                optionB: 'Scurvy',
                optionC: 'Polio',
                optionD: 'Malaria',
                correctOption: 'B',
            },
            {
                question: 'What is the SI unit of force?',
                optionA: 'Joule',
                optionB: 'Watt',
                optionC: 'Newton',
                optionD: 'Pascal',
                correctOption: 'C',
            },
            {
                question: 'How many chambers does the human heart have?',
                optionA: '2',
                optionB: '3',
                optionC: '4',
                optionD: '5',
                correctOption: 'C',
            },
            {
                question: 'What is the approximate speed of light in a vacuum?',
                optionA: '3 × 10^8 m/s',
                optionB: '3 × 10^6 m/s',
                optionC: '3 × 10^5 m/s',
                optionD: '1 × 10^8 m/s',
                correctOption: 'A',
            },
        ],
    },
    {
        quizDate: '2026-10-24',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'Who was the first person to walk on the Moon?',
                optionA: 'Yuri Gagarin',
                optionB: 'Neil Armstrong',
                optionC: 'Kalpana Chawla',
                optionD: 'Rakesh Sharma',
                correctOption: 'B',
            },
            {
                question: 'Which is the largest organ of the human body?',
                optionA: 'Heart',
                optionB: 'Brain',
                optionC: 'Skin',
                optionD: 'Liver',
                correctOption: 'C',
            },
            {
                question: 'Which molecule makes up the ozone layer?',
                optionA: 'O2',
                optionB: 'CO2',
                optionC: 'O3',
                optionD: 'N2',
                correctOption: 'C',
            },
            {
                question: 'What is the SI unit of electric current?',
                optionA: 'Volt',
                optionB: 'Ampere',
                optionC: 'Ohm',
                optionD: 'Watt',
                correctOption: 'B',
            },
            {
                question: "What was India's first satellite?",
                optionA: 'Bhaskara',
                optionB: 'Rohini',
                optionC: 'Aryabhata',
                optionD: 'INSAT',
                correctOption: 'C',
            },
            {
                question: 'Which country hosted the G20 Summit in 2023?',
                optionA: 'China',
                optionB: 'United States',
                optionC: 'India',
                optionD: 'Japan',
                correctOption: 'C',
            },
            {
                question: 'In which year was the Swachh Bharat Mission launched?',
                optionA: '2012',
                optionB: '2014',
                optionC: '2016',
                optionD: '2018',
                correctOption: 'B',
            },
            {
                question: 'In which year did Chandrayaan-3 successfully land on the Moon?',
                optionA: '2021',
                optionB: '2022',
                optionC: '2023',
                optionD: '2024',
                correctOption: 'C',
            },
            {
                question: 'Where is the headquarters of the Reserve Bank of India located?',
                optionA: 'New Delhi',
                optionB: 'Mumbai',
                optionC: 'Chennai',
                optionD: 'Kolkata',
                correctOption: 'B',
            },
            {
                question: 'Which country was invited to join BRICS during its 2023 expansion but had not formally joined as of October 2026?',
                optionA: 'Saudi Arabia',
                optionB: 'Japan',
                optionC: 'Germany',
                optionD: 'Canada',
                correctOption: 'A',
            },
        ],
    },
    {
        quizDate: '2026-10-25',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'Which is the earliest known civilisation in India?',
                optionA: 'Vedic Civilisation',
                optionB: 'Indus Valley Civilisation',
                optionC: 'Mauryan Civilisation',
                optionD: 'Gupta Civilisation',
                correctOption: 'B',
            },
            {
                question: 'Which Indus Valley site is famous for the Great Bath?',
                optionA: 'Harappa',
                optionB: 'Lothal',
                optionC: 'Mohenjo-daro',
                optionD: 'Kalibangan',
                correctOption: 'C',
            },
            {
                question: 'Which is the oldest Veda?',
                optionA: 'Rigveda',
                optionB: 'Samaveda',
                optionC: 'Yajurveda',
                optionD: 'Atharvaveda',
                correctOption: 'A',
            },
            {
                question: 'Which metal was not used by the Indus Valley Civilisation?',
                optionA: 'Copper',
                optionB: 'Bronze',
                optionC: 'Gold',
                optionD: 'Iron',
                correctOption: 'D',
            },
            {
                question: 'Who founded the Mauryan Empire?',
                optionA: 'Ashoka',
                optionB: 'Bindusara',
                optionC: 'Chandragupta Maurya',
                optionD: 'Samudragupta',
                correctOption: 'C',
            },
            {
                question: 'Who wrote the Arthashastra?',
                optionA: 'Kalidasa',
                optionB: 'Kautilya',
                optionC: 'Banabhatta',
                optionD: 'Megasthenes',
                correctOption: 'B',
            },
            {
                question: 'Which Gupta ruler was known as the “Napoleon of India”?',
                optionA: 'Chandragupta I',
                optionB: 'Skandagupta',
                optionC: 'Kumaragupta I',
                optionD: 'Samudragupta',
                correctOption: 'D',
            },
            {
                question: 'Who was the first woman ruler of the Delhi Sultanate?',
                optionA: 'Razia Sultan',
                optionB: 'Chand Bibi',
                optionC: 'Nur Jahan',
                optionD: 'Rani Durgavati',
                correctOption: 'A',
            },
            {
                question: 'Which battle marked the beginning of Mughal rule in India?',
                optionA: 'Battle of Haldighati',
                optionB: 'First Battle of Panipat',
                optionC: 'Battle of Plassey',
                optionD: 'Second Battle of Tarain',
                correctOption: 'B',
            },
            {
                question: 'Who introduced Din-i-Ilahi?',
                optionA: 'Babur',
                optionB: 'Humayun',
                optionC: 'Akbar',
                optionD: 'Aurangzeb',
                correctOption: 'C',
            },
        ],
    },
    {
        quizDate: '2026-10-26',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'Which battle was fought between Akbar’s forces and Maharana Pratap in 1576?',
                optionA: 'Battle of Khanwa',
                optionB: 'Battle of Plassey',
                optionC: 'Battle of Haldighati',
                optionD: 'Battle of Talikota',
                correctOption: 'C',
            },
            {
                question: 'In which year did the Battle of Plassey take place?',
                optionA: '1764',
                optionB: '1757',
                optionC: '1857',
                optionD: '1526',
                correctOption: 'B',
            },
            {
                question: 'Who led the British East India Company’s forces at the Battle of Plassey?',
                optionA: 'Warren Hastings',
                optionB: 'Lord Cornwallis',
                optionC: 'Lord Wellesley',
                optionD: 'Robert Clive',
                correctOption: 'D',
            },
            {
                question: 'Where did the Revolt of 1857 begin?',
                optionA: 'Delhi',
                optionB: 'Kanpur',
                optionC: 'Meerut',
                optionD: 'Lucknow',
                correctOption: 'C',
            },
            {
                question: 'In which year was the Indian National Congress founded?',
                optionA: '1885',
                optionB: '1905',
                optionC: '1887',
                optionD: '1892',
                correctOption: 'A',
            },
            {
                question: 'Who is credited with founding the Indian National Congress?',
                optionA: 'Dadabhai Naoroji',
                optionB: 'A. O. Hume',
                optionC: 'Bal Gangadhar Tilak',
                optionD: 'Mahatma Gandhi',
                correctOption: 'B',
            },
            {
                question: 'Who gave the slogan “Do or Die” during the freedom struggle?',
                optionA: 'Subhas Chandra Bose',
                optionB: 'Jawaharlal Nehru',
                optionC: 'Bhagat Singh',
                optionD: 'Mahatma Gandhi',
                correctOption: 'D',
            },
            {
                question: 'In which year was the Quit India Movement launched?',
                optionA: '1930',
                optionB: '1942',
                optionC: '1947',
                optionD: '1920',
                correctOption: 'B',
            },
            {
                question: 'Who led the British East India Company’s forces at the Battle of Plassey, while also serving as Governor of Bengal?',
                optionA: 'Robert Clive',
                optionB: 'Lord Dalhousie',
                optionC: 'Warren Hastings',
                optionD: 'Lord Curzon',
                correctOption: 'A',
            },
            {
                question: 'Who was the last Viceroy of British India?',
                optionA: 'Lord Wavell',
                optionB: 'Lord Curzon',
                optionC: 'Lord Mountbatten',
                optionD: 'Lord Canning',
                correctOption: 'C',
            },
        ],
    },
    {
        quizDate: '2026-10-27',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'Which institution is known as the central bank of India?',
                optionA: 'State Bank of India',
                optionB: 'Reserve Bank of India',
                optionC: 'Punjab National Bank',
                optionD: 'NABARD',
                correctOption: 'B',
            },
            {
                question: 'Which Five-Year Plan focused on rapid industrialisation in India?',
                optionA: 'First Five-Year Plan',
                optionB: 'Third Five-Year Plan',
                optionC: 'Second Five-Year Plan',
                optionD: 'Fourth Five-Year Plan',
                correctOption: 'C',
            },
            {
                question: 'Who is known for developing the statistical framework behind India’s Second Five-Year Plan?',
                optionA: 'P. C. Mahalanobis',
                optionB: 'Verghese Kurien',
                optionC: 'M. S. Swaminathan',
                optionD: 'Amartya Sen',
                correctOption: 'A',
            },
            {
                question: 'Which constitutional body recommends the distribution of tax revenues between the Centre and the States?',
                optionA: 'NITI Aayog',
                optionB: 'Election Commission of India',
                optionC: 'Union Public Service Commission',
                optionD: 'Finance Commission',
                correctOption: 'D',
            },
            {
                question: 'Which institution regulates the banking system in India?',
                optionA: 'Securities and Exchange Board of India',
                optionB: 'Reserve Bank of India',
                optionC: 'Finance Commission',
                optionD: 'NITI Aayog',
                correctOption: 'B',
            },
            {
                question: 'Which Indian stock exchange is the oldest in Asia?',
                optionA: 'National Stock Exchange',
                optionB: 'Calcutta Stock Exchange',
                optionC: 'Bombay Stock Exchange',
                optionD: 'India International Exchange',
                correctOption: 'C',
            },
            {
                question: 'Which rate is the rate at which the RBI lends short-term funds to commercial banks against eligible collateral?',
                optionA: 'Repo Rate',
                optionB: 'Reverse Repo Rate',
                optionC: 'Bank Deposit Rate',
                optionD: 'Savings Rate',
                correctOption: 'A',
            },
            {
                question: 'Which rate traditionally refers to the rate at which banks park funds with the RBI under the reverse repo facility?',
                optionA: 'Repo Rate',
                optionB: 'Bank Rate',
                optionC: 'Marginal Cost of Funds Rate',
                optionD: 'Reverse Repo Rate',
                correctOption: 'D',
            },
            {
                question: 'Which sector contributes the largest share to India’s GDP?',
                optionA: 'Agriculture sector',
                optionB: 'Services sector',
                optionC: 'Mining sector',
                optionD: 'Manufacturing sector',
                correctOption: 'B',
            },
            {
                question: 'Which index measures changes in the retail prices of a basket of goods and services?',
                optionA: 'Index of Industrial Production',
                optionB: 'Wholesale Price Index',
                optionC: 'Consumer Price Index',
                optionD: 'Nifty 50 Index',
                correctOption: 'C',
            },
        ],
    },
    {
        quizDate: '2026-10-28',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'Which tree species is commonly found in the Nilgiri Hills?',
                optionA: 'Sal',
                optionB: 'Pine',
                optionC: 'Eucalyptus',
                optionD: 'Teak',
                correctOption: 'C',
            },
            {
                question: 'What was a key feature of the Indian Railway Budget for 2011–12?',
                optionA: 'A 10% increase in all passenger fares',
                optionB: 'A 15% increase in all freight rates',
                optionC: 'A 15% increase in passenger fares for every class',
                optionD: 'No increase in passenger fares, including suburban and long-distance travel',
                correctOption: 'D',
            },
            {
                question: 'Which Japanese nuclear power plant suffered severe damage following the earthquake and tsunami of March 11, 2011?',
                optionA: 'Fukushima Daiichi',
                optionB: 'Kashiwazaki-Kariwa',
                optionC: 'Hamaoka',
                optionD: 'Tokai',
                correctOption: 'A',
            },
            {
                question: 'Which Indian Prime Minister visited the Siachen Glacier in 2005?',
                optionA: 'Rajiv Gandhi',
                optionB: 'I. K. Gujral',
                optionC: 'Manmohan Singh',
                optionD: 'Atal Bihari Vajpayee',
                correctOption: 'C',
            },
            {
                question: 'Which novel was written by Kishwar Desai?',
                optionA: 'The White Tiger',
                optionB: 'Witness the Night',
                optionC: 'The God of Small Things',
                optionD: 'A Suitable Boy',
                correctOption: 'B',
            },
            {
                question: 'Which traditional performance form is associated with Karnataka?',
                optionA: 'Jatra',
                optionB: 'Bihu',
                optionC: 'Garba',
                optionD: 'Yakshagana',
                correctOption: 'D',
            },
            {
                question: 'Who received the Ustad Bismillah Khan Yuva Puraskar for theatre in 2009 alongside Abanti Chakraborty?',
                optionA: 'Sukracharjya Rabha',
                optionB: 'Omkar Shrikant Dadarkar',
                optionC: 'K. Nellai Manikandan',
                optionD: 'Ragini Chandersarkar',
                correctOption: 'A',
            },
            {
                question: 'Which country did not win the FIFA World Cup in 2002, 2006, or 2010?',
                optionA: 'Brazil',
                optionB: 'Argentina',
                optionC: 'Spain',
                optionD: 'South Africa',
                correctOption: 'D',
            },
            {
                question: 'Who developed the first successful smallpox vaccine?',
                optionA: 'Louis Pasteur',
                optionB: 'Alexander Fleming',
                optionC: 'Edward Jenner',
                optionD: 'Robert Koch',
                correctOption: 'C',
            },
            {
                question: 'Who was the first Indian to become a member of the British Parliament?',
                optionA: 'Dadabhai Naoroji',
                optionB: 'W. C. Banerjee',
                optionC: 'Bankim Chandra Chattopadhyay',
                optionD: 'Gopal Krishna Gokhale',
                correctOption: 'A',
            },
        ],
    },
    {
        quizDate: '2026-10-29',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'What is the purchase of shares and bonds in Indian companies by foreign portfolio investors generally called?',
                optionA: 'Foreign Direct Investment',
                optionB: 'Portfolio Investment',
                optionC: 'Domestic Investment',
                optionD: 'Public Investment',
                correctOption: 'B',
            },
            {
                question: 'Bt cotton is genetically modified primarily to provide resistance against which pest?',
                optionA: 'Locusts',
                optionB: 'Aphids',
                optionC: 'Bollworms',
                optionD: 'Whiteflies',
                correctOption: 'C',
            },
            {
                question: 'Where is the headquarters of the International Atomic Energy Agency (IAEA)?',
                optionA: 'Geneva',
                optionB: 'Paris',
                optionC: 'Washington, D.C.',
                optionD: 'Vienna',
                correctOption: 'D',
            },
            {
                question: 'Which region was included in the eastern India agricultural development initiative announced in the Union Budget for 2011–12?',
                optionA: 'Assam, West Bengal, Odisha, Bihar, Jharkhand, eastern Uttar Pradesh and Chhattisgarh',
                optionB: 'Punjab, Haryana and Rajasthan',
                optionC: 'Gujarat, Maharashtra and Goa',
                optionD: 'Kerala, Tamil Nadu and Karnataka',
                correctOption: 'A',
            },
            {
                question: 'In India’s Union Budget for 2011–12, what was the basic income-tax exemption limit announced for senior citizens aged 60 to under 80?',
                optionA: '₹2.00 lakh',
                optionB: '₹2.50 lakh',
                optionC: '₹3.00 lakh',
                optionD: '₹5.00 lakh',
                correctOption: 'B',
            },
            {
                question: 'Under the original Constitution of India, who could nominate up to two Anglo-Indian members to the Lok Sabha if the community was inadequately represented?',
                optionA: 'The Prime Minister',
                optionB: 'The Speaker of the Lok Sabha',
                optionC: 'The President of India',
                optionD: 'The Chief Justice of India',
                correctOption: 'C',
            },
            {
                question: 'What is the minimum age required to become the President of India?',
                optionA: '25 years',
                optionB: '30 years',
                optionC: '18 years',
                optionD: '35 years',
                correctOption: 'D',
            },
            {
                question: 'Who said, “Good citizen makes a good state and bad citizen makes a bad state”?',
                optionA: 'Aristotle',
                optionB: 'Plato',
                optionC: 'Jean-Jacques Rousseau',
                optionD: 'Harold Laski',
                correctOption: 'A',
            },
            {
                question: 'Under Article 101 of the Constitution of India, a Member of Parliament may lose their seat for unauthorised absence from all meetings for how long?',
                optionA: '30 days',
                optionB: '60 days',
                optionC: '90 days',
                optionD: '365 days',
                correctOption: 'B',
            },
            {
                question: 'In India, residuary legislative powers are vested in which authority?',
                optionA: 'State Governments',
                optionB: 'Local Governments',
                optionC: 'Union Government (Parliament)',
                optionD: 'Both Union and State Governments equally',
                correctOption: 'C',
            },
        ],
    },
    {
        quizDate: '2026-10-30',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'Where did Gautama Buddha attain enlightenment?',
                optionA: 'Sarnath',
                optionB: 'Bodh Gaya',
                optionC: 'Kapilavastu',
                optionD: 'Rajgir',
                correctOption: 'B',
            },
            {
                question: 'In which year was Shivaji Maharaj crowned at Raigad Fort?',
                optionA: '1627',
                optionB: '1670',
                optionC: '1674',
                optionD: '1680',
                correctOption: 'C',
            },
            {
                question: 'In which year did the Government of India Act introduce dyarchy in the provinces of British India?',
                optionA: '1909',
                optionB: '1919',
                optionC: '1935',
                optionD: '1947',
                correctOption: 'B',
            },
            {
                question: 'Who edited the newspapers Young India and Harijan?',
                optionA: 'Jawaharlal Nehru',
                optionB: 'B. R. Ambedkar',
                optionC: 'Subhas Chandra Bose',
                optionD: 'Mahatma Gandhi',
                correctOption: 'D',
            },
            {
                question: 'Who attended all three Round Table Conferences held in London between 1930 and 1932?',
                optionA: 'B. R. Ambedkar',
                optionB: 'Mahatma Gandhi',
                optionC: 'Sardar Vallabhbhai Patel',
                optionD: 'Jawaharlal Nehru',
                correctOption: 'A',
            },
            {
                question: 'Which is the largest living bird on Earth?',
                optionA: 'Emu',
                optionB: 'Ostrich',
                optionC: 'Albatross',
                optionD: 'Siberian Crane',
                correctOption: 'B',
            },
            {
                question: 'The Rihand Dam is located in which Indian state?',
                optionA: 'Gujarat',
                optionB: 'Odisha',
                optionC: 'Uttar Pradesh',
                optionD: 'Karnataka',
                correctOption: 'C',
            },
            {
                question: 'Where is ISRO’s Master Control Facility located in Karnataka?',
                optionA: 'Hyderabad',
                optionB: 'Thumba',
                optionC: 'Sriharikota',
                optionD: 'Hassan',
                correctOption: 'D',
            },
            {
                question: 'Which is the longest irrigation canal in India?',
                optionA: 'Sirhind Canal',
                optionB: 'Yamuna Canal',
                optionC: 'Indira Gandhi Canal',
                optionD: 'East Kosi Canal',
                correctOption: 'C',
            },
            {
                question: 'Which radioactive element is commonly associated with monazite sand?',
                optionA: 'Potassium',
                optionB: 'Uranium',
                optionC: 'Sodium',
                optionD: 'Thorium',
                correctOption: 'D',
            },
        ],
    },
    {
        quizDate: '2026-10-31',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'Which plant is often called the “Herbal Indian Doctor” because of its traditional medicinal uses?',
                optionA: 'Amla',
                optionB: 'Neem',
                optionC: 'Tulsi',
                optionD: 'Mango',
                correctOption: 'A',
            },
            {
                question: 'Which parts of the coriander plant are commonly used as food?',
                optionA: 'Roots and flowers',
                optionB: 'Leaves and dried fruits',
                optionC: 'Stems and roots only',
                optionD: 'Flowers and bark',
                correctOption: 'B',
            },
            {
                question: 'What is the approximate normal pH of human blood?',
                optionA: '6.6',
                optionB: '7.8',
                optionC: '7.4',
                optionD: '8.5',
                correctOption: 'C',
            },
            {
                question: 'Which is the largest endocrine gland in the human body?',
                optionA: 'Parathyroid',
                optionB: 'Adrenal gland',
                optionC: 'Pituitary gland',
                optionD: 'Thyroid gland',
                correctOption: 'D',
            },
            {
                question: 'Which is the largest mammal on Earth?',
                optionA: 'African elephant',
                optionB: 'Blue whale',
                optionC: 'Rhinoceros',
                optionD: 'Giraffe',
                correctOption: 'B',
            },
            {
                question: 'Which teeth are modified to form an elephant’s tusks?',
                optionA: 'Canines',
                optionB: 'Molars',
                optionC: 'Second upper incisors',
                optionD: 'Premolars',
                correctOption: 'C',
            },
            {
                question: 'Optical fibres work on which principle of light?',
                optionA: 'Interference',
                optionB: 'Dispersion',
                optionC: 'Diffraction',
                optionD: 'Total internal reflection',
                correctOption: 'D',
            },
            {
                question: 'Which gas is commonly used in traditional yellow sodium-vapour street lamps?',
                optionA: 'Sodium vapour',
                optionB: 'Neon',
                optionC: 'Hydrogen',
                optionD: 'Nitrogen',
                correctOption: 'A',
            },
            {
                question: 'A mirage in a hot desert is primarily caused by which optical phenomena?',
                optionA: 'Interference and diffraction',
                optionB: 'Reflection alone',
                optionC: 'Refraction and total internal reflection',
                optionD: 'Dispersion alone',
                correctOption: 'C',
            },
            {
                question: 'Which phenomenon is primarily responsible for the blue colour of the sky?',
                optionA: 'Interference',
                optionB: 'Reflection',
                optionC: 'Refraction',
                optionD: 'Scattering of light',
                correctOption: 'D',
            },
        ],
    },
    {
        quizDate: '2026-11-01',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'Which dance performed by Buddhist monks in Himachal Pradesh is traditionally believed to ward off evil spirits?',
                optionA: 'Nati',
                optionB: 'Chham',
                optionC: 'Bhangra',
                optionD: 'Garba',
                correctOption: 'B',
            },
            {
                question: 'In which Indian state is Viyahula Giddha, a folk dance performed during marriages, popular?',
                optionA: 'Haryana',
                optionB: 'Rajasthan',
                optionC: 'Punjab',
                optionD: 'Gujarat',
                correctOption: 'C',
            },
            {
                question: 'The traditional martial dance and sport Thoda belongs to which state?',
                optionA: 'Sikkim',
                optionB: 'Andhra Pradesh',
                optionC: 'Haryana',
                optionD: 'Himachal Pradesh',
                correctOption: 'D',
            },
            {
                question: 'What is the traditional musical instrument associated with the Limboo community of Sikkim?',
                optionA: 'Chyap-Brung',
                optionB: 'Sitar',
                optionC: 'Santoor',
                optionD: 'Ravanhatta',
                correctOption: 'A',
            },
            {
                question: 'Kandyan Dance is a traditional dance form of which country?',
                optionA: 'Nepal',
                optionB: 'Sri Lanka',
                optionC: 'Thailand',
                optionD: 'Myanmar',
                correctOption: 'B',
            },
            {
                question: 'Who was the first woman to become Chief Justice of a state High Court in India?',
                optionA: 'M. Fathima Beevi',
                optionB: 'Ruma Pal',
                optionC: 'Leila Seth',
                optionD: 'Anna Chandy',
                correctOption: 'C',
            },
            {
                question: 'Who was appointed as India’s first Lokpal in 2019?',
                optionA: 'Justice A. K. Sikri',
                optionB: 'Justice N. V. Ramana',
                optionC: 'Justice S. A. Bobde',
                optionD: 'Justice Pinaki Chandra Ghose',
                correctOption: 'D',
            },
            {
                question: 'Who was the first Indian tennis player to represent independent India at Wimbledon?',
                optionA: 'Ramanathan Krishnan',
                optionB: 'Vijay Amritraj',
                optionC: 'Leander Paes',
                optionD: 'Mahesh Bhupathi',
                correctOption: 'A',
            },
            {
                question: 'Who was the first Indian recipient of the Ramon Magsaysay Award for Community Leadership?',
                optionA: 'Baba Amte',
                optionB: 'Acharya Vinoba Bhave',
                optionC: 'Verghese Kurien',
                optionD: 'Arvind Kejriwal',
                correctOption: 'B',
            },
            {
                question: 'Who became the first Indian woman to summit Mount Makalu?',
                optionA: 'Bachendri Pal',
                optionB: 'Arunima Sinha',
                optionC: 'Priyanka Mohite',
                optionD: 'Santosh Yadav',
                correctOption: 'C',
            },
        ],
    },
    {
        quizDate: '2026-11-02',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'Who was the first recipient of the Jnanpith Award?',
                optionA: 'Rabindranath Tagore',
                optionB: 'Mahadevi Varma',
                optionC: 'Kuvempu',
                optionD: 'G. Sankara Kurup',
                correctOption: 'D',
            },
            {
                question: 'Who was the first Indian woman to swim across the English Channel?',
                optionA: 'Arati Saha',
                optionB: 'Bula Choudhury',
                optionC: 'Nisha Millet',
                optionD: 'Ujwala Rai',
                correctOption: 'A',
            },
            {
                question: 'Who received the first Philip Kotler Presidential Award in 2019?',
                optionA: 'Ratan Tata',
                optionB: 'Narendra Modi',
                optionC: 'A. P. J. Abdul Kalam',
                optionD: 'Manmohan Singh',
                correctOption: 'B',
            },
            {
                question: 'Who became the first female amputee to climb Mount Everest?',
                optionA: 'Bachendri Pal',
                optionB: 'Santosh Yadav',
                optionC: 'Arunima Sinha',
                optionD: 'Priyanka Mohite',
                correctOption: 'C',
            },
            {
                question: 'Who became the first woman IPS officer from India to complete an expedition to the South Pole?',
                optionA: 'Kiran Bedi',
                optionB: 'Sanjukta Parashar',
                optionC: 'Sonal Goel',
                optionD: 'Aparna Kumar',
                correctOption: 'D',
            },
            {
                question: 'Who was the first Governor of Madhya Pradesh?',
                optionA: 'Dr. B. Pattabhi Sitaramayya',
                optionB: 'Hari Vinayak Pataskar',
                optionC: 'Kailash Nath Katju',
                optionD: 'Ravishankar Shukla',
                correctOption: 'A',
            },
            {
                question: 'Asia’s largest wholesale spice market is located in which city?',
                optionA: 'Mumbai',
                optionB: 'Delhi',
                optionC: 'Kolkata',
                optionD: 'Chennai',
                correctOption: 'B',
            },
            {
                question: 'In which Indian state does the sunrise first appear over the country’s mainland?',
                optionA: 'Assam',
                optionB: 'Nagaland',
                optionC: 'Arunachal Pradesh',
                optionD: 'Manipur',
                correctOption: 'C',
            },
            {
                question: 'The world’s only floating post office is located on which lake in India?',
                optionA: 'Wular Lake',
                optionB: 'Loktak Lake',
                optionC: 'Naini Lake',
                optionD: 'Dal Lake',
                correctOption: 'D',
            },
            {
                question: 'Which is the smallest Union Territory of India by area?',
                optionA: 'Lakshadweep',
                optionB: 'Chandigarh',
                optionC: 'Puducherry',
                optionD: 'Delhi',
                correctOption: 'A',
            },
        ],
    },
    {
        quizDate: '2026-11-03',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'Who created Archie, an early Internet search tool?',
                optionA: 'Tim Berners-Lee',
                optionB: 'Alan Emtage',
                optionC: 'Vint Cerf',
                optionD: 'Larry Page',
                correctOption: 'B',
            },
            {
                question: 'How often are the Asian Games generally held?',
                optionA: 'Every 2 years',
                optionB: 'Every 3 years',
                optionC: 'Every 4 years',
                optionD: 'Every 5 years',
                correctOption: 'C',
            },
            {
                question: 'In which sport is the term “cherry picking” commonly used?',
                optionA: 'Cricket',
                optionB: 'Tennis',
                optionC: 'Swimming',
                optionD: 'Basketball',
                correctOption: 'D',
            },
            {
                question: 'The “dolphin kick” is associated with which sport?',
                optionA: 'Swimming',
                optionB: 'Football',
                optionC: 'Cycling',
                optionD: 'Badminton',
                correctOption: 'A',
            },
            {
                question: 'The scissors kick is a technique associated with which sport?',
                optionA: 'Hockey',
                optionB: 'Football',
                optionC: 'Basketball',
                optionD: 'Volleyball',
                correctOption: 'B',
            },
            {
                question: 'Which sport is played in a velodrome?',
                optionA: 'Speed skating',
                optionB: 'Athletics',
                optionC: 'Track cycling',
                optionD: 'Gymnastics',
                correctOption: 'C',
            },
            {
                question: 'In which year did independent India win its first Olympic gold medal?',
                optionA: '1936',
                optionB: '1952',
                optionC: '1947',
                optionD: '1948',
                correctOption: 'D',
            },
            {
                question: 'Who was the first Indian woman to win an Olympic medal?',
                optionA: 'Karnam Malleswari',
                optionB: 'P. T. Usha',
                optionC: 'Saina Nehwal',
                optionD: 'Mary Kom',
                correctOption: 'A',
            },
            {
                question: 'Which of the following colours is not present in the Olympic rings?',
                optionA: 'Green',
                optionB: 'Pink',
                optionC: 'Blue',
                optionD: 'Red',
                correctOption: 'B',
            },
            {
                question: 'In which city is the Roland-Garros tennis Grand Slam tournament held?',
                optionA: 'London',
                optionB: 'Melbourne',
                optionC: 'Paris',
                optionD: 'New York',
                correctOption: 'C',
            },
        ],
    },
    {
        quizDate: '2026-11-04',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'The tomb of a Sufi saint is commonly called a:',
                optionA: 'Dargah',
                optionB: 'Khanqah',
                optionC: 'Idgah',
                optionD: 'Madrasa',
                correctOption: 'A',
            },
            {
                question: 'Where is Harmandir Sahib, popularly known as the Golden Temple, located?',
                optionA: 'Patiala',
                optionB: 'Amritsar',
                optionC: 'Ludhiana',
                optionD: 'Jalandhar',
                correctOption: 'B',
            },
            {
                question: 'Which World Heritage Site is incorrectly matched with its state?',
                optionA: 'Humayun’s Tomb — Delhi',
                optionB: 'Valley of Flowers — Uttarakhand',
                optionC: 'Airavatesvara Temple — Karnataka',
                optionD: 'Manas Wildlife Sanctuary — Assam',
                correctOption: 'C',
            },
            {
                question: 'Who was the first Indian to win an individual Olympic medal?',
                optionA: 'Norman Pritchard',
                optionB: 'K. D. Jadhav',
                optionC: 'Leander Paes',
                optionD: 'Saina Nehwal',
                correctOption: 'A',
            },
            {
                question: 'Which traditional martial art of South Korea is widely regarded as its national martial art?',
                optionA: 'Judo',
                optionB: 'Karate',
                optionC: 'Taekwondo',
                optionD: 'Kung fu',
                correctOption: 'C',
            },
            {
                question: 'What is the official currency of Japan?',
                optionA: 'Won',
                optionB: 'Yuan',
                optionC: 'Dollar',
                optionD: 'Yen',
                correctOption: 'D',
            },
            {
                question: 'Who is widely known as the chief architect of the Indian Constitution?',
                optionA: 'Jawaharlal Nehru',
                optionB: 'Mahatma Gandhi',
                optionC: 'B. R. Ambedkar',
                optionD: 'Rajendra Prasad',
                correctOption: 'C',
            },
            {
                question: 'Which gas is the most abundant in Earth’s atmosphere?',
                optionA: 'Oxygen',
                optionB: 'Carbon dioxide',
                optionC: 'Hydrogen',
                optionD: 'Nitrogen',
                correctOption: 'D',
            },
            {
                question: 'Where is the headquarters of UNESCO located?',
                optionA: 'Geneva',
                optionB: 'New York',
                optionC: 'Paris',
                optionD: 'London',
                correctOption: 'C',
            },
            {
                question: 'Which Indian state has the longest coastline?',
                optionA: 'Maharashtra',
                optionB: 'Kerala',
                optionC: 'Tamil Nadu',
                optionD: 'Gujarat',
                correctOption: 'D',
            },
        ],
    },
    {
        quizDate: '2026-11-05',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'Which planet is known as the Red Planet?',
                optionA: 'Venus',
                optionB: 'Mars',
                optionC: 'Jupiter',
                optionD: 'Saturn',
                correctOption: 'B',
            },
            {
                question: 'Who is commonly credited with inventing the practical telephone?',
                optionA: 'Thomas Edison',
                optionB: 'Alexander Graham Bell',
                optionC: 'Nikola Tesla',
                optionD: 'James Watt',
                correctOption: 'B',
            },
            {
                question: 'Which is the smallest Indian state by area?',
                optionA: 'Goa',
                optionB: 'Sikkim',
                optionC: 'Tripura',
                optionD: 'Manipur',
                correctOption: 'A',
            },
            {
                question: 'What is the full form of RBI?',
                optionA: 'Reserve Bank of India',
                optionB: 'Royal Bank of India',
                optionC: 'Regional Bank of India',
                optionD: 'Rural Bank of India',
                correctOption: 'A',
            },
            {
                question: 'When is World Environment Day celebrated?',
                optionA: 'June 1',
                optionB: 'June 3',
                optionC: 'June 5',
                optionD: 'June 7',
                correctOption: 'C',
            },
            {
                question: 'Which Indian palace is also known as Amba Vilas Palace?',
                optionA: 'Victoria Memorial',
                optionB: 'Hawa Mahal',
                optionC: 'Mysore Palace',
                optionD: 'Charminar',
                correctOption: 'C',
            },
            {
                question: 'Who commissioned the Taj Mahal?',
                optionA: 'Shah Jahan',
                optionB: 'Akbar',
                optionC: 'Aurangzeb',
                optionD: 'Babur',
                correctOption: 'A',
            },
            {
                question: 'Where is Buland Darwaza located?',
                optionA: 'Agra',
                optionB: 'Fatehpur Sikri',
                optionC: 'Jaipur',
                optionD: 'Jodhpur',
                correctOption: 'B',
            },
            {
                question: 'Which Indian monument is a famous example of a tall stone minaret built primarily of masonry?',
                optionA: 'Qutb Minar',
                optionB: 'Leaning Tower of Pisa',
                optionC: 'Big Ben',
                optionD: 'Charminar',
                correctOption: 'A',
            },
            {
                question: 'Which temple complex in Odisha is designed in the form of a gigantic chariot?',
                optionA: 'Meenakshi Temple',
                optionB: 'Konark Sun Temple',
                optionC: 'Brihadisvara Temple',
                optionD: 'Mahabodhi Temple',
                correctOption: 'B',
            },
        ],
    },
    {
        quizDate: '2026-11-06',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'In which year did the Constitution of India come into force?',
                optionA: '1947',
                optionB: '1949',
                optionC: '1950',
                optionD: '1951',
                correctOption: 'C',
            },
            {
                question: 'On which date did the Jallianwala Bagh massacre take place?',
                optionA: '13 April 1919',
                optionB: '19 April 1919',
                optionC: '14 April 1920',
                optionD: '19 April 1913',
                correctOption: 'A',
            },
            {
                question: 'At which session did the Indian National Congress adopt the resolution of Poorna Swaraj in 1929?',
                optionA: 'Lahore',
                optionB: 'Surat',
                optionC: 'Belgaum',
                optionD: 'Tripuri',
                correctOption: 'A',
            },
            {
                question: 'Ashoka’s rock edicts at Jaugada are located in which state?',
                optionA: 'Odisha',
                optionB: 'Gujarat',
                optionC: 'Uttar Pradesh',
                optionD: 'Andhra Pradesh',
                correctOption: 'A',
            },
            {
                question: 'The archaeological site of Surkotada is located in which state?',
                optionA: 'Gujarat',
                optionB: 'Rajasthan',
                optionC: 'Haryana',
                optionD: 'Karnataka',
                correctOption: 'A',
            },
            {
                question: 'Which Indian state is the largest producer of coffee?',
                optionA: 'Kerala',
                optionB: 'Assam',
                optionC: 'Tamil Nadu',
                optionD: 'Karnataka',
                correctOption: 'D',
            },
            {
                question: 'Which river is generally regarded as the longest river flowing within India?',
                optionA: 'Ganga',
                optionB: 'Brahmaputra',
                optionC: 'Indus',
                optionD: 'Godavari',
                correctOption: 'A',
            },
            {
                question: 'Mount Kilimanjaro is located in which country?',
                optionA: 'Kenya',
                optionB: 'Tanzania',
                optionC: 'Ethiopia',
                optionD: 'Uganda',
                correctOption: 'B',
            },
            {
                question: 'The Great Barrier Reef lies off the coast of which country?',
                optionA: 'India',
                optionB: 'South Africa',
                optionC: 'Australia',
                optionD: 'Brazil',
                correctOption: 'C',
            },
            {
                question: 'Which ocean trench contains the deepest known point in the world’s oceans?',
                optionA: 'Mariana Trench',
                optionB: 'Tonga Trench',
                optionC: 'Philippine Trench',
                optionD: 'Java Trench',
                correctOption: 'A',
            },
        ],
    },
    {
        quizDate: '2026-11-07',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'Which continent was historically referred to as the “Dark Continent”?',
                optionA: 'Asia',
                optionB: 'Africa',
                optionC: 'South America',
                optionD: 'Australia',
                correctOption: 'B',
            },
            {
                question: 'The Tropic of Cancer passes through how many Indian states?',
                optionA: '6',
                optionB: '7',
                optionC: '8',
                optionD: '9',
                correctOption: 'C',
            },
            {
                question: 'Which is the largest hot desert in the world?',
                optionA: 'Sahara',
                optionB: 'Gobi',
                optionC: 'Thar',
                optionD: 'Kalahari',
                correctOption: 'A',
            },
            {
                question: 'Which river is known as the “Sorrow of Bengal”?',
                optionA: 'Ganga',
                optionB: 'Damodar',
                optionC: 'Hooghly',
                optionD: 'Brahmaputra',
                correctOption: 'B',
            },
            {
                question: 'Which country has the greatest number of time zones when its overseas territories are included?',
                optionA: 'Russia',
                optionB: 'United States',
                optionC: 'France',
                optionD: 'China',
                correctOption: 'C',
            },
            {
                question: 'Who was the first Governor-General of independent India?',
                optionA: 'Lord Mountbatten',
                optionB: 'C. Rajagopalachari',
                optionC: 'Jawaharlal Nehru',
                optionD: 'Rajendra Prasad',
                correctOption: 'A',
            },
            {
                question: 'The Indus Valley Civilisation primarily belonged to which age?',
                optionA: 'Stone Age',
                optionB: 'Bronze Age',
                optionC: 'Iron Age',
                optionD: 'Modern Age',
                correctOption: 'B',
            },
            {
                question: 'Who is traditionally credited with writing the Arthashastra?',
                optionA: 'Kalidasa',
                optionB: 'Banabhatta',
                optionC: 'Chanakya (Kautilya)',
                optionD: 'Tulsidas',
                correctOption: 'C',
            },
            {
                question: 'In which year was the Non-Cooperation Movement launched?',
                optionA: '1917',
                optionB: '1919',
                optionC: '1920',
                optionD: '1922',
                correctOption: 'C',
            },
            {
                question: 'Who was popularly known as the “Iron Man of India”?',
                optionA: 'Jawaharlal Nehru',
                optionB: 'Subhas Chandra Bose',
                optionC: 'B. R. Ambedkar',
                optionD: 'Sardar Vallabhbhai Patel',
                correctOption: 'D',
            },
        ],
    },
    {
        quizDate: '2026-11-08',
        title: 'Daily GK Quiz',
        questions: [
            {
                question: 'Hampi, the former capital of the Vijayanagara Empire, is located in which state?',
                optionA: 'Tamil Nadu',
                optionB: 'Andhra Pradesh',
                optionC: 'Karnataka',
                optionD: 'Telangana',
                correctOption: 'C',
            },
            {
                question: 'Which monument is widely known as the “Symbol of Love”?',
                optionA: 'Qutb Minar',
                optionB: 'Taj Mahal',
                optionC: 'India Gate',
                optionD: 'Gateway of India',
                correctOption: 'B',
            },
            {
                question: 'The Ajanta Caves are especially famous for which artistic feature?',
                optionA: 'Buddhist paintings',
                optionB: 'Mughal miniature paintings',
                optionC: 'Modern sculptures',
                optionD: 'European frescoes',
                correctOption: 'A',
            },
            {
                question: 'Which fort in Rajasthan is popularly known as the “Golden Fort”?',
                optionA: 'Amer Fort',
                optionB: 'Red Fort',
                optionC: 'Jaisalmer Fort',
                optionD: 'Gwalior Fort',
                correctOption: 'C',
            },
            {
                question: 'In which city is Charminar located?',
                optionA: 'Delhi',
                optionB: 'Hyderabad',
                optionC: 'Lucknow',
                optionD: 'Bhopal',
                correctOption: 'B',
            },
            {
                question: 'Who won the women’s individual compound archery gold medal at the 2022 Asian Games, held in 2023?',
                optionA: 'Jyothi Surekha Vennam',
                optionB: 'Deepika Kumari',
                optionC: 'Atanu Das',
                optionD: 'Abhishek Verma',
                correctOption: 'A',
            },
            {
                question: 'Which country hosted the 19th Asian Games, held in 2023?',
                optionA: 'Japan',
                optionB: 'China',
                optionC: 'South Korea',
                optionD: 'India',
                correctOption: 'B',
            },
            {
                question: 'Who holds the men’s record for the most sixes in One Day International cricket?',
                optionA: 'Shahid Afridi',
                optionB: 'Chris Gayle',
                optionC: 'Rohit Sharma',
                optionD: 'AB de Villiers',
                correctOption: 'C',
            },
            {
                question: 'Alastair Cook is a former player in which sport?',
                optionA: 'Cricket',
                optionB: 'Football',
                optionC: 'Tennis',
                optionD: 'Golf',
                correctOption: 'A',
            },
            {
                question: 'Which Indian chess grandmaster defeated Magnus Carlsen at the Qatar Masters Open in 2023?',
                optionA: 'Karthikeyan Murali',
                optionB: 'Viswanathan Anand',
                optionC: 'R. Praggnanandhaa',
                optionD: 'D. Gukesh',
                correctOption: 'A',
            },
        ],
    },
];

function validateQuizSeeds(): void {
    if (quizSeeds.length !== 25) {
        throw new Error(
            `Expected 25 daily quizzes, but found ${quizSeeds.length}.`,
        );
    }

    const seenDates = new Set<string>();

    for (const quiz of quizSeeds) {
        // Validate the date format and actual calendar date.
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;

        if (!datePattern.test(quiz.quizDate)) {
            throw new Error(
                `Invalid quiz date format: ${quiz.quizDate}`,
            );
        }

        const parsedDate = new Date(`${quiz.quizDate}T00:00:00.000Z`);

        if (
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== quiz.quizDate
        ) {
            throw new Error(
                `Invalid calendar date: ${quiz.quizDate}`,
            );
        }

        // Never allow two entries for the same date.
        if (seenDates.has(quiz.quizDate)) {
            throw new Error(
                `Duplicate quiz date found: ${quiz.quizDate}`,
            );
        }

        seenDates.add(quiz.quizDate);

        // Validate the question count.
        if (quiz.questions.length !== 10) {
            throw new Error(
                `Quiz ${quiz.quizDate} must contain exactly 10 questions.`,
            );
        }

        for (const [index, question] of quiz.questions.entries()) {
            const questionNumber = index + 1;

            const requiredFields = [
                question.question,
                question.optionA,
                question.optionB,
                question.optionC,
                question.optionD,
            ];

            if (
                requiredFields.some(
                    (value) =>
                        typeof value !== 'string' || value.trim().length === 0,
                )
            ) {
                throw new Error(
                    `Quiz ${quiz.quizDate}, question ${questionNumber}: required text fields cannot be empty.`,
                );
            }

            const options = [
                question.optionA,
                question.optionB,
                question.optionC,
                question.optionD,
            ].map((option) => option.trim().toLowerCase());

            if (new Set(options).size !== 4) {
                throw new Error(
                    `Quiz ${quiz.quizDate}, question ${questionNumber}: all four options must be distinct.`,
                );
            }

            if (
                !['A', 'B', 'C', 'D'].includes(question.correctOption)
            ) {
                throw new Error(
                    `Quiz ${quiz.quizDate}, question ${questionNumber}: invalid correct option.`,
                );
            }
        }
    }

    console.log(
        `Validated ${quizSeeds.length} quizzes and ${quizSeeds.reduce((total, quiz) => total + quiz.questions.length, 0)
        } questions.`,
    );
}



async function run() {

    validateQuizSeeds();

    await SeedDataSource.initialize();

    try {
        const challengeRepository = SeedDataSource.getRepository(ChallengeEntity);

        const challenge = await challengeRepository.findOne({
            where: {
                id: DAILY_GK_CHALLENGE_ID
            }
        });

        if (!challenge) {
            throw new Error(
                `Daily GK Quiz challenge not found: ${DAILY_GK_CHALLENGE_ID}`,
            );
        }

        if (challenge.type !== ChallengeType.QUIZ) {
            throw new Error(
                `Challenge ${DAILY_GK_CHALLENGE_ID} is not a QUIZ challenge.`,
            );
        }

        console.log(
            `Verified challenge: ${challenge.title} (${challenge.id})`,
        );

        const quizRepository = SeedDataSource.getRepository(QuizEntity);

        let createdQuizzes = 0;
        let skippedQuizzes = 0;

        for (const quizSeed of quizSeeds) {

            const existingQuiz = await quizRepository.findOne({
                where: {
                    challenge: { id: DAILY_GK_CHALLENGE_ID },
                    quizDate: quizSeed.quizDate,
                },
            });

            if (existingQuiz) {
                skippedQuizzes++;

                console.log(
                    `Skipped ${quizSeed.quizDate}: quiz already exists.`,
                );

                continue;
            }

            await SeedDataSource.transaction(async (manager) => {
                const quiz = manager.create(QuizEntity, {
                    title: quizSeed.title,
                    quizDate: quizSeed.quizDate,
                    isActive: true,
                    challenge: { id: DAILY_GK_CHALLENGE_ID },
                });

                const savedQuiz = await manager.save(QuizEntity, quiz);

                const questions = quizSeed.questions.map((question) =>
                    manager.create(QuizQuestionEntity, {
                        ...question,
                        quiz: savedQuiz,
                    }),
                );

                await manager.save(QuizQuestionEntity, questions);
            });

            createdQuizzes++;

            console.log(`Created quiz for ${quizSeed.quizDate}.`);


        }

        console.log(
            `Daily quiz seeding complete. Created: ${createdQuizzes}, skipped: ${skippedQuizzes}.`,
        );


    }
    finally {
        if (SeedDataSource.isInitialized) {
            await SeedDataSource.destroy();
        }

    }

}

run().catch((error: unknown) => {
    console.error('Daily quiz seeding failed:', error);
    process.exitCode = 1;
});