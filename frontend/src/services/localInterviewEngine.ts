import {
  InterviewConfig,
  InterviewSession,
  QuestionData,
  EvaluationData,
  ReportData,
  HistoryItem,
  ResumeParseResult,
  SupportedLanguage
} from '../types';

interface StoredSession {
  config: InterviewConfig;
  session: InterviewSession;
  questions: QuestionData[];
  answers: Record<string, { answer: string; code?: string; evaluation: EvaluationData }>;
  isTerminated: boolean;
  terminationReason?: string;
  violations: number;
}

const LOCAL_SESSIONS: Record<string, StoredSession> = {};

// Universal Opening Question
const OPENING_QUESTIONS: Record<SupportedLanguage, { question: string; concepts: string[]; hints: string; answer: string; followUp: string }> = {
  English: {
    question: 'Tell me about yourself, your educational background, key technical projects, and what interests you about this role.',
    concepts: ['Self-introduction', 'Educational background', 'Key technical skills & projects', 'Career aspirations', 'Role alignment'],
    hints: 'Structure your answer: 1) Who you are & your educational background, 2) Technical skills and key projects you have built, 3) Why you are passionate about this role.',
    answer: 'I am a dedicated software developer with a background in Computer Science. Over the course of my academics and projects, I have worked with modern programming languages, web architectures, and databases. In one of my primary projects, I developed a full-stack application that solved real-time scheduling challenges. I am excited about this role because it directly aligns with my passion for building scalable solutions, solving challenging problems, and continuing to learn within a collaborative engineering culture.',
    followUp: 'What was the most challenging technical hurdle you solved in one of the projects you mentioned, and what did you learn from it?'
  },
  Telugu: {
    question: 'మీ గురించి, మీ విద్యా నేపథ్యం, మీరు చేసిన ముఖ్యమైన ప్రాజెక్ట్‌లు మరియు ఈ ఉద్యోగం పట్ల మీ ఆసక్తి గురించి వివరించండి.',
    concepts: ['స్వీయ పరిచయం', 'విద్యా నేపథ్యం', 'సాంకేతిక నైపుణ్యాలు', 'ప్రాజెక్టులు', 'ఉద్యోగ ఆసక్తి'],
    hints: 'మీ పరిచయం, చదువు, మీరు చేసిన ఒక ముఖ్యమైన ప్రాజెక్ట్ మరియు ఈ రోల్‌పై మీ ఆసక్తిని క్రమపద్ధతిలో వివరించండి.',
    answer: 'నేను సాఫ్ట్‌వేర్ ఇంజనీరింగ్‌పై ఎంతో ఆసక్తి ఉన్న గ్రాడ్యుయేట్‌ని. నా చదువులో భాగంగా ఆధునిక సాంకేతికతలు, వెబ్ అప్లికేషన్లు మరియు డేటాబేస్‌లతో ప్రాజెక్ట్‌లు నిర్మించాను.',
    followUp: 'మీరు చేసిన ప్రాజెక్ట్‌లలో మీకు బాగా గుర్తింపు తెచ్చిన అంశం ఏది?'
  },
  Hindi: {
    question: 'कृपया अपने बारे में बताएं, अपनी शैक्षणिक पृष्ठभूमि, मुख्य प्रोजेक्ट्स और इस पद में आपकी रुचि के बारे में साझा करें।',
    concepts: ['आत्म-परिचय', 'शैक्षणिक पृष्ठभूमि', 'तकनीकी कौशल', 'प्रोजेक्ट्स', 'भूमिका में रुचि'],
    hints: 'अपने संक्षिप्त परिचय, शिक्षा, अपने सबसे महत्वपूर्ण प्रोजेक्ट और इस कंपनी में काम करने की इच्छा को स्पष्ट रूप से समझाएं।',
    answer: 'मैं कंप्यूटर साइंस का स्नातक हूँ और मुझे सॉफ्टवेयर डेवलपमेंट में गहरी रुचि है। मैंने विभिन्न तकनीकों का उपयोग करके कई प्रोजेक्ट्स बनाए हैं।',
    followUp: 'आपके द्वारा बनाए गए प्रोजेक्ट्स में से कौन सा प्रोजेक्ट सबसे चुनौतीपूर्ण था?'
  },
  Tamil: {
    question: 'உங்களைப் பற்றி, உங்கள் கல்விப் பின்னணி, முக்கிய திட்டங்கள் மற்றும் இந்த வேலை மீதான உங்கள் ஆர்வம் குறித்து கூறுங்கள்.',
    concepts: ['சுய அறிமுகம்', 'கல்வி', 'தொழில்நுட்ப திறன்கள்', 'திட்டங்கள்', 'வேலை ஆர்வம்'],
    hints: 'உங்கள் கல்வி, நீங்கள் செய்த தொழில்நுட்ப திட்டங்கள் மற்றும் இந்த பணிக்கான உங்கள் விருப்பத்தை தெளிவாக விவரிக்கவும்.',
    answer: 'நான் மென்பொருள் உருவாக்கத்தில் ஆர்வமுள்ள ஒரு பட்டதாரி. எனது படிப்பின் போது பல்வேறு செயலிகளை உருவாக்கியுள்ளேன்.',
    followUp: 'நீங்கள் செய்த திட்டங்களில் உங்களுக்கு மிகவும் பிடித்த திட்டம் எது?'
  },
  Kannada: {
    question: 'ನಿಮ್ಮ ಬಗ್ಗೆ, ನಿಮ್ಮ ಶೈಕ್ಷಣಿಕ ಹಿನ್ನೆಲೆ, ಪ್ರಮುಖ ಯೋಜನೆಗಳು ಮತ್ತು ಈ ಹುದ್ದೆಯ ಬಗ್ಗೆ ನಿಮ್ಮ ಆಸಕ್ತಿಯನ್ನು ವಿವರಿಸಿ.',
    concepts: ['ಸ್ವಯಂ ಪರಿಚಯ', 'ಶಿಕ್ಷಣ', 'ತಾಂತ್ರಿಕ ಕೌಶಲ್ಯಗಳು', 'ಯೋಜನೆಗಳು', 'ಉದ್ಯೋಗ ಆಸಕ್ತಿ'],
    hints: 'ನಿಮ್ಮ ಶಿಕ್ಷಣ, ಮಾಡಿದ ಯೋಜನೆಗಳು ಮತ್ತು ಈ ಕೆಲಸದಲ್ಲಿ ನಿಮ್ಮ ಆಸಕ್ತಿಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ತಿಳಿಸಿ.',
    answer: 'ನಾನು ಸಾಫ್ಟ್‌ವೇರ್ ಅಭಿವೃದ್ಧಿಯಲ್ಲಿ ಆಸಕ್ತಿ ಹೊಂದಿರುವ ಪದವೀಧರ. ನನ್ನ ವಿದ್ಯಾಭ್ಯಾಸದ ಅವಧಿಯಲ್ಲಿ ನಾನು ಪ್ರಮುಖ ಪ್ರಾಜೆಕ್ಟ್‌ಗಳನ್ನು ನಿರ್ಮಿಸಿದ್ದೇನೆ.',
    followUp: 'ನಿಮ್ಮ ಯೋಜನೆಗಳಲ್ಲಿ ನೀವು ಎದುರಿಸಿದ ಅತಿ ದೊಡ್ಡ ಸವಾಲು ಯಾವುದು?'
  },
  Malayalam: {
    question: 'നിങ്ങളെക്കുറിച്ച്, നിങ്ങളുടെ പഠന പശ്ചാത്തലം, പ്രധാന പ്രോജക്ടുകൾ, ഈ ജോലിയോടുള്ള താല്പര്യം എന്നിവയെക്കുറിച്ച് പറയുക.',
    concepts: ['സ്വയം പരിചയപ്പെടുത്തൽ', 'വിദ്യാഭ്യാസം', 'പ്രോജക്റ്റുകൾ', 'കഴിവുകൾ', 'താല്പര്യം'],
    hints: 'നിങ്ങളുടെ പഠനം, ചെയ്ത പ്രോജക്റ്റുകൾ, ഈ ജോലി തിരഞ്ഞെടുക്കാനുള്ള കാരണം എന്നിവ വ്യക്തമാക്കുക.',
    answer: 'ഞാൻ സോഫ്റ്റ്‌വെയർ ഡെവലപ്‌മെന്റിൽ താല്പര്യമുള്ള ഒരു ബിരുദധാരിയാണ്. പഠനകാലത്ത് ഞാൻ വിവിധ വെബ് പ്രോജക്റ്റുകൾ ചെയ്തിട്ടുണ്ട്.',
    followUp: 'നിങ്ങൾ ചെയ്തതിൽ ഏറ്റവും അഭിമാനം തോന്നിയ പ്രോജക്റ്റ് ഏതാണ്?'
  }
};

const ROLE_QUESTIONS: Record<string, Array<{ question: string; type: string; concepts: string[]; hints: string; answer: string; followUp: string; codeStarter?: string }>> = {
  'Software Developer': [
    {
      question: 'Can you explain the difference between synchronous and asynchronous programming, and provide a real-world scenario where you would use each?',
      type: 'Technical',
      concepts: ['event loop', 'non-blocking I/O', 'promises', 'async/await', 'API calls', 'blocking threads'],
      hints: 'Think about waiting for an external database response versus performing in-memory arithmetic computations.',
      answer: 'Synchronous programming executes tasks sequentially, where each operation blocks subsequent operations until it finishes. Asynchronous programming allows operations to run in the background without blocking the main execution thread, relying on callbacks, promises, or an event loop. A real-world scenario for async is fetching data from a third-party payment gateway or reading large disk files.',
      followUp: 'How does the runtime handle error handling in asynchronous chains compared to synchronous try-catch blocks?'
    },
    {
      question: 'What are the core principles of Object-Oriented Programming (OOP), and how do you apply Abstraction in your day-to-day software design?',
      type: 'Technical',
      concepts: ['Encapsulation', 'Abstraction', 'Inheritance', 'Polymorphism', 'interfaces', 'information hiding'],
      hints: 'Consider how you hide complex underlying database or network logic behind a simple clean interface.',
      answer: 'The four pillars of OOP are Encapsulation, Abstraction, Inheritance, and Polymorphism. Abstraction is applied by defining interfaces or abstract base classes, hiding concrete database or third-party SDK complexity behind simple public methods.',
      followUp: 'Can you give an example of why composition is often favored over inheritance?'
    },
    {
      question: 'Write a function that takes an array of integers and finds the pair of numbers that adds up to a given target sum in optimal time complexity.',
      type: 'Coding',
      codeStarter: 'def two_sum(nums: list[int], target: int) -> list[int]:\n    # Optimal O(N) solution using a Hash Map\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n',
      concepts: ['Hash Map', 'O(N) time complexity', 'O(N) space complexity', 'one-pass traversal', 'complement check'],
      hints: 'A brute-force solution is O(N^2). Can you use a hash map to store previously seen numbers and their indices in O(N)?',
      answer: 'We iterate through the array once while maintaining a hash map of seen numbers and their indices. For each number, we compute complement = target - num. If complement is in the map, we return the stored index and current index. This achieves O(N) time and O(N) space complexity.',
      followUp: 'How would you solve this if the array was already sorted in ascending order without using extra O(N) space?'
    },
    {
      question: 'Tell me about a time when you faced a tight deadline or high-pressure situation during a project. How did you prioritize tasks and deliver results? (STAR Method)',
      type: 'Behavioral',
      concepts: ['Situation', 'Task', 'Action', 'Result', 'prioritization', 'communication', 'stakeholder management'],
      hints: 'Structure your answer using STAR: Situation, Task, Action, and the quantifiable Result.',
      answer: 'In my final-year project, our backend API crashed three days before client demo due to unexpected rate-limiting issues. I prioritized core authentication and transaction endpoints, implemented in-memory caching to reduce external calls by 70%, and gave daily status updates to stakeholders. The demo ran smoothly and received top marks.',
      followUp: 'If you had had even less time, what feature would you have negotiated to cut first?'
    },
    {
      question: 'A train 150 meters long passes an electric pole in 15 seconds. What is the speed of the train in kilometers per hour?',
      type: 'Aptitude',
      concepts: ['Distance = Speed x Time', 'unit conversion m/s to km/h', 'multiply by 18/5', '36 km/h'],
      hints: 'Speed = Distance / Time gives meters per second. Convert m/s to km/h by multiplying with 18/5 (or 3.6).',
      answer: 'Speed = Distance / Time = 150 meters / 15 seconds = 10 m/s. To convert meters per second to kilometers per hour, multiply by 18/5: 10 * (18/5) = 36 km/h. Therefore, the speed of the train is 36 km/h.',
      followUp: 'If the train now had to cross a 250-meter platform at that same speed, how long would it take?'
    }
  ],
  'Frontend Developer': [
    {
      question: 'Explain the Virtual DOM in modern frontend frameworks like React. How does reconciliation and diffing work to optimize rendering performance?',
      type: 'Technical',
      concepts: ['Virtual DOM', 'Reconciliation algorithm', 'Fiber tree', 'batching updates', 'keys in lists', 'O(N) diffing'],
      hints: 'Contrast direct real DOM manipulations with in-memory tree comparisons.',
      answer: 'The Virtual DOM is an in-memory lightweight JavaScript representation of the actual DOM. When state changes, React creates a new virtual DOM tree, diffs it against the previous tree using an O(N) reconciliation algorithm, calculates minimal updates, and batches these changes into the real DOM.',
      followUp: 'What is the difference between useMemo and useCallback, and when can premature optimization hurt performance?'
    },
    {
      question: 'How do you optimize a web application\'s Core Web Vitals, specifically Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS)?',
      type: 'Technical',
      concepts: ['LCP', 'CLS', 'image optimization', 'code splitting', 'dynamic imports', 'aspect-ratio sizing', 'critical CSS'],
      hints: 'Think about asset preloading, image dimensions, font display swapping, and bundle splitting.',
      answer: 'To improve LCP, optimize critical resource delivery: compress images using modern formats (WebP/AVIF), preload hero images, implement CDN caching, and code-split non-critical scripts. To minimize CLS, always set explicit width and height attributes on images and videos.',
      followUp: 'How does server-side rendering compare to client-side rendering in terms of First Contentful Paint?'
    }
  ],
  'Backend Developer': [
    {
      question: 'How do you design a robust rate-limiting system for a high-traffic microservices API? Which algorithms would you consider?',
      type: 'Technical',
      concepts: ['Token Bucket', 'Leaky Bucket', 'Sliding Window', 'Redis atomic operations', 'HTTP 429'],
      hints: 'Consider token bucket vs sliding window, and how distributed stores like Redis handle race conditions with Lua scripts.',
      answer: 'A robust distributed rate limiter uses Redis with the Token Bucket or Sliding Window Counter algorithm. Redis with atomic Lua scripts prevents race conditions across instances. When limits are exceeded, return HTTP 429 Too Many Requests.',
      followUp: 'How would you handle rate limiting per IP versus per authenticated user?'
    },
    {
      question: 'Explain database indexing internals. What data structures are commonly used (such as B-Trees vs Hash Indexes), and what are the write trade-offs?',
      type: 'Technical',
      concepts: ['B-Tree', 'Hash Index', 'Index scan vs table scan', 'Write penalty', 'storage overhead'],
      hints: 'B-Trees excel at range queries while Hash Indexes excel at exact equality lookups.',
      answer: 'Database indexes speed up data retrieval by creating organized lookup structures. B-Trees keep lookup, insertion, and range queries in O(log N) time with high cache locality. The trade-off is higher write latency on INSERT/UPDATE and extra disk storage.',
      followUp: 'What is a covering index, and how does it prevent table heap lookups?'
    }
  ]
};

export const localEngine = {
  createInterview(config: InterviewConfig): InterviewSession {
    const id = `local-sess-${Date.now()}`;
    const session: InterviewSession = {
      id,
      candidate_name: config.candidateName || 'Candidate',
      interview_type: config.interviewType,
      job_role: config.jobRole,
      experience_level: config.experienceLevel,
      difficulty: config.difficulty,
      duration_minutes: config.durationMinutes,
      language: config.language,
      interview_mode: config.interviewMode,
      enable_hints: config.enableHints,
      enable_coding: config.enableCoding,
      company_preset: config.companyPreset || 'General Enterprise Practice',
      total_questions: config.totalQuestions || 5,
      status: 'in_progress',
      current_question_index: 0,
      proctoring_violations: 0,
      is_terminated: false,
      introduction_message: `Hello ${config.candidateName || 'Candidate'}! Welcome to your mock interview for ${config.jobRole}. I will be your interviewer today. Speak clearly and explain your reasoning. Let's begin!`,
      created_at: new Date().toISOString()
    };

    LOCAL_SESSIONS[id] = {
      config,
      session,
      questions: [],
      answers: {},
      isTerminated: false,
      violations: 0
    };

    return session;
  },

  getNextQuestion(interviewId: string, language: SupportedLanguage = 'English'): QuestionData {
    const sess = LOCAL_SESSIONS[interviewId];
    const role = sess?.config.jobRole || 'Software Developer';
    const totalQ = sess?.config.totalQuestions || 5;
    const currentIdx = sess ? sess.questions.length : 0;

    // Question 0 is always universal opening
    if (currentIdx === 0) {
      const openQ = OPENING_QUESTIONS[language] || OPENING_QUESTIONS.English;
      const q: QuestionData = {
        id: `q-${interviewId}-0`,
        interview_id: interviewId,
        question_index: 0,
        question_text: openQ.question,
        question_type: 'Behavioral',
        language,
        expected_concepts: openQ.concepts,
        hints: openQ.hints,
        is_follow_up: false,
        is_last_question: totalQ <= 1,
        total_questions: totalQ
      };
      sess?.questions.push(q);
      return q;
    }

    // Role-specific pool
    const pool = ROLE_QUESTIONS[role] || ROLE_QUESTIONS['Software Developer'];
    const poolItem = pool[(currentIdx - 1) % pool.length];

    const q: QuestionData = {
      id: `q-${interviewId}-${currentIdx}`,
      interview_id: interviewId,
      question_index: currentIdx,
      question_text: poolItem.question,
      question_type: poolItem.type,
      language,
      expected_concepts: poolItem.concepts,
      hints: poolItem.hints,
      is_follow_up: false,
      code_starter: poolItem.codeStarter,
      is_last_question: currentIdx >= totalQ - 1,
      total_questions: totalQ
    };

    sess?.questions.push(q);
    return q;
  },

  submitAnswer(
    interviewId: string,
    questionId: string,
    transcriptText: string,
    codeText?: string
  ): EvaluationData {
    const sess = LOCAL_SESSIONS[interviewId];
    const currentQ = sess?.questions.find((q) => q.id === questionId);
    const expected = currentQ?.expected_concepts || ['Technical competence', 'Clarity', 'Examples'];

    const words = transcriptText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Concept matching
    const matched = expected.filter((c) =>
      transcriptText.toLowerCase().includes(c.toLowerCase()) ||
      c.toLowerCase().split(' ').some((word) => word.length > 3 && transcriptText.toLowerCase().includes(word))
    );

    const ratio = matched.length / Math.max(1, expected.length);

    // Compute dynamic scores
    const technical = Math.min(95, Math.max(50, 60 + Math.round(ratio * 30) + (codeText ? 5 : 0)));
    const communication = Math.min(95, Math.max(55, 65 + Math.min(25, Math.round(wordCount * 0.3))));
    const problemSolving = Math.min(95, Math.max(55, 60 + Math.round(ratio * 25) + (codeText ? 10 : 0)));
    const relevance = Math.min(95, Math.max(50, 60 + Math.round(ratio * 30)));
    const confidence = Math.min(95, Math.max(55, 65 + Math.min(20, Math.round(wordCount * 0.25))));

    const overall = Math.round((technical * 0.35 + communication * 0.25 + problemSolving * 0.25 + relevance * 0.15) * 10) / 10;

    const strengthsList = [];
    if (matched.length > 0) strengthsList.push(`Accurately addressed key concepts: ${matched.slice(0, 3).join(', ')}`);
    if (wordCount >= 25) strengthsList.push('Provided a well-structured, clear explanation with good pacing');
    if (codeText) strengthsList.push('Supplied a functional code implementation');
    if (strengthsList.length === 0) strengthsList.push('Directly engaged with the prompt and communicated thoughts clearly');

    const missingList = expected.filter((c) => !matched.includes(c));

    const evalData: EvaluationData = {
      id: `eval-${Date.now()}`,
      question_id: questionId,
      overall_score: overall,
      technical_score: technical,
      communication_score: communication,
      problem_solving_score: problemSolving,
      relevance_score: relevance,
      confidence_score: confidence,
      feedback: overall >= 80
        ? 'Excellent response! You demonstrated strong technical depth and structured your explanation effectively.'
        : overall >= 65
        ? 'Good response. You highlighted the core ideas well; consider adding more specific architectural trade-offs.'
        : 'Fair attempt. Try to elaborate on core concepts and support your points with real-world examples.',
      strengths: strengthsList.join('. '),
      areas_for_improvement: missingList.length > 0
        ? `Incorporate depth around: ${missingList.slice(0, 2).join(', ')}`
        : 'Discuss edge cases and operational trade-offs',
      missing_concepts: missingList.slice(0, 3),
      mistakes_identified: wordCount < 10 ? ['Response was very brief'] : [],
      suggested_answer: 'Structure using definition, primary mechanism, production trade-offs, and error handling.',
      next_action: 'next_question'
    };

    if (sess) {
      sess.answers[questionId] = {
        answer: transcriptText,
        code: codeText,
        evaluation: evalData
      };
    }

    return evalData;
  },

  compileReport(interviewId: string, isTerminated: boolean = false, reason?: string, violations: number = 0): ReportData {
    const sess = LOCAL_SESSIONS[interviewId];
    const questions = sess?.questions || [];
    const answers = sess?.answers || {};

    const questionsDetail = questions.map((q) => {
      const ansObj = answers[q.id];
      if (ansObj) {
        return {
          question_index: q.question_index,
          question_text: q.question_text,
          question_type: q.question_type,
          candidate_answer: ansObj.answer || 'Not Answered',
          code_answer: ansObj.code,
          overall_score: ansObj.evaluation.overall_score,
          technical_score: ansObj.evaluation.technical_score,
          communication_score: ansObj.evaluation.communication_score,
          problem_solving_score: ansObj.evaluation.problem_solving_score,
          relevance_score: ansObj.evaluation.relevance_score,
          confidence_score: ansObj.evaluation.confidence_score,
          feedback: ansObj.evaluation.feedback,
          strengths: ansObj.evaluation.strengths,
          areas_for_improvement: ansObj.evaluation.areas_for_improvement,
          missing_concepts: ansObj.evaluation.missing_concepts,
          mistakes_identified: ansObj.evaluation.mistakes_identified,
          suggested_answer: ansObj.evaluation.suggested_answer
        };
      }
      return {
        question_index: q.question_index,
        question_text: q.question_text,
        question_type: q.question_type,
        candidate_answer: 'Not Answered',
        overall_score: 0,
        technical_score: 0,
        communication_score: 0,
        problem_solving_score: 0,
        relevance_score: 0,
        confidence_score: 0,
        feedback: 'Question was not reached or skipped before conclusion.',
        strengths: 'None',
        areas_for_improvement: 'Complete all questions for a comprehensive assessment',
        missing_concepts: q.expected_concepts || [],
        mistakes_identified: ['Skipped'],
        suggested_answer: 'Provide full answers with technical trade-offs.'
      };
    });

    const evaluated = questionsDetail.filter((q) => q.candidate_answer !== 'Not Answered');
    const count = Math.max(1, evaluated.length);

    const overallScore = Math.round(evaluated.reduce((acc, q) => acc + q.overall_score, 0) / count);
    const techScore = Math.round(evaluated.reduce((acc, q) => acc + q.technical_score, 0) / count);
    const commScore = Math.round(evaluated.reduce((acc, q) => acc + q.communication_score, 0) / count);
    const psScore = Math.round(evaluated.reduce((acc, q) => acc + q.problem_solving_score, 0) / count);
    const relScore = Math.round(evaluated.reduce((acc, q) => acc + q.relevance_score, 0) / count);
    const confScore = Math.round(evaluated.reduce((acc, q) => acc + q.confidence_score, 0) / count);

    const rating = overallScore >= 85 ? 'Excellent' : overallScore >= 70 ? 'Good' : overallScore >= 55 ? 'Average' : 'Needs Improvement';

    const report: ReportData = {
      id: `rep-${Date.now()}`,
      interview_id: interviewId,
      candidate_name: sess?.config.candidateName || 'Candidate',
      job_role: sess?.config.jobRole || 'Software Developer',
      interview_type: sess?.config.interviewType || 'Technical Interview',
      difficulty: sess?.config.difficulty || 'Medium',
      language: sess?.config.language || 'English',
      overall_score: overallScore,
      technical_score: techScore,
      communication_score: commScore,
      problem_solving_score: psScore,
      relevance_score: relScore,
      confidence_clarity_score: confScore,
      performance_rating: rating,
      summary: overallScore >= 80
        ? 'Outstanding performance with deep conceptual mastery and clear articulation.'
        : overallScore >= 65
        ? 'Solid performance demonstrating good domain foundations and professional communication.'
        : 'Foundational attempt. Additional practice on architectural trade-offs will elevate readiness.',
      strengths: [
        'Clear problem formulation and proactive communication',
        'Structured thought process and active listening',
        'Familiarity with industry-standard terminology'
      ],
      improvements: [
        'Deepen explanation of edge cases and runtime trade-offs',
        'Use the STAR method for behavioral and scenario questions'
      ],
      missing_concepts: ['Concurrency trade-offs', 'High-scale failure recovery mechanisms'],
      mistakes_identified: isTerminated ? ['Repeated tab switching violations recorded'] : [],
      recommendations: [
        'Practice system design fundamentals and distributed caching patterns',
        'Refine quantitative impact metrics when describing past project results'
      ],
      recommended_topics: ['System Design', 'Concurrency & Asynchronous I/O', 'Database Indexing & MVCC'],
      is_terminated: isTerminated,
      termination_reason: reason,
      proctoring_violations: violations,
      questions_detail: questionsDetail,
      completed_at: new Date().toISOString()
    };

    return report;
  },

  parseResume(resumeText: string): ResumeParseResult {
    const lower = resumeText.toLowerCase();
    const skillsPool = ['React', 'TypeScript', 'JavaScript', 'Python', 'FastAPI', 'Node.js', 'Docker', 'AWS', 'SQL', 'Git', 'Machine Learning'];
    const found = skillsPool.filter((s) => lower.includes(s.toLowerCase()));

    return {
      skills: found.length > 0 ? found : ['Software Engineering', 'Problem Solving', 'Data Structures'],
      experience_years: 'Fresher to 2 Years',
      key_projects: ['Full-Stack Web Development', 'API Design & Integration'],
      suggested_roles: ['Software Developer', 'Frontend Developer', 'Backend Developer'],
      summary: `Detected ${found.length} technical skills matching software engineering profiles.`
    };
  }
};
