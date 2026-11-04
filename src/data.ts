export type Skill = 'Speaking' | 'Writing' | 'Reading' | 'Listening';

export const skills = [
  { name: 'Speaking' as Skill, icon: 'mic-outline', color: '#176BCE', score: 72, questions: 6, subtitle: 'Build fluency & pronunciation' },
  { name: 'Writing' as Skill, icon: 'create-outline', color: '#7B61D1', score: 65, questions: 2, subtitle: 'Structure confident responses' },
  { name: 'Reading' as Skill, icon: 'book-outline', color: '#12A274', score: 78, questions: 5, subtitle: 'Improve speed & accuracy' },
  { name: 'Listening' as Skill, icon: 'headset-outline', color: '#E58B24', score: 69, questions: 4, subtitle: 'Train active listening' },
];

export const taskGroups: Record<Skill, { title: string; detail: string; icon: string; count: number; tag?: string }[]> = {
  Speaking: [
    { title: 'Read Aloud', detail: 'Pronunciation · Fluency', icon: 'volume-high-outline', count: 428, tag: 'Popular' },
    { title: 'Repeat Sentence', detail: 'Listening · Memory', icon: 'repeat-outline', count: 612 },
    { title: 'Describe Image', detail: 'Content · Fluency', icon: 'image-outline', count: 235 },
    { title: 'Retell Lecture', detail: 'Content · Pronunciation', icon: 'school-outline', count: 164 },
    { title: 'Answer Short Question', detail: 'Vocabulary', icon: 'chatbubble-outline', count: 306 },
    { title: 'Respond to a Situation', detail: 'Appropriacy · Fluency', icon: 'people-outline', count: 92, tag: 'New' },
  ],
  Writing: [
    { title: 'Summarize Written Text', detail: 'Form · Grammar · Vocabulary', icon: 'document-text-outline', count: 248 },
    { title: 'Write Essay', detail: 'Content · Development · Form', icon: 'reader-outline', count: 196, tag: 'Popular' },
  ],
  Reading: [
    { title: 'Reading & Writing: Fill Blanks', detail: 'Vocabulary · Grammar', icon: 'text-outline', count: 540 },
    { title: 'Multiple Choice, Multiple Answers', detail: 'Comprehension', icon: 'checkbox-outline', count: 174 },
    { title: 'Reorder Paragraphs', detail: 'Coherence · Structure', icon: 'reorder-three-outline', count: 265 },
    { title: 'Fill in the Blanks', detail: 'Vocabulary', icon: 'ellipsis-horizontal-circle-outline', count: 486 },
    { title: 'Multiple Choice, Single Answer', detail: 'Comprehension', icon: 'radio-button-on-outline', count: 182 },
  ],
  Listening: [
    { title: 'Summarize Spoken Text', detail: 'Content · Form · Grammar', icon: 'document-text-outline', count: 214 },
    { title: 'Multiple Choice, Multiple Answers', detail: 'Listening comprehension', icon: 'checkbox-outline', count: 165 },
    { title: 'Fill in the Blanks', detail: 'Listening · Spelling', icon: 'text-outline', count: 388 },
    { title: 'Highlight Correct Summary', detail: 'Comprehension', icon: 'list-outline', count: 204 },
    { title: 'Select Missing Word', detail: 'Meaning · Context', icon: 'help-circle-outline', count: 171 },
    { title: 'Write from Dictation', detail: 'Listening · Spelling', icon: 'pencil-outline', count: 732, tag: 'Popular' },
  ],
};

export const mockTests = [
  { id: 1, title: 'Full Mock Test 01', questions: 73, duration: '2h 15m', level: 'Exam simulation', locked: false, progress: 0 },
  { id: 2, title: 'Full Mock Test 02', questions: 76, duration: '2h 10m', level: 'Exam simulation', locked: false, progress: 38 },
  { id: 3, title: 'Full Mock Test 03', questions: 70, duration: '2h 05m', level: 'Exam simulation', locked: true, progress: 0 },
  { id: 4, title: 'Speaking Mini Mock', questions: 18, duration: '32m', level: 'Section test', locked: false, progress: 0 },
];

export const plans = [
  { name: 'Basic', days: 30, price: '11.60', color: '#176BCE', features: ['Unlimited practice', 'Unlimited scored mock tests', 'Daily study plan'] },
  { name: 'Standard', days: 60, price: '23.60', color: '#7B61D1', popular: true, features: ['Everything in Basic', 'Weekly prediction files', 'Priority score reports'] },
  { name: 'Premium', days: 90, price: '31.50', color: '#0A9D75', features: ['Everything in Standard', 'Training package access', 'Priority live support'] },
];
