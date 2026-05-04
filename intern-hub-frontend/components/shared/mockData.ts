import { Vacancy } from "./VacancyCard";
import { Task } from "./TaskCard";
import { InterviewQuestion } from "./InterviewQuestionCard";
import { Direction } from "./DirectionSelector";

export const mockVacancies: Vacancy[] = [
  {
    id: "1",
    title: "Java Developer (Middle)",
    company: "Яндекс",
    location: "Москва",
    salary: "150 000 - 250 000 ₽",
    type: "full-time",
    experience: "middle",
    direction: "java",
    description:
      "Ищем опытного Java-разработчика для работы над высоконагруженными сервисами. Работа в команде профессионалов над интересными проектами.",
    requirements: [
      "Опыт работы с Java 8+",
      "Знание Spring Framework",
      "Опыт работы с базами данных",
      "Понимание микросервисной архитектуры",
    ],
    publishedAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Frontend Developer (React)",
    company: "VK",
    location: "Санкт-Петербург",
    salary: "120 000 - 200 000 ₽",
    type: "full-time",
    experience: "middle",
    direction: "javascript",
    description:
      "Разработка пользовательских интерфейсов для веб-приложений. Работа с современным стеком технологий.",
    requirements: [
      "Опыт работы с React",
      "Знание TypeScript",
      "Опыт работы с Redux или MobX",
      "Понимание REST API",
    ],
    publishedAt: "2024-01-14",
  },
  {
    id: "3",
    title: "Python Backend Developer",
    company: "Тинькофф",
    location: "Москва",
    salary: "180 000 - 300 000 ₽",
    type: "full-time",
    experience: "senior",
    direction: "python",
    description:
      "Разработка backend-сервисов на Python. Работа над финансовыми продуктами.",
    requirements: [
      "Опыт работы с Python 3.8+",
      "Знание Django/FastAPI",
      "Опыт работы с PostgreSQL",
      "Понимание асинхронного программирования",
    ],
    publishedAt: "2024-01-13",
  },
  {
    id: "4",
    title: "Java Intern",
    company: "Сбер",
    location: "Москва",
    salary: "50 000 - 80 000 ₽",
    type: "internship",
    experience: "junior",
    direction: "java",
    description:
      "Стажировка для начинающих Java-разработчиков. Обучение и работа над реальными проектами.",
    requirements: [
      "Базовые знания Java",
      "Желание учиться",
      "Готовность работать в команде",
    ],
    publishedAt: "2024-01-12",
  },
  {
    id: "5",
    title: "JavaScript Developer (Node.js)",
    company: "Ozon",
    location: "Москва",
    salary: "140 000 - 220 000 ₽",
    type: "full-time",
    experience: "middle",
    direction: "javascript",
    description:
      "Разработка backend-сервисов на Node.js. Работа над масштабируемыми решениями.",
    requirements: [
      "Опыт работы с Node.js",
      "Знание Express.js или Nest.js",
      "Опыт работы с MongoDB или PostgreSQL",
      "Понимание микросервисной архитектуры",
    ],
    publishedAt: "2024-01-11",
  },
  {
    id: "6",
    title: "Python Data Engineer",
    company: "Яндекс",
    location: "Москва",
    salary: "200 000 - 350 000 ₽",
    type: "full-time",
    experience: "senior",
    direction: "python",
    description:
      "Работа с большими данными. Разработка ETL-процессов и data pipelines.",
    requirements: [
      "Опыт работы с Python",
      "Знание Apache Spark или Pandas",
      "Опыт работы с Hadoop",
      "Понимание data engineering",
    ],
    publishedAt: "2024-01-10",
  },
];

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Реализация HashMap на Java",
    description:
      "Реализуйте собственную версию HashMap с поддержкой основных операций: put, get, remove. Учтите коллизии и обеспечьте эффективность.",
    difficulty: "medium",
    direction: "java",
    estimatedTime: "2-3 часа",
    tags: ["коллекции", "алгоритмы", "структуры данных"],
  },
  {
    id: "2",
    title: "React компонент с виртуализацией",
    description:
      "Создайте компонент списка с виртуализацией для отображения больших объемов данных. Используйте React и оптимизируйте производительность.",
    difficulty: "hard",
    direction: "javascript",
    estimatedTime: "4-5 часов",
    tags: ["react", "оптимизация", "производительность"],
  },
  {
    id: "3",
    title: "Асинхронный парсер данных",
    description:
      "Напишите асинхронный парсер, который обрабатывает данные из нескольких источников параллельно и агрегирует результаты.",
    difficulty: "medium",
    direction: "python",
    estimatedTime: "3-4 часа",
    tags: ["async", "парсинг", "asyncio"],
  },
  {
    id: "4",
    title: "REST API на Spring Boot",
    description:
      "Создайте REST API для управления задачами (CRUD операции). Используйте Spring Boot, Spring Data JPA и PostgreSQL.",
    difficulty: "easy",
    direction: "java",
    estimatedTime: "2 часа",
    tags: ["spring", "rest", "api"],
  },
  {
    id: "5",
    title: "Оптимизация запросов к базе данных",
    description:
      "Проанализируйте и оптимизируйте медленные SQL-запросы. Создайте индексы и перепишите запросы для улучшения производительности.",
    difficulty: "hard",
    direction: "python",
    estimatedTime: "4 часа",
    tags: ["sql", "оптимизация", "база данных"],
  },
  {
    id: "6",
    title: "Компонент формы с валидацией",
    description:
      "Создайте многошаговую форму с валидацией на React. Используйте библиотеку для валидации (например, Yup или Zod).",
    difficulty: "easy",
    direction: "javascript",
    estimatedTime: "2 часа",
    tags: ["react", "формы", "валидация"],
  },
];

export const mockInterviewQuestions: InterviewQuestion[] = [
  {
    id: "1",
    question: "Объясните разницу между ArrayList и LinkedList в Java. Когда использовать каждый?",
    category: "technical",
    difficulty: "medium",
    direction: "java",
    answer:
      "ArrayList - это динамический массив, который хранит элементы в непрерывной памяти. Доступ по индексу O(1), вставка/удаление в середине O(n).\n\nLinkedList - это двусвязный список. Доступ по индексу O(n), вставка/удаление O(1) при наличии ссылки на элемент.\n\nИспользуйте ArrayList когда нужен частый доступ по индексу. Используйте LinkedList когда часто вставляете/удаляете элементы в середине списка.",
    tips: [
      "Упомяните про внутреннюю реализацию",
      "Приведите примеры использования",
      "Обсудите производительность операций",
    ],
    tags: ["коллекции", "структуры данных"],
  },
  {
    id: "2",
    question: "Что такое замыкание (closure) в JavaScript? Приведите пример.",
    category: "technical",
    difficulty: "easy",
    direction: "javascript",
    answer:
      "Замыкание - это функция, которая имеет доступ к переменным из внешней области видимости даже после того, как внешняя функция завершила выполнение.\n\nПример:\n```javascript\nfunction outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    return count;\n  };\n}\nconst counter = outer();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2\n```",
    tips: [
      "Объясните механизм работы",
      "Приведите практический пример",
      "Упомяните про области видимости",
    ],
    tags: ["замыкания", "функции"],
  },
  {
    id: "3",
    question: "Объясните разницу между списками (list) и кортежами (tuple) в Python.",
    category: "technical",
    difficulty: "easy",
    direction: "python",
    answer:
      "Список (list) - это изменяемая (mutable) последовательность элементов. Можно добавлять, удалять и изменять элементы.\n\nКортеж (tuple) - это неизменяемая (immutable) последовательность. После создания нельзя изменить элементы.\n\nСписки используют квадратные скобки [], кортежи - круглые (). Кортежи быстрее и занимают меньше памяти, их можно использовать как ключи словаря.",
    tips: [
      "Упомяните про изменяемость",
      "Приведите примеры использования",
      "Обсудите производительность",
    ],
    tags: ["типы данных", "основы"],
  },
  {
    id: "4",
    question: "Как работает сборщик мусора (Garbage Collector) в Java?",
    category: "technical",
    difficulty: "hard",
    direction: "java",
    answer:
      "Garbage Collector автоматически освобождает память от объектов, которые больше не используются. В Java используется несколько алгоритмов GC:\n\n1. Mark and Sweep - помечает используемые объекты, затем удаляет непомеченные\n2. Generational GC - разделяет объекты по поколениям (young, old)\n3. G1 GC - для больших heap'ов\n\nGC работает в отдельном потоке и может приостанавливать выполнение приложения (stop-the-world).",
    tips: [
      "Объясните основные алгоритмы",
      "Упомяните про поколения объектов",
      "Обсудите влияние на производительность",
    ],
    tags: ["память", "jvm", "производительность"],
  },
  {
    id: "5",
    question: "Что такое виртуальный DOM в React? Зачем он нужен?",
    category: "technical",
    difficulty: "medium",
    direction: "javascript",
    answer:
      "Виртуальный DOM - это JavaScript-представление реального DOM. React создает виртуальное дерево компонентов в памяти.\n\nПреимущества:\n- Быстрое сравнение изменений (diffing)\n- Минимальные обновления реального DOM (reconciliation)\n- Улучшенная производительность\n- Предсказуемость обновлений\n\nReact сравнивает старое и новое виртуальное дерево и обновляет только изменившиеся части реального DOM.",
    tips: [
      "Объясните процесс reconciliation",
      "Упомяните про производительность",
      "Сравните с прямыми манипуляциями DOM",
    ],
    tags: ["react", "dom", "производительность"],
  },
  {
    id: "6",
    question: "Объясните концепцию декораторов в Python. Приведите пример.",
    category: "technical",
    difficulty: "medium",
    direction: "python",
    answer:
      "Декоратор - это функция, которая принимает другую функцию и расширяет её поведение без явного изменения кода.\n\nПример:\n```python\n@timer\ndef my_function():\n    time.sleep(1)\n\n# Эквивалентно:\ndef timer(func):\n    def wrapper():\n        start = time.time()\n        result = func()\n        print(f'Время выполнения: {time.time() - start}')\n        return result\n    return wrapper\n```",
    tips: [
      "Объясните синтаксис @",
      "Приведите практический пример",
      "Упомяните про замыкания",
    ],
    tags: ["декораторы", "функции", "синтаксис"],
  },
];




