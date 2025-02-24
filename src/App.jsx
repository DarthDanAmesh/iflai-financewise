import React, { useState, useEffect } from "react";
import { openDB } from "idb";
import { 
  DollarSign, 
  PieChart, 
  BookOpen, 
  Mic, 
  MessageCircle,
  TrendingUp,
  ShoppingBag,
  Bus,
  ChevronLeft,
  Plus,
  Trash2
} from "lucide-react";
import './App.css'


const FloatingActionButton = ({ icon, onClick, active, label }) => (
  <button
    onClick={onClick}
    className={`
      p-4 rounded-full shadow-lg flex items-center justify-center
      transition-all duration-200 ease-in-out
      ${active 
        ? "bg-blue-600 text-white transform scale-110" 
        : "bg-white text-gray-700 hover:bg-gray-50"
      }
    `}
    aria-label={label}
  >
    {icon}
  </button>
);

const Section = ({ title, children, isVisible, onBack }) => {
  if (!isVisible) return null;
  
  return (
    <div className="animate-fadeIn">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 mr-2"
          aria-label="Go back"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
};


const FadeInSection = ({ children, delay = 0 }) => (
  <div 
    className={`
      opacity-0 animate-fadeIn 
      transform translate-y-4 
      transition-all duration-700 ease-out
    `}
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
  >
    {children}
  </div>
);

const ExpenseCard = ({ category, amount, icon: Icon }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="text-blue-600" size={20} />
        </div>
        <span className="font-medium text-gray-700">{category}</span>
      </div>
      <span className="text-red-600 font-semibold">${amount}</span>
    </div>
  </div>
);

export default function App() {
  const [budget, setBudget] = useState(100);
  const [inputBudget, setInputBudget] = useState(100);
  const [expenses, setExpenses] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [badges, setBadges] = useState([]);
  const [activeSection, setActiveSection] = useState('welcome');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [newExpenseAmount, setNewExpenseAmount] = useState(0);
  const [newExpenseCategory, setNewExpenseCategory] = useState('Food');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [categories, setCategories] = useState(['Food', 'Transport', 'Entertainment']); // Initial categories
  const [error, setError] = useState('');


  // Load categories from localStorage on initial render
  useEffect(() => {
    const savedCategories = JSON.parse(localStorage.getItem('categories')) || ['Food', 'Transport', 'Entertainment'];
    setCategories(savedCategories);
  }, []);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const handleAddExpense = () => {
    if (newExpenseAmount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }
    if (!newExpenseCategory.trim()) {
      setError('Category cannot be empty.');
      return;
    }
  
    // Add the category to the list if it doesn't already exist
    if (!categories.includes(newExpenseCategory)) {
      setCategories((prevCategories) => [...prevCategories, newExpenseCategory]);
    }
  
    setError(''); // Clear any previous errors
    addExpense(newExpenseAmount, newExpenseCategory);
  };


  const handleSectionChange = (newSection) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSection(newSection);
      setIsTransitioning(false);
    }, 300);
  };

  const categoryIcons = {
    Food: ShoppingBag,
    Transport: Bus
  };
  
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log("Service Worker Registered"))
        .catch((err) => console.error("Service Worker Registration Failed", err));
    }
    loadExpenses();
  }, []);

  const openDatabase = async () => {
    return openDB("financeDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("expenses")) {
          db.createObjectStore("expenses", { keyPath: "id", autoIncrement: true });
        }
      },
    });
  };

  const saveExpense = async (expense) => {
    const db = await openDatabase();
    const tx = db.transaction("expenses", "readwrite");
    const store = tx.objectStore("expenses");
    await store.add(expense);
    await tx.done;
  };

  const loadExpenses = async () => {
    const db = await openDatabase();
    const tx = db.transaction("expenses", "readonly");
    const store = tx.objectStore("expenses");
    const allExpenses = await store.getAll();
    setExpenses(allExpenses);
    setBudget(inputBudget - allExpenses.reduce((sum, exp) => sum + exp.amount, 0));
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-GB"; // Set language to UK English
    const voices = speechSynthesis.getVoices();
    const googleUKVoice = voices.find(voice => voice.name === "Google UK English Female");
    if (googleUKVoice) {
      utterance.voice = googleUKVoice; // Use Google UK English Female voice
    }
    speechSynthesis.speak(utterance);
  };

  const addExpense = async (amount, category) => {
    const expense = { amount, category };
    await saveExpense(expense);
    setExpenses([...expenses, expense]);
    setBudget(budget - amount);
    speak(`Expense added: ${category}, $${amount}. Remaining budget: $${budget - amount}`);
  };

  const setNewBudget = () => {
    setBudget(inputBudget);
    speak(`Budget set to $${inputBudget}`);
  };

  const quizQuestions = [
    { question: "What is saving?", options: ["Spending money", "Keeping money aside"], answer: 1 },
    { question: "What is a budget?", options: ["A spending plan", "A type of bank"], answer: 0 },
    { question: "What is an emergency fund?", options: ["Money for unexpected expenses", "A loan from a friend"], answer: 0 },
    { question: "What does it mean to invest?", options: ["Putting money to grow", "Keeping cash under a mattress"], answer: 0 },
    { question: "What is a loan?", options: ["Money you borrow and repay", "A gift of money"], answer: 0 },
  ];

  const handleQuizAnswer = (index) => {
    const correctAnswerIndex = quizQuestions[quizIndex].answer;
    if (index === correctAnswerIndex) {
      speak(`Correct! ${quizQuestions[quizIndex].options[correctAnswerIndex]} is the right answer.`);
      setScore(score + 1);
      if ((score + 1) % 3 === 0) {
        const newBadge = `Badge for ${score + 1} correct answers`;
        setBadges([...badges, newBadge]);
        speak(`Congratulations! You've earned a new badge: ${newBadge}`);
      }
    } else {
      speak(`Oops, that's incorrect. The correct answer is: ${quizQuestions[quizIndex].options[correctAnswerIndex]}`);
    }
    setQuizIndex((prev) => (prev + 1) % quizQuestions.length);
  };

  const handleVoiceCommand = () => {
    if (!isListening) {
      setIsListening(true);
      // Initialize speech recognition here
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        if (command.includes('add expense')) {
          // Parse amount and category from command
          // Example: "add expense 20 for food"
          const match = command.match(/add expense (\d+) for (\w+)/);
          if (match) {
            addExpense(Number(match[1]), match[2]);
          }
        }
      };
      
      recognition.onend = () => setIsListening(false);
      recognition.start();
    }
  };

  const sections = {
    budget: (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Current Budget</h3>
          <p className="text-3xl font-bold text-blue-600">${budget}</p>
  
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set New Budget
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputBudget}
                onChange={(e) => setInputBudget(Number(e.target.value))}
                className="flex-1 border border-gray-300 rounded-lg p-3 text-lg"
                aria-label="New budget amount"
              />
              <button
                onClick={setNewBudget}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Add Expenses */} 
  
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            value={newExpenseAmount}
            onChange={(e) => setNewExpenseAmount(Number(e.target.value))}
            className="flex-1 border border-gray-300 rounded-lg p-2"
            placeholder="Amount"
          />
          {isCustomCategory ? (
            <input
              type="text"
              value={newExpenseCategory}
              onChange={(e) => setNewExpenseCategory(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-2"
              placeholder="Custom Category"
            />
          ) : (
            <select
              value={newExpenseCategory}
              onChange={(e) => setNewExpenseCategory(e.target.value)}
              className="border border-gray-300 rounded-lg p-2"
            >
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setIsCustomCategory(!isCustomCategory)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            {isCustomCategory ? 'Select Category' : 'Custom Category'}
          </button>
          <button
            onClick={handleAddExpense}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Expense
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm mb-4">
            {error}
          </div>
        )}


          {/* Recent Expenses */} 

  
          <h3 className="text-xl font-semibold mb-4">Recent Expenses</h3>
          <div className="space-y-3">
            {expenses.map((expense, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium">{expense.category}</span>
                <span className="text-red-600">${expense.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    
    quiz: (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="mb-6">
          <p className="text-lg font-medium mb-4">{quizQuestions[quizIndex].question}</p>
          <div className="space-y-3">
            {quizQuestions[quizIndex].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleQuizAnswer(idx)}
                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-gray-600">Current Score</p>
            <p className="text-2xl font-bold text-blue-600">{score}</p>
          </div>
          <div className="flex gap-2">
            {badges.map((badge, index) => (
              <div
                key={index}
                className="bg-yellow-100 p-2 rounded-full"
                title={badge}
              >
                <Award className="text-yellow-600" size={24} />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    chat: (
      <div className="bg-white rounded-lg p-6 shadow-md h-[calc(100vh-200px)] flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.type === 'user'
                  ? 'bg-blue-100 ml-auto'
                  : 'bg-gray-100'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask about your finances..."
            className="flex-1 border border-gray-300 rounded-lg p-3"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                setMessages([...messages, { type: 'user', text: e.target.value }]);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-2xl mx-auto relative">
        {/* Welcome Screen */}
        {activeSection === 'welcome' ? (
          <div className="animate-scaleIn">
            <div className="glass-morphism rounded-2xl shadow-xl p-8 text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-blue-200 rounded-full animate-pulse"></div>
                <div className="relative w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <DollarSign size={40} className="text-white" />
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Welcome to FinanceWise
              </h1>
              
              <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                Your personal finance companion for budgeting, expense tracking,
                and financial education.
              </p>
              
              <button
                onClick={() => handleSectionChange('budget')}
                className="
                  bg-blue-600 text-white px-8 py-4 rounded-xl text-lg
                  hover:bg-blue-700 transform hover:-translate-y-1
                  transition-all duration-300 shadow-md hover:shadow-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  relative overflow-hidden group
                "
              >
                <span className="relative z-10">Get Started</span>
                <div className="
                  absolute inset-0 bg-blue-500 transform scale-x-0 group-hover:scale-x-100
                  transition-transform duration-300 origin-left
                "></div>
              </button>
            </div>
          </div>
        ) : (

          <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="mb-8 flex items-center">
              <button
                onClick={() => handleSectionChange('welcome')}
                className="p-2 hover:bg-white rounded-lg transition-colors duration-200 mr-4"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Budget Overview</h1>
            </div>


          <Section
              title={activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
              isVisible={true}
              onBack={() => handleSectionChange('welcome')}
            >
              {sections[activeSection]}
          </Section>

            <FadeInSection delay={100}>
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg text-gray-600">Current Budget</h2>
                    <p className="text-3xl font-bold text-blue-600">${budget}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <TrendingUp className="text-blue-600" size={24} />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Set New Budget
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={inputBudget}
                      onChange={(e) => setInputBudget(Number(e.target.value))}
                      className="
                        flex-1 border border-gray-200 rounded-xl px-4 py-3
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-200
                      "
                    />
                    <button
                      onClick={() => setBudget(inputBudget)}
                      className="
                        bg-blue-600 text-white px-6 rounded-xl
                        hover:bg-blue-700 transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      "
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay={200}>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Expenses</h2>
                <div className="space-y-4">
                  {[
                    { category: 'Food', amount: 10 },
                    { category: 'Transport', amount: 15 },
                    { category: 'Food', amount: 10 }
                  ].map((expense, index) => (
                    <ExpenseCard
                      key={index}
                      category={expense.category}
                      amount={expense.amount}
                      icon={categoryIcons[expense.category]}
                    />
                  ))}
                </div>
              </div>
            </FadeInSection>
          </div>
        )}

        {/* Floating Action Buttons with staggered animation */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-4">
          {['chat', 'voice', 'quiz', 'budget'].map((section, index) => (
            <div
              key={section}
              className="animate-slideIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <FloatingActionButton
                icon={
                  section === 'chat' ? <MessageCircle size={24} /> :
                  section === 'voice' ? <Mic size={24} /> :
                  section === 'quiz' ? <BookOpen size={24} /> :
                  <PieChart size={24} />
                }
                onClick={() => handleSectionChange(section)}
                active={activeSection === section}
                label={`Open ${section}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}