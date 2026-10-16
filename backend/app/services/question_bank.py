"""
Comprehensive multilingual question bank for the AI Interview Bot.
Supports: English, Telugu (తెలుగు), Hindi (हिन्दी), Tamil (தமிழ்), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം).
Roles: Software Developer, Frontend Developer, Backend Developer, Full-Stack Developer,
       Graduate Engineer Trainee, AI/ML Engineer, Data Analyst, Python Developer, Java Developer.
Categories: Technical, Coding, Behavioral, HR, Aptitude, System Design.
Features dynamic, non-repeating question selection across sessions.
"""

import hashlib
import random
from typing import Dict, List, Any, Optional

# Introductory greeting per language
INTRODUCTIONS: Dict[str, str] = {
    "English": "Hello! Welcome to your AI mock interview. I will be your interviewer today. We will go through a series of questions tailored to your role. Please speak clearly, take your time, and explain your thought process. Let's begin!",
    "Telugu": "నమస్కారం! మీ AI మాక్ ఇంటర్వ్యూకి స్వాగతం. ఈ రోజు నేను మీ ఇంటర్వ్యూయర్‌గా ఉంటాను. మీ పాత్రకు అనుగుణంగా మేము కొన్ని ప్రశ్నలు అడుగుతాము. ప్రశాంతంగా, స్పష్టంగా సమాధానం ఇవ్వండి. ప్రారంభిద్దాం!",
    "Hindi": "नमस्ते! आपके AI मॉक इंटरव्यू में आपका स्वागत है। आज मैं आपकी इंटरव्यूअर रहूँगी। हम आपकी भूमिका के अनुसार कई प्रश्न पूछेंगे। कृपया स्पष्ट रूप से और सोच-समझकर उत्तर दें। चलिए शुरू करते हैं!",
    "Tamil": "வணக்கம்! உங்கள் AI மாதிரி நேர்காணலுக்கு வரவேற்கிறோம். இன்று நான் உங்கள் நேர்காணலாளராக இருப்பேன். உங்கள் பணிக்கான கேள்விகளை நாங்கள் கேட்போம். நிதானமாக, தெளிவாக பதிலளிக்கவும். ஆரம்பிக்கலாம்!",
    "Kannada": "ನಮಸ್ಕಾರ! ನಿಮ್ಮ AI ಅಣಕು ಸಂದರ್ಶನಕ್ಕೆ ಸುಸ್ವಾಗತ. ಇಂದು ನಾನು ನಿಮ್ಮ ಸಂದರ್ಶಕನಾಗಿರುತ್ತೇನೆ. ನಿಮ್ಮ ಹುದ್ದೆಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಗಳನ್ನು ನಾವು ಕೇಳಲಿದ್ದೇವೆ. ಸ್ಪಷ್ಟವಾಗಿ ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಉತ್ತರಿಸಿ. ಪ್ರಾರಂಭಿಸೋಣ!",
    "Malayalam": "നമസ്കാരം! നിങ്ങളുടെ AI മോക്ക് ഇന്റർവ്യൂവിലേക്ക് സ്വാഗതം. ഇന്ന് ഞാൻ നിങ്ങളുടെ ഇന്റർവ്യൂവർ ആയിരിക്കും. നിങ്ങളുടെ ജോലിക്കനുയോജ്യമായ ചോദ്യങ്ങൾ ഞങ്ങൾ ചോദിക്കും. വ്യക്തമായി മറുപടി നൽകുക. നമുക്ക് ആരംഭിക്കാം!"
}

# Universal Opening Question ("Tell me about yourself") across all supported languages
OPENING_QUESTIONS: Dict[str, Dict[str, Any]] = {
    "English": {
        "question": "Tell me about yourself, your educational background, key technical projects, and what interests you about this role.",
        "type": "Behavioral",
        "expected_concepts": ["Self-introduction", "Educational background", "Key technical skills & projects", "Career aspirations", "Role alignment"],
        "hints": "Structure your answer: 1) Who you are & your educational background, 2) Technical skills and key projects you have built, 3) Why you are passionate about this role.",
        "model_answer": "I am a dedicated software developer with a background in Computer Science. Over the course of my academics and projects, I have worked with modern programming languages, web architectures, and databases. In one of my primary projects, I developed a full-stack application that solved real-time scheduling challenges. I am excited about this role because it directly aligns with my passion for building scalable solutions, solving challenging problems, and continuing to learn within a collaborative engineering culture.",
        "follow_up": "What was the most challenging technical hurdle you solved in one of the projects you mentioned, and what did you learn from it?"
    },
    "Telugu": {
        "question": "మీ గురించి, మీ విద్యా నేపథ్యం, మీరు చేసిన ముఖ్యమైన ప్రాజెక్ట్‌లు మరియు ఈ ఉద్యోగం పట్ల మీ ఆసక్తి గురించి వివరించండి.",
        "type": "Behavioral",
        "expected_concepts": ["స్వీయ పరిచయం", "విద్యా నేపథ్యం", "సాంకేతిక నైపుణ్యాలు", "ప్రాజెక్టులు", "ఉద్యోగ ఆసక్తి"],
        "hints": "మీ పరిచయం, చదువు, మీరు చేసిన ఒక ముఖ్యమైన ప్రాజెక్ట్ మరియు ఈ రోల్‌పై మీ ఆసక్తిని క్రమపద్ధతిలో వివరించండి.",
        "model_answer": "నేను సాఫ్ట్‌వేర్ ఇంజనీరింగ్‌పై ఎంతో ఆసక్తి ఉన్న గ్రాడ్యుయేట్‌ని. నా చదువులో భాగంగా ఆధునిక సాంకేతికతలు, వెబ్ అప్లికేషన్లు మరియు డేటాబేస్‌లతో ప్రాజెక్ట్‌లు నిర్మించాను. ఈ ఉద్యోగం నా నైపుణ్యాలను సద్వినియోగం చేసుకుంటూ సంస్థ ఎదుగుదలలో భాగస్వామి కావడానికి సరైన అవకాశం.",
        "follow_up": "మీరు చేసిన ప్రాజెక్ట్‌లలో మీకు బాగా గుర్తింపు తెచ్చిన అంశం ఏది?"
    },
    "Hindi": {
        "question": "कृपया अपने बारे में बताएं, अपनी शैक्षणिक पृष्ठभूमि, मुख्य प्रोजेक्ट्स और इस पद में आपकी रुचि के बारे में साझा करें।",
        "type": "Behavioral",
        "expected_concepts": ["आत्म-परिचय", "शैक्षणिक पृष्ठभूमि", "तकनीकी कौशल", "प्रोजेक्ट्स", "भूमिका में रुचि"],
        "hints": "अपने संक्षिप्त परिचय, शिक्षा, अपने सबसे महत्वपूर्ण प्रोजेक्ट और इस कंपनी में काम करने की इच्छा को स्पष्ट रूप से समझाएं।",
        "model_answer": "मैं कंप्यूटर साइंस का स्नातक हूँ और मुझे सॉफ्टवेयर डेवलपमेंट में गहरी रुचि है। मैंने विभिन्न तकनीकों का उपयोग करके कई प्रोजेक्ट्स बनाए हैं। मैं इस पद के लिए उत्साहित हूँ क्योंकि यह मेरे कौशल को निखारने और कंपनी के विकास में योगदान देने का सही मंच है।",
        "follow_up": "आपके द्वारा बनाए गए प्रोजेक्ट्स में से कौन सा प्रोजेक्ट सबसे चुनौतीपूर्ण था?"
    },
    "Tamil": {
        "question": "உங்களைப் பற்றி, உங்கள் கல்விப் பின்னணி, முக்கிய திட்டங்கள் மற்றும் இந்த வேலை மீதான உங்கள் ஆர்வம் குறித்து கூறுங்கள்.",
        "type": "Behavioral",
        "expected_concepts": ["சுய அறிமுகம்", "கல்வி", "தொழில்நுட்ப திறன்கள்", "திட்டங்கள்", "வேலை ஆர்வம்"],
        "hints": "உங்கள் கல்வி, நீங்கள் செய்த தொழில்நுட்ப திட்டங்கள் மற்றும் இந்த பணிக்கான உங்கள் விருப்பத்தை தெளிவாக விவரிக்கவும்.",
        "model_answer": "நான் மென்பொருள் உருவாக்கத்தில் ஆர்வமுள்ள ஒரு பட்டதாரி. எனது படிப்பின் போது பல்வேறு செயலிகளை உருவாக்கியுள்ளேன். இந்த வேலை எனது திறமைகளை மேம்படுத்தவும் நிறுவனத்திற்கு உதவவும் ஒரு சிறந்த வாய்ப்பாகும்.",
        "follow_up": "நீங்கள் செய்த திட்டங்களில் உங்களுக்கு மிகவும் பிடித்த திட்டம் எது?"
    },
    "Kannada": {
        "question": "ನಿಮ್ಮ ಬಗ್ಗೆ, ನಿಮ್ಮ ಶೈಕ್ಷಣಿಕ ಹಿನ್ನೆಲೆ, ಪ್ರಮುಖ ಯೋಜನೆಗಳು ಮತ್ತು ಈ ಹುದ್ದೆಯ ಬಗ್ಗೆ ನಿಮ್ಮ ಆಸಕ್ತಿಯನ್ನು ವಿವರಿಸಿ.",
        "type": "Behavioral",
        "expected_concepts": ["ಸ್ವಯಂ ಪರಿಚಯ", "ಶಿಕ್ಷಣ", "ತಾಂತ್ರಿಕ ಕೌಶಲ್ಯಗಳು", "ಯೋಜನೆಗಳು", "ಉದ್ಯೋಗ ಆಸಕ್ತಿ"],
        "hints": "ನಿಮ್ಮ ಶಿಕ್ಷಣ, ಮಾಡಿದ ಯೋಜನೆಗಳು ಮತ್ತು ಈ ಕೆಲಸದಲ್ಲಿ ನಿಮ್ಮ ಆಸಕ್ತಿಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ತಿಳಿಸಿ.",
        "model_answer": "ನಾನು ಸಾಫ್ಟ್‌ವೇರ್ ಅಭಿವೃದ್ಧಿಯಲ್ಲಿ ಆಸಕ್ತಿ ಹೊಂದಿರುವ ಪದವೀಧರ. ನನ್ನ ವಿದ್ಯಾಭ್ಯಾಸದ ಅವಧಿಯಲ್ಲಿ ನಾನು ಪ್ರಮುಖ ಪ್ರಾಜೆಕ್ಟ್‌ಗಳನ್ನು ನಿರ್ಮಿಸಿದ್ದೇನೆ. ಈ ಹುದ್ದೆಯು ನನ್ನ ಸಾಮರ್ಥ್ಯವನ್ನು ಪ್ರದರ್ಶಿಸಲು ಉತ್ತಮ ಅವಕಾಶವಾಗಿದೆ.",
        "follow_up": "ನಿಮ್ಮ ಯೋಜನೆಗಳಲ್ಲಿ ನೀವು ಎದುರಿಸಿದ ಅತಿ ದೊಡ್ಡ ಸವಾಲು ಯಾವುದು?"
    },
    "Malayalam": {
        "question": "നിങ്ങളെക്കുറിച്ച്, നിങ്ങളുടെ പഠന പശ്ചാത്തലം, പ്രധാന പ്രോജക്ടുകൾ, ഈ ജോലിയോടുള്ള താല്പര്യം എന്നിവയെക്കുറിച്ച് പറയുക.",
        "type": "Behavioral",
        "expected_concepts": ["സ്വയം പരിചയപ്പെടുത്തൽ", "വിദ്യാഭ്യാസം", "പ്രോജക്റ്റുകൾ", "കഴിവുകൾ", "താല്പര്യം"],
        "hints": "നിങ്ങളുടെ പഠനം, ചെയ്ത പ്രോജക്റ്റുകൾ, ഈ ജോലി തിരഞ്ഞെടുക്കാനുള്ള കാരണം എന്നിവ വ്യക്തമാക്കുക.",
        "model_answer": "ഞാൻ സോഫ്റ്റ്‌വെയർ ഡെവലപ്‌മെന്റിൽ താല്പര്യമുള്ള ഒരു ബിരുദധാരിയാണ്. പഠനകാലത്ത് ഞാൻ വിവിധ വെബ് പ്രോജക്റ്റുകൾ ചെയ്തിട്ടുണ്ട്. ഈ ജോലി എന്റെ കഴിവുകൾ തെളിയിക്കാൻ മികച്ച അവസരമാണ്.",
        "follow_up": "നിങ്ങൾ ചെയ്തതിൽ ഏറ്റവും അഭിമാനം തോന്നിയ പ്രോജക്റ്റ് ഏതാണ്?"
    }
}

# Rich Question Bank
QUESTION_BANK: Dict[str, Dict[str, List[Dict[str, Any]]]] = {
    "English": {
        "Software Developer": [
            {
                "id": "sd_sync_async",
                "question": "Can you explain the difference between synchronous and asynchronous programming, and provide a real-world scenario where you would use each?",
                "type": "Technical",
                "expected_concepts": ["event loop", "non-blocking I/O", "promises/async-await", "blocking threads", "API calls", "file operations"],
                "hints": "Think about waiting for an external database response versus performing in-memory arithmetic computations.",
                "model_answer": "Synchronous programming executes tasks sequentially, where each operation blocks subsequent operations until it finishes. Asynchronous programming allows operations to run in the background without blocking the main execution thread, relying on callbacks, promises, or an event loop. A real-world scenario for async is fetching data from a third-party payment gateway or reading large disk files. Synchronous execution is suitable for CPU-bound computations like matrix multiplication where step 2 strictly requires step 1.",
                "follow_up": "How does the runtime handle error handling in asynchronous chains compared to synchronous try-catch blocks?"
            },
            {
                "id": "sd_oop_principles",
                "question": "What are the core principles of Object-Oriented Programming (OOP), and how do you apply Abstraction in your day-to-day software design?",
                "type": "Technical",
                "expected_concepts": ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism", "interfaces/abstract classes", "information hiding"],
                "hints": "Consider how you hide complex underlying database or network logic behind a simple clean interface.",
                "model_answer": "The four pillars of OOP are Encapsulation (bundling data and methods), Abstraction (hiding implementation complexity and showing only essential features), Inheritance (reusing common functionality across hierarchies), and Polymorphism (allowing one interface with multiple implementations). In daily software design, abstraction is applied by defining interfaces or abstract base classes, such as a PaymentProcessor interface with a processPayment() method, hiding whether Stripe, PayPal, or Razorpay is executing underneath.",
                "follow_up": "Can you give an example of how excessive inheritance can lead to tight coupling, and why composition is often favored over inheritance?"
            },
            {
                "id": "sd_two_sum",
                "question": "Write a function that takes an array of integers and finds the pair of numbers that adds up to a given target sum in optimal time complexity.",
                "type": "Coding",
                "code_starter": "def two_sum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass\n",
                "test_cases": [
                    {"input": "nums = [2, 7, 11, 15], target = 9", "expected": "[0, 1]"},
                    {"input": "nums = [3, 2, 4], target = 6", "expected": "[1, 2]"},
                    {"input": "nums = [3, 3], target = 6", "expected": "[0, 1]"}
                ],
                "expected_concepts": ["Hash Map", "O(N) time complexity", "O(N) space complexity", "one-pass traversal", "complement check"],
                "hints": "A brute-force solution is O(N^2). Can you use a hash map to store previously seen numbers and their indices in O(N)?",
                "model_answer": "We iterate through the array once while maintaining a hash map of seen numbers and their indices. For each number, we compute complement = target - num. If complement is in the map, we return [map[complement], current_index]. Otherwise, we add num to the map. This achieves O(N) time and O(N) space complexity.",
                "follow_up": "How would you solve this if the array was already sorted in ascending order without using extra O(N) space?"
            },
            {
                "id": "sd_microservices_monolith",
                "question": "Compare monolithic architecture with microservices. What are the key operational challenges when migrating a monolith to microservices?",
                "type": "Technical",
                "expected_concepts": ["Service boundaries", "Distributed data management", "Saga pattern", "network latency", "observability", "CI/CD complexity"],
                "hints": "Consider how transactions spanning multiple independent databases are coordinated.",
                "model_answer": "A monolith bundles all modules into a single deployment unit, making it straightforward to develop, debug, and maintain ACID transactions initially. Microservices decouple business domains into independently deployable services communicating via REST, gRPC, or messaging. Key migration challenges include distributed transactions (requiring the Saga pattern or 2PC), increased network latency, complex inter-service security, distributed tracing, and organizational CI/CD overhead.",
                "follow_up": "How do you maintain eventual consistency when a business transaction fails halfway through multiple microservices?"
            },
            {
                "id": "sd_acid_isolation",
                "question": "What are the ACID properties in database management systems, and what are the trade-offs between Read Committed and Serializable isolation levels?",
                "type": "Technical",
                "expected_concepts": ["Atomicity", "Consistency", "Isolation", "Durability", "Dirty read", "Non-repeatable read", "Phantom read", "Locking vs MVCC"],
                "hints": "Serializable prevents phantom reads but drastically reduces write throughput due to lock contention.",
                "model_answer": "ACID stands for Atomicity (all or nothing), Consistency (valid state transitions), Isolation (concurrent transactions execute without interference), and Durability (committed changes persist across crashes). In Read Committed, transactions only read committed data, preventing dirty reads but permitting non-repeatable and phantom reads. Serializable ensures complete isolation equivalent to serial execution, completely preventing anomalies but suffering substantial concurrency bottlenecks and higher deadlock risk.",
                "follow_up": "How does Multi-Version Concurrency Control (MVCC) allow non-blocking reads while writes are occurring?"
            },
            {
                "id": "sd_caching_strategies",
                "question": "Explain Cache-Aside, Write-Through, and Write-Back caching strategies. How do you handle cache invalidation and the thundering herd problem?",
                "type": "Technical",
                "expected_concepts": ["Cache-Aside (Lazy loading)", "Write-Through", "Write-Back", "Cache invalidation (TTL)", "Cache stampede / Thundering herd", "Mutex locking"],
                "hints": "In Cache-Aside, the application queries cache first; on miss, it fetches from DB and populates cache.",
                "model_answer": "In Cache-Aside, the application code reads from cache; if missing, reads from DB and populates the cache. In Write-Through, data is written to cache and DB synchronously. In Write-Back, data is written to cache first and asynchronously flushed to DB. To prevent the thundering herd problem (where many concurrent requests hit DB when a hot key expires), use probabilistic early expiration (XFetch), mutex locks on cache misses, or background pre-warming.",
                "follow_up": "What is the difference between cache penetration and cache breakdown?"
            },
            {
                "id": "sd_valid_parentheses",
                "question": "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', write a program to determine if the input string is valid.",
                "type": "Coding",
                "code_starter": "def is_valid(s: str) -> bool:\n    # Return True if valid, False otherwise\n    pass\n",
                "test_cases": [
                    {"input": "s = '()[]{}'", "expected": "True"},
                    {"input": "s = '(]'", "expected": "False"},
                    {"input": "s = '([)]'", "expected": "False"}
                ],
                "expected_concepts": ["Stack data structure", "LIFO", "O(N) time", "O(N) space", "hash map for closing brackets"],
                "hints": "Push opening brackets onto a stack. When encountering a closing bracket, pop the top and check for a match.",
                "model_answer": "We use a stack. For each character, if it is an opening bracket, we push it onto the stack. If it is a closing bracket, we check if the stack is non-empty and whether the popped element matches the expected opening partner. At the end, the string is valid if and only if the stack is empty. Time complexity is O(N) and space complexity is O(N).",
                "follow_up": "How would you handle this if memory was severely constrained and brackets could not be stored in RAM?"
            },
            {
                "id": "sd_rest_grpc",
                "question": "When would you choose gRPC over traditional RESTful JSON APIs for backend inter-service communication?",
                "type": "Technical",
                "expected_concepts": ["Protocol Buffers (Protobuf)", "HTTP/2 binary transport", "multiplexing", "bidirectional streaming", "strict schema contract", "browser compatibility"],
                "hints": "Consider payload serialization overhead and connection multiplexing in high-throughput internal microservices.",
                "model_answer": "gRPC uses Protocol Buffers and HTTP/2, offering binary serialization, header compression, and multiplexed bidirectional streaming. This yields significantly higher throughput, lower latency, and strong type safety compared to REST/JSON. Choose gRPC for high-performance internal microservice communication. REST remains preferred for public customer-facing APIs where human readability and broad client/browser support are paramount.",
                "follow_up": "Why is gRPC difficult to consume directly from a standard web browser without a proxy?"
            },
            {
                "id": "sd_star_behavioral",
                "question": "Tell me about a time when you faced a tight deadline or high-pressure situation during a project. How did you prioritize tasks and deliver results? (STAR Method)",
                "type": "Behavioral",
                "expected_concepts": ["Situation", "Task", "Action", "Result", "prioritization", "communication", "stakeholder management"],
                "hints": "Structure your answer using STAR: Situation, Task, Action, and the quantifiable Result.",
                "model_answer": "In my final-year capstone project, our backend service crashed three days before client demo due to unexpected rate-limiting issues. As the lead developer, my task was to stabilize the API and ensure demo readiness. I prioritized core user authentication and transaction endpoints, implemented in-memory caching with Redis to reduce external calls by 70%, and communicated daily status updates with our faculty advisor. As a result, the demo executed flawlessly, and our team received the top grade in the cohort.",
                "follow_up": "If you had had even less time, what feature would you have negotiated to cut first?"
            },
            {
                "id": "sd_aptitude_train",
                "question": "A train 150 meters long passes an electric pole in 15 seconds. What is the speed of the train in kilometers per hour?",
                "type": "Aptitude",
                "expected_concepts": ["Distance = Speed x Time", "unit conversion m/s to km/h", "multiply by 18/5", "36 km/h"],
                "hints": "Speed = Distance / Time gives meters per second. Convert m/s to km/h by multiplying with 18/5 (or 3.6).",
                "model_answer": "Speed = Distance / Time = 150 meters / 15 seconds = 10 m/s. To convert meters per second to kilometers per hour, multiply by 18/5: 10 * (18/5) = 36 km/h. Therefore, the speed of the train is 36 km/h.",
                "follow_up": "If the train now had to cross a 250-meter platform at that same speed, how long would it take?"
            },
            {
                "id": "sd_sliding_window",
                "question": "Write an algorithm to find the length of the longest substring without repeating characters in a given string.",
                "type": "Coding",
                "code_starter": "def length_of_longest_substring(s: str) -> int:\n    # Return the maximum length\n    pass\n",
                "test_cases": [
                    {"input": "s = 'abcabcbb'", "expected": "3"},
                    {"input": "s = 'bbbbb'", "expected": "1"},
                    {"input": "s = 'pwwkew'", "expected": "3"}
                ],
                "expected_concepts": ["Sliding window", "Two pointers", "Hash map / Set", "O(N) time complexity", "O(min(N, M)) space"],
                "hints": "Maintain a sliding window [left, right] and a set of characters currently in the window. Expand right, and shrink left when duplicates appear.",
                "model_answer": "We maintain a sliding window using two pointers (left and right) and a hash map storing the latest index of each seen character. As right advances, if s[right] is already in the map and within the current window, we update left = max(left, map[s[right]] + 1). The maximum window length right - left + 1 tracked across the traversal gives the answer in O(N) time.",
                "follow_up": "How does the space complexity change if the character set is restricted to standard ASCII versus full Unicode UTF-8?"
            },
            {
                "id": "sd_ci_cd",
                "question": "What are the essential stages in an automated CI/CD pipeline, and how do you ensure zero-downtime deployments?",
                "type": "Technical",
                "expected_concepts": ["Linting & static analysis", "Unit & Integration tests", "Docker build & push", "Blue-Green deployment / Canary deployment", "health checks", "rollback triggers"],
                "hints": "Think about how Blue-Green routing switches traffic only after the new environment passes health checks.",
                "model_answer": "A robust CI/CD pipeline consists of: 1) Linting and static security scanning, 2) Unit and automated integration tests, 3) Container artifact packaging and vulnerability scanning, 4) Staging deployment with end-to-end smoke tests, 5) Production release using Blue-Green or Canary deployments. Zero-downtime is achieved by keeping old instances alive until new instances pass health checks, then atomically switching load balancer traffic.",
                "follow_up": "How do you handle backward-incompatible database schema migrations during a rolling release?"
            }
        ],
        "Frontend Developer": [
            {
                "id": "fe_vdom",
                "question": "Explain the Virtual DOM in modern frontend frameworks like React. How does reconciliation and diffing work to optimize rendering performance?",
                "type": "Technical",
                "expected_concepts": ["Virtual DOM", "Reconciliation algorithm", "Fiber tree", "batching updates", "keys in lists", "O(N) diffing"],
                "hints": "Contrast direct real DOM manipulations with in-memory tree comparisons.",
                "model_answer": "The Virtual DOM is an in-memory lightweight JavaScript representation of the actual DOM. When state changes, React creates a new virtual DOM tree, diffs it against the previous tree using a heuristic O(N) reconciliation algorithm, calculates minimal updates, and batches these changes into the real DOM. Providing stable keys helps React track identity across re-renders.",
                "follow_up": "What is the difference between useMemo and useCallback, and when can premature optimization hurt performance?"
            },
            {
                "id": "fe_web_vitals",
                "question": "How do you optimize a web application's Core Web Vitals, specifically Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS)?",
                "type": "Technical",
                "expected_concepts": ["LCP", "CLS", "image optimization", "code splitting", "dynamic imports", "aspect-ratio sizing", "critical CSS"],
                "hints": "Think about asset preloading, image dimensions, font display swapping, and bundle splitting.",
                "model_answer": "To improve LCP, optimize critical resource delivery: compress images using modern formats (WebP/AVIF), preload hero images, implement CDN caching, and code-split non-critical scripts. To minimize CLS, always set explicit width and height attributes on images/videos, avoid inserting dynamic content above existing content, and reserve space for ads or banners using CSS aspect-ratio.",
                "follow_up": "How does server-side rendering (SSR) or streaming SSR compare to client-side rendering (CSR) in terms of First Contentful Paint?"
            },
            {
                "id": "fe_state_mgmt",
                "question": "When building a complex frontend application, how do you decide between local state, React Context, and a centralized store like Redux Toolkit or Zustand?",
                "type": "Technical",
                "expected_concepts": ["Prop drilling", "Re-render optimization", "Selector subscriptions", "Server state vs Client state", "Context re-render caveat", "Zustand / Redux Toolkit"],
                "hints": "Context triggers re-renders on all consuming components when value changes unless split carefully.",
                "model_answer": "Use local state (useState/useReducer) for UI state localized to a component. Use React Context for infrequently changing global configuration like theme or user locale. For frequently updated state or complex domain workflows shared across distant components, use a dedicated store like Zustand or Redux Toolkit, which support fine-grained selector subscriptions to prevent unnecessary re-renders. Furthermore, use libraries like TanStack Query for server cache state.",
                "follow_up": "Why should server cache state be separated from global UI client state?"
            },
            {
                "id": "fe_debounce",
                "question": "Write a debounce function in JavaScript/TypeScript that delays executing a callback until after a specified wait time has elapsed since the last call.",
                "type": "Coding",
                "code_starter": "function debounce(fn, delay) {\n  // Write your debounce implementation\n}\n",
                "test_cases": [
                    {"input": "call twice within 100ms with delay 200ms", "expected": "executes once after 200ms"}
                ],
                "expected_concepts": ["Closures", "setTimeout", "clearTimeout", "preservation of this and arguments", "O(1) time"],
                "hints": "Clear the existing timeout reference whenever the wrapper function is triggered, then set a new timeout.",
                "model_answer": "We return a closure holding a timer variable. Each time the returned function is called, we call clearTimeout(timer). Then timer = setTimeout(() => fn.apply(this, args), delay). This ensures the wrapped function only executes when the specified delay has passed without any new invocations.",
                "follow_up": "How does throttling differ from debouncing, and what is a typical use case for each?"
            },
            {
                "id": "fe_security",
                "question": "What are Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) attacks, and how do modern frontend and backend architectures defend against them?",
                "type": "Technical",
                "expected_concepts": ["Stored XSS vs Reflected XSS", "DOM-based XSS", "Content Security Policy (CSP)", "HTML escaping / React JSX auto-escaping", "SameSite cookies", "Anti-CSRF tokens"],
                "hints": "React escapes JSX strings by default, but dangerouslySetInnerHTML bypasses it.",
                "model_answer": "XSS occurs when malicious scripts are injected into web pages viewed by other users. Defenses include context-aware output encoding (React does this automatically for JSX expressions), avoiding dangerouslySetInnerHTML, and enforcing a strict Content Security Policy (CSP). CSRF tricks a victim's authenticated browser into executing unwanted actions. Defenses include SameSite=Strict/Lax cookie attributes, custom request headers (Authorization: Bearer), and anti-CSRF challenge tokens.",
                "follow_up": "Why does storing JWT tokens in localStorage leave an application vulnerable to XSS compared to httpOnly cookies?"
            }
        ],
        "Backend Developer": [
            {
                "id": "be_rate_limiting",
                "question": "How do you design a robust rate-limiting system for a high-traffic microservices API? Which algorithms would you consider?",
                "type": "Technical",
                "expected_concepts": ["Token Bucket", "Leaky Bucket", "Fixed Window Counter", "Sliding Window Log", "Redis atomic operations", "HTTP 429"],
                "hints": "Consider token bucket vs sliding window, and how distributed stores like Redis handle race conditions with Lua scripts.",
                "model_answer": "A robust distributed rate limiter often uses Redis with the Token Bucket or Sliding Window Counter algorithm. With Token Bucket, tokens accumulate at a constant rate up to capacity; each request consumes a token. In distributed environments, Redis with atomic Lua scripts or Redis cell modules prevents race conditions across instances. When limits are exceeded, return HTTP 429 Too Many Requests with a Retry-After header.",
                "follow_up": "How would you handle rate limiting per IP versus per authenticated user, especially when users are behind NAT gateways?"
            },
            {
                "id": "be_indexing",
                "question": "Explain database indexing. What data structures are commonly used (such as B-Trees vs Hash Indexes), and what are the trade-offs of adding too many indexes?",
                "type": "Technical",
                "expected_concepts": ["B-Tree / B+Tree", "Hash Index", "Index scan vs table scan", "Write penalty", "disk storage overhead", "composite indexes"],
                "hints": "B-Trees excel at range queries while Hash Indexes excel at exact equality lookups.",
                "model_answer": "Database indexes speed up data retrieval by creating organized lookup structures. B-Trees and B+Trees are most common because their balanced, multi-way branch structure keeps lookup, insertion, and range queries in O(log N) time with high cache locality. Hash indexes offer O(1) equality lookups but cannot do range scans. The trade-off of excessive indexes is increased write latency on INSERT/UPDATE/DELETE and higher storage consumption.",
                "follow_up": "What is a covering index, and how does it prevent table heap lookups?"
            },
            {
                "id": "be_cap_theorem",
                "question": "Explain the CAP theorem. When a network partition occurs in a distributed system, how do CP systems behave compared to AP systems?",
                "type": "Technical",
                "expected_concepts": ["Consistency", "Availability", "Partition Tolerance", "Network split", "CP (HBase, Zookeeper)", "AP (Cassandra, DynamoDB)", "PACELC"],
                "hints": "Since network partitions are inevitable in real-world distributed networks, you must choose between Consistency and Availability during a split.",
                "model_answer": "The CAP theorem states that a distributed data store can simultaneously guarantee at most two out of Consistency, Availability, and Partition Tolerance. Since network partitions (P) are unavoidable in distributed physical infrastructure, systems must choose between Consistency (CP) and Availability (AP) during a partition. CP systems (like Zookeeper) reject requests or return errors to preserve strict consistency, whereas AP systems (like Cassandra) accept writes and reads on available nodes, accepting temporary divergence and resolving consistency eventually.",
                "follow_up": "What does PACELC theorem add to the traditional CAP theorem?"
            },
            {
                "id": "be_kafka_rabbitmq",
                "question": "What are the fundamental architectural differences between Apache Kafka and RabbitMQ? When would you select one over the other?",
                "type": "Technical",
                "expected_concepts": ["Smart broker vs Dumb broker", "Log-based append-only vs Message queue", "Consumer pull vs Push", "Message retention / replay", "Throughput vs Complex routing"],
                "hints": "RabbitMQ deletes messages once acknowledged; Kafka retains them in an immutable log by offset.",
                "model_answer": "RabbitMQ is a traditional message broker focusing on flexible routing (exchanges, topics), AMQP protocol, and transient message delivery where messages are acknowledged and deleted. Kafka is a distributed, append-only commit log designed for high-throughput event streaming. In Kafka, consumers pull messages and manage their own offsets, allowing historical replay. Choose RabbitMQ for complex routing and task queues; choose Kafka for massive event streaming, audit logs, and analytics pipelines.",
                "follow_up": "How does Kafka ensure partition ordering when messages have defined partition keys?"
            },
            {
                "id": "be_tinyurl",
                "question": "Design a high-scale URL shortening service like TinyURL. How do you generate unique short keys and handle 100 million daily redirects?",
                "type": "Technical",
                "expected_concepts": ["Base62 encoding", "MD5/SHA256 vs Distributed ID generator (Snowflake)", "Database choice (Key-Value store / NoSQL)", "Redis caching", "Collision handling", "301 vs 302 HTTP redirect"],
                "hints": "7 characters in Base62 provides 62^7 = 3.5 trillion unique URLs.",
                "model_answer": "We map a 64-bit integer generated by a distributed ID generator (e.g., Twitter Snowflake) to a 7-character string using Base62 encoding (a-z, A-Z, 0-9). The service stores the mapping (short_key -> original_url) in a high-throughput NoSQL key-value store like DynamoDB or Cassandra. To handle 100M daily redirects, front the database with a distributed Redis cache holding the most frequent 20% of URLs. Return HTTP 302 redirect to track analytics or 301 for browser caching.",
                "follow_up": "What are the trade-offs between HTTP 301 Permanent Redirect and HTTP 302 Temporary Redirect for click analytics?"
            }
        ],
        "Full-Stack Developer": [
            {
                "id": "fs_request_lifecycle",
                "question": "Walk me through the complete lifecycle of a web request from the moment a user enters a URL in their browser until the page is fully rendered.",
                "type": "Technical",
                "expected_concepts": ["DNS resolution", "TCP 3-way handshake", "TLS negotiation", "HTTP request", "Load balancer / Reverse proxy", "Backend application handling", "Database query", "DOM/CSSOM rendering"],
                "hints": "Cover DNS, TCP/TLS, reverse proxies, server processing, and client browser layout/paint.",
                "model_answer": "1) Browser checks DNS cache, then queries recursive DNS servers to resolve the domain to an IP. 2) Browser initiates TCP 3-way handshake (SYN, SYN-ACK, ACK) and TLS 1.3 cryptographic handshake. 3) Browser sends HTTP GET request. 4) Request hits reverse proxy/CDN, is forwarded to application server. 5) Server parses request, validates authentication tokens, queries database, renders response or JSON. 6) Browser receives HTML, parses DOM and CSSOM, constructs render tree, calculates layout, and paints pixels.",
                "follow_up": "How does HTTP/2 multiplexing improve connection reuse compared to HTTP/1.1 pipelining?"
            },
            {
                "id": "fs_realtime",
                "question": "When designing real-time features like live chat or stock price tickers, how do you choose between WebSockets, Server-Sent Events (SSE), and Long Polling?",
                "type": "Technical",
                "expected_concepts": ["Full-duplex vs Half-duplex", "SSE unidirectional stream", "HTTP connection overhead", "reconnection handling", "browser support", "firewall friendliness"],
                "hints": "WebSockets are bidirectional; SSE is server-to-client only over standard HTTP.",
                "model_answer": "WebSockets establish a persistent, full-duplex TCP connection over a single socket, ideal for interactive bidirectional communication like multiplayer gaming or chat. Server-Sent Events (SSE) provide unidirectional server-to-client streaming over standard HTTP with automatic reconnection and event IDs, making it simpler and more firewall-friendly for notifications or stock tickers. Long Polling is a legacy fallback with significant HTTP header overhead.",
                "follow_up": "How do you scale WebSocket connections across multiple load-balanced backend server instances?"
            },
            {
                "id": "fs_oauth",
                "question": "Explain the OAuth 2.0 Authorization Code flow with PKCE (Proof Key for Code Exchange). Why is PKCE critical for single-page applications (SPAs)?",
                "type": "Technical",
                "expected_concepts": ["Authorization Code", "Code Verifier & Code Challenge", "Client Secret vulnerability in SPAs", "Token endpoint", "Access Token & Refresh Token"],
                "hints": "SPAs cannot securely store a static client secret because JavaScript source code is public.",
                "model_answer": "In OAuth 2.0 Authorization Code flow with PKCE, the client generates a cryptographic code_verifier and derives a code_challenge. When redirecting the user to the authorization server, it passes the code_challenge. After user consent, the server returns an authorization code. The client exchanges this code along with the original code_verifier for access and refresh tokens. PKCE prevents authorization code interception attacks, making it secure for public clients like SPAs that cannot keep a client secret confidential.",
                "follow_up": "How should refresh tokens be rotated to prevent reuse if a token is intercepted?"
            }
        ],
        "Graduate Engineer Trainee": [
            {
                "id": "get_motivation",
                "question": "Why are you interested in joining our Graduate Engineer Trainee program, and how have your academic projects prepared you for enterprise software engineering?",
                "type": "HR",
                "expected_concepts": ["Career growth", "learning agility", "enterprise culture", "foundations in CS", "collaboration", "adaptability"],
                "hints": "Highlight your strong fundamentals, willingness to learn new technologies, and practical teamwork in college projects.",
                "model_answer": "I am passionate about building enterprise-grade scalable systems. The GET program provides the ideal blend of rigorous mentorship, cross-domain training, and live client exposure. My academic projects taught me version control with Git, database modeling, and agile team collaboration, preparing me to transition quickly into productive delivery.",
                "follow_up": "Which tech stack or engineering domain are you most eager to specialize in during your initial rotation?"
            },
            {
                "id": "get_sql_nosql",
                "question": "Explain the difference between SQL and NoSQL databases. When would you choose MongoDB over PostgreSQL?",
                "type": "Technical",
                "expected_concepts": ["Relational vs Document", "ACID vs BASE", "structured vs unstructured schema", "vertical vs horizontal scaling", "joins"],
                "hints": "Think about rigid tabular relations with ACID guarantees versus flexible schema with high write throughput.",
                "model_answer": "SQL databases are relational, table-based, enforce strict schemas, and provide ACID guarantees, making them ideal for complex queries and transactional systems like banking. NoSQL databases like MongoDB are non-relational document stores with flexible schemas and easy horizontal scaling. You would choose MongoDB when dealing with rapidly evolving unstructured schemas, catalog data, or high-velocity event logs.",
                "follow_up": "What happens to data consistency in a distributed NoSQL database during network partitions according to the CAP theorem?"
            },
            {
                "id": "get_reverse_linked_list",
                "question": "Write a program to reverse a singly linked list in-place.",
                "type": "Coding",
                "code_starter": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head: ListNode) -> ListNode:\n    # In-place reversal\n    pass\n",
                "test_cases": [
                    {"input": "head = [1, 2, 3, 4, 5]", "expected": "[5, 4, 3, 2, 1]"},
                    {"input": "head = [1, 2]", "expected": "[2, 1]"},
                    {"input": "head = []", "expected": "[]"}
                ],
                "expected_concepts": ["Three pointers", "prev, current, next_node", "O(N) time", "O(1) space", "pointer manipulation"],
                "hints": "Track three pointers: prev (initially None), curr (initially head), and next_temp.",
                "model_answer": "We maintain prev = None and curr = head. Inside a while curr loop, save next_node = curr.next, reverse the link curr.next = prev, move prev = curr, and curr = next_node. When curr is None, prev is the new head. This operates in O(N) time and O(1) space.",
                "follow_up": "Can this also be implemented recursively, and what would be the space complexity implications on the call stack?"
            },
            {
                "id": "get_process_thread",
                "question": "What is the difference between a Process and a Thread in operating systems? How do they share system resources?",
                "type": "Technical",
                "expected_concepts": ["Separate address space vs shared memory", "Context switching overhead", "Inter-Process Communication (IPC)", "Stack vs Heap sharing", "Thread safety"],
                "hints": "A process has its own isolated memory space, while threads within the same process share heap memory.",
                "model_answer": "A process is an executing program instance with its own isolated virtual memory address space, file descriptors, and security context. A thread is the smallest unit of CPU execution within a process. Threads within the same process share code, data, and heap memory, but maintain independent stacks and register states. Context switching between threads is faster than between processes, but thread concurrency requires synchronization to prevent race conditions.",
                "follow_up": "What is a deadlock, and what are the four Coffman conditions required for a deadlock to occur?"
            },
            {
                "id": "get_senior_dispute",
                "question": "If you find that a senior team member has committed code that contains a critical bug or security flaw, how would you approach the situation?",
                "type": "Behavioral",
                "expected_concepts": ["Diplomacy", "focus on code not person", "private communication", "providing test case proof", "collaborative resolution"],
                "hints": "Focus on maintaining respect and empathy while ensuring the codebase and customer data remain secure.",
                "model_answer": "I would verify the bug by writing a small reproducing test case first. Then, I would reach out to the senior engineer privately in a respectful, collaborative tone, saying something like 'I was reviewing this workflow and noticed this edge case in the test suite; could you help me check if this could cause an issue?' This focuses on the code rather than assigning blame, protects team morale, and resolves the issue quickly before production impact.",
                "follow_up": "What if the senior colleague disagrees and insists on pushing it anyway?"
            }
        ],
        "AI/ML Engineer": [
            {
                "id": "ai_vanishing_gradient",
                "question": "Can you explain the vanishing and exploding gradient problem in deep neural networks, and how modern architectures mitigate it?",
                "type": "Technical",
                "expected_concepts": ["Chain rule of backpropagation", "sigmoid/tanh saturation", "ReLU / GELU", "Residual connections (ResNet)", "Batch/Layer Normalization", "gradient clipping"],
                "hints": "Think about repeated matrix multiplications through deep layers and derivative values less than 1.",
                "model_answer": "During backpropagation, gradients are propagated backward using the chain rule. If derivative values are small (like in saturated regions of sigmoid/tanh), multiplying them across many layers causes gradients to shrink exponentially toward zero, preventing earlier layers from learning. Conversely, large weights cause exploding gradients. Solutions include non-saturating activation functions (ReLU, GELU), residual connections (skip connections in ResNets), Layer/Batch Normalization, weight initialization techniques (He, Xavier), and gradient clipping.",
                "follow_up": "How does Layer Normalization in Transformer self-attention blocks differ from Batch Normalization in CNNs?"
            },
            {
                "id": "ai_data_drift",
                "question": "How do you detect and address data drift and concept drift in a deployed production machine learning model?",
                "type": "Technical",
                "expected_concepts": ["Data drift vs Concept drift", "KS-test / PSI (Population Stability Index)", "feature distribution shifts", "continuous retraining", "shadow deployment", "monitoring pipelines"],
                "hints": "Data drift is P(X) changing; concept drift is P(Y|X) changing.",
                "model_answer": "Data drift occurs when input feature distributions P(X) change over time, whereas concept drift occurs when the statistical relationship between inputs and targets P(Y|X) changes. Detection is done using statistical tests like Kolmogorov-Smirnov test, Population Stability Index (PSI), or Kullback-Leibler divergence on incoming inference batches compared to baseline training distributions. Mitigation involves automated alerting, shadow deployment, curated continuous retraining pipelines, and human-in-the-loop validation.",
                "follow_up": "What metrics would you monitor in real-time when deploying an LLM-based RAG application?"
            },
            {
                "id": "ai_rag_system",
                "question": "How do you design a Retrieval-Augmented Generation (RAG) system for enterprise document search? How do you optimize chunking and avoid hallucinations?",
                "type": "Technical",
                "expected_concepts": ["Chunking strategies (semantic chunking)", "Vector embeddings", "Cosine similarity / Approximate Nearest Neighbors", "Cross-encoder re-ranking", "Grounding / Context window limits"],
                "hints": "Consider chunk overlap, metadata filtering, and re-ranking models.",
                "model_answer": "A RAG system parses enterprise documents into semantic chunks with overlapping token windows, generates vector embeddings using models like text-embedding-3 or bge, and indexes them in a vector database. At query time, the user prompt is embedded and compared via cosine similarity. Top-k candidates are re-ranked using a cross-encoder to select the most relevant passages, which are injected into the LLM system prompt with instructions to base answers strictly on the retrieved context.",
                "follow_up": "What is the difference between dense retrieval and sparse retrieval (BM25), and why is hybrid search effective?"
            }
        ],
        "Data Analyst": [
            {
                "id": "da_window_functions",
                "question": "What are window functions in SQL, and how do they differ from GROUP BY aggregations? Give an example using ROW_NUMBER(), RANK(), or DENSE_RANK().",
                "type": "Technical",
                "expected_concepts": ["OVER clause", "PARTITION BY", "ORDER BY", "retaining row identity", "RANK vs DENSE_RANK", "running totals"],
                "hints": "GROUP BY collapses multiple rows into a single summary row, while window functions perform calculations across related rows without collapsing them.",
                "model_answer": "A window function calculates an aggregate or ranking across a set of table rows related to the current row, defined by an OVER() clause, while preserving individual row identity. Unlike GROUP BY, which reduces rows, window functions keep all rows. For example, SELECT employee_id, department_id, salary, DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as salary_rank from employees will rank employees within each department without eliminating individual records.",
                "follow_up": "When would you choose DENSE_RANK() over RANK() when finding the top 3 highest-paid employees in a department?"
            },
            {
                "id": "da_ab_testing",
                "question": "How do you design an A/B test for an e-commerce checkout flow? How do you determine sample size and evaluate statistical significance?",
                "type": "Technical",
                "expected_concepts": ["Null hypothesis vs Alternative hypothesis", "Sample size calculation (Power, Alpha)", "p-value threshold (< 0.05)", "Type I and Type II errors", "Guardrail metrics"],
                "hints": "Define conversion rate, minimum detectable effect (MDE), and power (typically 80%).",
                "model_answer": "1) Define clear null and alternative hypotheses on the primary metric (e.g., checkout conversion rate). 2) Calculate sample size using baseline conversion, minimum detectable effect (MDE), significance level alpha (0.05), and statistical power (80%). 3) Randomize users 50/50 to Control and Variant. 4) Run test until sample size is met (avoiding early peeking bias). 5) Compute two-proportion z-test p-value and monitor guardrail metrics like refund rate.",
                "follow_up": "What is the danger of repeatedly checking p-values every day during an experiment (peeking problem)?"
            }
        ]
    },
    "Telugu": {
        "Software Developer": [
            {
                "id": "te_sync_async",
                "question": "సింక్రోనస్ (Synchronous) మరియు అసెంక్రోనస్ (Asynchronous) ప్రోగ్రామింగ్ మధ్య వ్యత్యాసాన్ని వివరించండి. అసెంక్రోనస్ ప్రోగ్రామింగ్‌ను నిజ జీవితంలో ఏ సందర్భాలలో ఉపయోగిస్తారు?",
                "type": "Technical",
                "expected_concepts": ["ఈవెంట్ లూప్ (Event Loop)", "నాన్-బ్లాకింగ్ I/O", "ప్రామిసెస్ (Promises)", "థ్రెడ్ బ్లాకింగ్", "API కాల్స్"],
                "hints": "డేటాబేస్ నుండి డేటా రావడం కోసం వేచి ఉండటం మరియు మెమరీలో గణనలు చేయడం గురించి ఆలోచించండి.",
                "model_answer": "సింక్రోనస్ ప్రోగ్రామింగ్‌లో ఒక పని పూర్తయ్యే వరకు తర్వాతి పని ఆగాల్సి వస్తుంది. అసెంక్రోనస్ ప్రోగ్రామింగ్‌లో ప్రధాన పని ఆగకుండా బ్యాక్‌గ్రౌండ్‌లో ఇతర పనులు నడుస్తాయి. ఉదాహరణకు, సర్వర్ నుండి API డేటాను తెచ్చుకోవడం లేదా ఫైల్ చదవడం వంటి సందర్భాలలో అసెంక్రోనస్ విధానాన్ని ఉపయోగిస్తాము.",
                "follow_up": "అసెంక్రోనస్ కోడ్‌లో ఎర్రర్ హ్యాండ్లింగ్ (try-catch లేదా catch block) ఎలా చేస్తారు?"
            },
            {
                "id": "te_oop_principles",
                "question": "ఆబ్జెక్ట్-ఓరియెంటెడ్ ప్రోగ్రామింగ్ (OOP) యొక్క ముఖ్య సూత్రాలు ఏమిటి? అబ్‌స్ట్రాక్షన్ (Abstraction) ను మీ కోడింగ్‌లో ఎలా ఉపయోగిస్తారు?",
                "type": "Technical",
                "expected_concepts": ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism", "ఇంటర్‌ఫేస్ (Interface)"],
                "hints": "క్లిష్టమైన లాజిక్‌ను దాచిపెట్టి, అవసరమైన ఇంటర్‌ఫేస్‌ను మాత్రమే వినియోగదారునికి చూపించడం గుర్తుంచుకోండి.",
                "model_answer": "OOP లో 4 ముఖ్య సూత్రాలు ఉన్నాయి: ఎన్‌క్యాప్సులేషన్, అబ్‌స్ట్రాక్షన్, ఇన్హెరిటెన్స్, మరియు పాలిమార్ఫిజం. అబ్‌స్ట్రాక్షన్ అంటే బ్యాకెండ్ సంక్లిష్టతను దాచిపెట్టి కేవలం అవసరమైన ఫీచర్లను మాత్రమే ఇంటర్‌ఫేస్ ద్వారా అందించడం. ఉదాహరణకు, పేమెంట్ గేట్‌వే కోసం ఒక కామన్ ఇంటర్‌ఫేస్ తయారు చేయడం.",
                "follow_up": "ఇన్‌హెరిటెన్స్ కంటే కాంపోజిషన్ (Composition over Inheritance) ఎందుకు మెరుగైనది?"
            },
            {
                "id": "te_two_sum",
                "question": "ఒక అర్రేలో రెండు సంఖ్యల మొత్తం ఒక నిర్దిష్ట టార్గెట్ సంఖ్యకు సమానమయ్యే జతను కనుగొనే సమర్థవంతమైన అల్గారిథమ్ చెప్పండి.",
                "type": "Coding",
                "code_starter": "def two_sum(nums: list[int], target: int) -> list[int]:\n    # మీ కోడ్ ఇక్కడ రాయండి\n    pass\n",
                "test_cases": [
                    {"input": "nums = [2, 7, 11, 15], target = 9", "expected": "[0, 1]"},
                    {"input": "nums = [3, 2, 4], target = 6", "expected": "[1, 2]"}
                ],
                "expected_concepts": ["హాష్ మ్యాప్ (Hash Map)", "O(N) టైమ్ కాంప్లెక్సిటీ", "కాంప్లిమెంట్ తనిఖీ"],
                "hints": "హాష్ మ్యాప్ ఉపయోగించి O(N) సమయంలో సాధించవచ్చు.",
                "model_answer": "హాష్ మ్యాప్ ఉపయోగించి ఒక్కసారి మాత్రమే అర్రేను లూప్ చేస్తూ target - current_val విలువ మ్యాప్‌లో ఉందో లేదో తనిఖీ చేస్తాము. దీని వలన O(N) సమయంలో పరిష్కారం లభిస్తుంది.",
                "follow_up": "ఇదే సమస్యకు అర్రే ముందే సార్ట్ అయి ఉంటే టూ-పాయింటర్ పద్ధతి ఎలా ఉపయోగిస్తారు?"
            },
            {
                "id": "te_db_indexing",
                "question": "డేటాబేస్ ఇండెక్సింగ్ అంటే ఏమిటి? B-Tree ఇండెక్స్ మరియు హాష్ ఇండెక్స్ మధ్య తేడాలు ఏమిటి?",
                "type": "Technical",
                "expected_concepts": ["B-Tree", "హాష్ ఇండెక్స్", "శోధన వేగం O(log N)", "రైట్ పెనాల్టీ (Write latency)"],
                "hints": "రేంజ్ క్వెరీస్ (ఉదాహరణకు తేదీల మధ్య) చేయడానికి B-Tree సరిపోతుంది.",
                "model_answer": "ఇండెక్సింగ్ ద్వారా డేటాను వేగంగా వెతకవచ్చు. B-Tree ఇండెక్స్ బ్యాలెన్స్‌డ్ ట్రీ రూపంలో ఉండి రేంజ్ క్వెరీలకు ఎంతో ఉపయోగపడుతుంది. హాష్ ఇండెక్స్ కేవలం ఖచ్చితమైన సమాన విలువలను మాత్రమే O(1) సమయంలో వెతకగలదు కానీ రేంజ్ క్వెరీలను చేయలేదు.",
                "follow_up": "ఎక్కువ ఇండెక్స్‌లు జోడించడం వల్ల డేటాబేస్ రైట్ (Insert/Update) సమయం ఎందుకు పెరుగుతుంది?"
            }
        ]
    },
    "Hindi": {
        "Software Developer": [
            {
                "id": "hi_sync_async",
                "question": "सिंक्रोनस (Synchronous) और एसिंक्रोनस (Asynchronous) प्रोग्रामिंग में क्या अंतर है? एक वास्तविक परिदृश्य बताएं जहां आप दोनों का उपयोग करेंगे?",
                "type": "Technical",
                "expected_concepts": ["इवेंट लूप", "नॉन-ब्लॉकिंग I/O", "प्रॉमिस / async-await", "थ्रेड ब्लॉकिंग", "API कॉल्स"],
                "hints": "किसी बाहरी सर्वर से डेटा प्राप्त करने और मेमोरी में गणना करने के बारे में सोचें।",
                "model_answer": "सिंक्रोनस में हर कार्य क्रमिक रूप से चलता है और अगला कार्य तब तक प्रतीक्षा करता है जब तक पहला पूरा न हो। एसिंक्रोनस में भारी कार्य पृष्ठभूमि में चलते हैं और मुख्य थ्रेड ब्लॉक नहीं होता। जैसे किसी बाहरी API से डेटा लोड करना एसिंक्रोनस होता है, जबकि साधारण गणितीय गणनाएं सिंक्रोनस होती हैं।",
                "follow_up": "जावास्क्रिप्ट या पायथन में एसिंक्रोनस एरर हैंडलिंग कैसे की जाती है?"
            },
            {
                "id": "hi_oop_principles",
                "question": "ऑब्जेक्ट ओरिएंटेड प्रोग्रामिंग (OOP) के मुख्य सिद्धांत क्या हैं? एब्स्ट्रैक्शन (Abstraction) और एनकैप्सुलेशन में क्या अंतर है?",
                "type": "Technical",
                "expected_concepts": ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism", "डेटा हाइडिंग"],
                "hints": "एनकैप्सुलेशन डेटा और मेथड को बांधता है, जबकि एब्स्ट्रैक्शन जटिलता को छुपाता है।",
                "model_answer": "OOP के 4 मुख्य स्तंभ हैं: एनकैप्सुलेशन, एब्स्ट्रैक्शन, इनहेरिटेंस और पॉलीमॉर्फिज्म। एनकैप्सुलेशन का अर्थ है डेटा और फंक्शन को एक क्लास में सुरक्षित बांधना। एब्स्ट्रैक्शन का अर्थ है आंतरिक जटिल विवरण को छुपाकर केवल आवश्यक इंटरफ़ेस प्रदान करना।",
                "follow_up": "क्या आप बता सकते हैं कि इंटरफ़ेस (Interface) और एब्स्ट्रैक्ट क्लास (Abstract Class) में क्या अंतर है?"
            },
            {
                "id": "hi_two_sum",
                "question": "एक फंक्शन लिखें जो किसी इंटीजर ऐरे में दिए गए टारगेट सम के बराबर दो संख्याओं के इंडेक्स ढूंढे।",
                "type": "Coding",
                "code_starter": "def two_sum(nums: list[int], target: int) -> list[int]:\n    # अपना कोड यहाँ लिखें\n    pass\n",
                "test_cases": [
                    {"input": "nums = [2, 7, 11, 15], target = 9", "expected": "[0, 1]"},
                    {"input": "nums = [3, 2, 4], target = 6", "expected": "[1, 2]"}
                ],
                "expected_concepts": ["Hash Map", "O(N) टाइम कॉम्प्लेक्सिटी", "सर्च ऑप्टिमाइज़ेशन"],
                "hints": "हैश मैप का उपयोग करके पिछले मानों को स्टोर करें।",
                "model_answer": "हम एक हैश मैप में हर एलिमेंट और उसके इंडेक्स को स्टोर करते हैं। प्रत्येक नंबर के लिए target - num चेक करते हैं। यदि वह मैप में है तो इंडेक्स लौटाते हैं। इसकी समय जटिलता O(N) है।",
                "follow_up": "यदि ऐरे पहले से सॉर्टेड हो तो टू-पॉइंटर विधि कैसे काम करेगी?"
            }
        ]
    },
    "Tamil": {
        "Software Developer": [
            {
                "id": "ta_sync_async",
                "question": "ஒத்திசைவான (Synchronous) மற்றும் ஒத்திசைவற்ற (Asynchronous) நிரலாக்கத்தின் முக்கிய வேறுபாடுகளை விளக்குக. நிஜ வாழ்க்கை உதாரணம் தருக.",
                "type": "Technical",
                "expected_concepts": ["Event Loop", "Non-blocking I/O", "Promises", "API Calls"],
                "hints": "சர்வர் தரவுக்காக காத்திருத்தல் மற்றும் நினைவக கணக்கீடுகள் பற்றி சிந்தியுங்கள்.",
                "model_answer": "சின்க்ரோனஸ் நிரலாக்கத்தில் ஒவ்வொரு பணியும் வரிசையாக நடக்கும். அசின்க்ரோனஸ் முறையில் முதன்மை செயல்முறை தடைபடாமல் பின்னணியில் பணிகள் நிறைவேறும். சர்வர் API அழைப்புகள் மற்றும் பெரிய கோப்புகளை வாசிப்பதற்கு அசின்க்ரோனஸ் முறை பயன்படுகிறது.",
                "follow_up": "அசின்க்ரோனஸ் பிழைகளை எவ்வாறு கையாள்வது (Error Handling)?"
            }
        ]
    },
    "Kannada": {
        "Software Developer": [
            {
                "id": "kn_sync_async",
                "question": "ಸಿಂಕ್ರೋನಸ್ ಮತ್ತು ಅಸಿಂಕ್ರೋನಸ್ ಪ್ರೋಗ್ರಾಮಿಂಗ್ ನಡುವಿನ ವ್ಯತ್ಯಾಸವನ್ನು ವಿವರಿಸಿ. ನೀವು ಇದನ್ನು ಎಲ್ಲಿ ಬಳಸುತ್ತೀರಿ?",
                "type": "Technical",
                "expected_concepts": ["Event Loop", "Non-blocking I/O", "Promises", "API calls"],
                "hints": "ಸರ್ವರ್‌ನಿಂದ ಡೇಟಾ ಪಡೆಯುವಾಗ ಮತ್ತು ಮೆಮೊರಿ ಲೆಕ್ಕಾಚಾರ ಮಾಡುವಾಗ ಆಗುವ ವ್ಯತ್ಯಾಸವನ್ನು ಗಮನಿಸಿ.",
                "model_answer": "ಸಿಂಕ್ರೋನಸ್ ಪ್ರೋಗ್ರಾಮಿಂಗ್‌ನಲ್ಲಿ ಒಂದು ಕಾರ್ಯ ಮುಗಿಯುವವರೆಗೆ ಮುಂದಿನ ಕಾರ್ಯ ನಿಲ್ಲುತ್ತದೆ. ಅಸಿಂಕ್ರೋನಸ್‌ನಲ್ಲಿ ಮುಖ್ಯ ಕಾರ್ಯ ನಿಲ್ಲದೆ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಕೆಲಸ ಮುಂದುವರಿಯುತ್ತದೆ. ನೆಟ್‌ವರ್ಕ್ API ಕರೆಗಳಿಗೆ ಅಸಿಂಕ್ರೋನಸ್ ಅತ್ಯುತ್ತಮ.",
                "follow_up": "ಅಸಿಂಕ್ರೋನಸ್ ಕೋಡ್‌ನಲ್ಲಿ ಎರರ್ ಹ್ಯಾಂಡ್ಲಿಂಗ್ ಹೇಗೆ ಮಾಡುತ್ತೀರಿ?"
            }
        ]
    },
    "Malayalam": {
        "Software Developer": [
            {
                "id": "ml_sync_async",
                "question": "സിൻക്രണസ്, അസിൻക്രണസ് പ്രോഗ്രാമിംഗ് തമ്മിലുള്ള വ്യത്യാസം എന്താണ്? ഇത് എവിടെ ഉപയോഗിക്കുന്നു എന്ന് വിശദീകരിക്കാമോ?",
                "type": "Technical",
                "expected_concepts": ["Event Loop", "Non-blocking I/O", "Promises", "API calls"],
                "hints": "ഒരു സെർവറിൽ നിന്ന് ഡാറ്റ വരാൻ കാത്തിരിക്കുന്ന സന്ദർഭം ചിന്തിക്കുക.",
                "model_answer": "സിൻക്രണസ് രീതിയിൽ ഒരു പ്രവർത്തനം തീർന്ന ശേഷം മാത്രമേ അടുത്തത് ആരംഭിക്കൂ. എന്നാൽ അസിൻക്രണസ് രീതിയിൽ ബാക്ക്ഗ്രൗണ്ടിൽ ജോലികൾ നടക്കുകയും പ്രധാന ത്രെഡ് ബ്ലോക്ക് ആവാതിരിക്കുകയും ചെയ്യുന്നു. API കോളുകൾക്ക് ഇത് അത്യാവശ്യമാണ്.",
                "follow_up": "അസിൻക്രണസ് കോഡിൽ എററുകൾ എങ്ങനെ കൈകാര്യം ചെയ്യാം?"
            }
        ]
    }
}

# Role aliases map for role normalization
ROLE_ALIASES: Dict[str, str] = {
    "software engineer": "Software Developer",
    "software developer": "Software Developer",
    "frontend developer": "Frontend Developer",
    "frontend engineer": "Frontend Developer",
    "react developer": "Frontend Developer",
    "backend developer": "Backend Developer",
    "backend engineer": "Backend Developer",
    "full-stack developer": "Full-Stack Developer",
    "full stack developer": "Full-Stack Developer",
    "full-stack engineer": "Full-Stack Developer",
    "graduate engineer trainee": "Graduate Engineer Trainee",
    "get": "Graduate Engineer Trainee",
    "entry level developer": "Graduate Engineer Trainee",
    "ai/ml engineer": "AI/ML Engineer",
    "machine learning engineer": "AI/ML Engineer",
    "data analyst": "Data Analyst",
    "python developer": "Software Developer",
    "java developer": "Software Developer"
}

def normalize_role(role: str) -> str:
    clean = role.strip().lower()
    return ROLE_ALIASES.get(clean, role)

def get_questions_for_interview(
    role: str,
    interview_type: str,
    language: str,
    count: int = 5,
    exclude_questions: Optional[List[str]] = None,
    session_seed: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Selects diverse, non-repeating questions based on role, interview type, and language.
    Eliminates questions contained in `exclude_questions` so that different sessions
    for the same role receive fresh questions.
    """
    normalized_role = normalize_role(role)
    pool: List[Dict[str, Any]] = []

    # 1. Search language bank
    lang_bank = QUESTION_BANK.get(language, {})
    if normalized_role in lang_bank:
        pool.extend(lang_bank[normalized_role])
    elif "Software Developer" in lang_bank:
        pool.extend(lang_bank["Software Developer"])

    # 2. Add English questions for richer variety
    eng_bank = QUESTION_BANK.get("English", {})
    if normalized_role in eng_bank:
        for q in eng_bank[normalized_role]:
            if not any(item.get("id") == q.get("id") or item.get("question") == q.get("question") for item in pool):
                pool.append(q)

    # 3. Add Software Developer fallback pool if needed
    if len(pool) < 6 and "Software Developer" in eng_bank:
        for q in eng_bank["Software Developer"]:
            if not any(item.get("id") == q.get("id") or item.get("question") == q.get("question") for item in pool):
                pool.append(q)

    # Filter by interview type if requested
    if interview_type == "HR Interview":
        hr_pool = [q for q in pool if q.get("type") in ["HR", "Behavioral"]]
        if hr_pool:
            pool = hr_pool + [q for q in pool if q not in hr_pool]
    elif interview_type == "Coding Interview":
        coding_pool = [q for q in pool if q.get("type") == "Coding"]
        if coding_pool:
            pool = coding_pool + [q for q in pool if q not in coding_pool]
    elif interview_type == "Aptitude Interview":
        apt_pool = [q for q in pool if q.get("type") == "Aptitude"]
        if apt_pool:
            pool = apt_pool + [q for q in pool if q not in apt_pool]

    # Clean normalize excluded questions
    excluded_set = set()
    if exclude_questions:
        for eq in exclude_questions:
            if isinstance(eq, str):
                excluded_set.add(eq.strip().lower()[:60])

    # Filter out excluded questions
    unasked = [
        q for q in pool
        if q["question"].strip().lower()[:60] not in excluded_set
    ]

    # If unasked is too small (e.g. all questions were asked in previous sessions), recycle
    candidates = unasked if len(unasked) >= 2 else pool

    # Shuffle deterministically using session_seed or random
    if session_seed:
        # Create deterministic pseudo-random seed from string hash
        seed_int = int(hashlib.md5(session_seed.encode("utf-8")).hexdigest()[:8], 16)
        rng = random.Random(seed_int)
        shuffled = list(candidates)
        rng.shuffle(shuffled)
        return shuffled
    else:
        shuffled = list(candidates)
        random.shuffle(shuffled)
        return shuffled
