import React, { useRef, useState, useEffect } from "react";
import { openDB } from "idb";
import { 
  DollarSign, 
  PieChart, 
  BookOpen, 
  Mic, MicOff,
  MessageCircle, Send, Image, Paperclip, ArrowLeft, Volume2,
  TrendingUp,
  ShoppingBag,
  Bus,
  ChevronLeft,
  Plus,
  Trash2,
  Calendar, 
  Phone, 
  Edit, 
  Check, 
  X, 
  Bell
} from "lucide-react";
import './App.css'
import axios from 'axios';
import Tesseract from 'tesseract.js';
// Missing Award component for badges
const Award = ({ className, size }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
  </svg>
);


const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};


{/*START OF THE MODS FOR FINANCE CHAT*/}

// API endpoint
const API_URL = 'http://13.51.161.26:80/api/chat';

const FinanceWiseApp = () => {
  
}
{/*END OF THE MODS FOR FINANCE CHAT*/}

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

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const categoryIcons = {
    Food: ShoppingBag,
    Transport: Bus,
    Entertainment: DollarSign
  };
  
  const Icon = categoryIcons[expense.category] || DollarSign;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="text-blue-600" size={20} />
          </div>
          <div>
            <span className="font-medium text-gray-700">{expense.category}</span>
            <div className="text-xs text-gray-500">{formatDate(expense.date)}</div>
            {expense.billable && (
              <div className="flex items-center mt-1 space-x-1">
                <Phone size={12} className="text-gray-500" />
                <span className="text-xs text-gray-500">{expense.contact}</span>
                {expense.reminderOn && <Bell size={12} className="text-blue-500" />}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-red-600 font-semibold">${expense.amount}</span>
          <div className="flex space-x-2 mt-2">
            <button 
              onClick={() => onEdit(expense)} 
              className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
              aria-label="Edit expense"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={() => onDelete(expense.id)} 
              className="p-1 text-red-600 hover:bg-red-50 rounded-full"
              aria-label="Delete expense"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [budget, setBudget] = useState(100);
  const [inputBudget, setInputBudget] = useState(100);
  const [expenses, setExpenses] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [badges, setBadges] = useState([]);
  const [activeSection, setActiveSection] = useState('welcome');

  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Expense management state
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('Food');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [categories, setCategories] = useState(['Food', 'Transport', 'Entertainment']); // Initial categories
  const [error, setError] = useState('');

  // Billable expense state
  const [isBillable, setIsBillable] = useState(false);
  const [contact, setContact] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminderOn, setReminderOn] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);


  const [messages, setMessages] = useState([
    { type: 'assistant', text: 'Hello! I can help you manage your finances. What would you like to know about today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [responseQuality, setResponseQuality] = useState('concise');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  const recognitionRef = useRef(null);
  const audioRef = useRef(new Audio());

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setInputText(transcript);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  
  
  const handleSendMessage = async () => {
    if (!inputText.trim() && !imagePreview) return;
    
    // Add user message to chat
    const userMessage = inputText.trim() || "Image uploaded";
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    
    // Clear input and image preview
    setInputText('');
    setImagePreview(null);
    setIsLoading(true);
    
    try {
      // Prepare messages for API
      const apiMessages = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      // Add current message
      apiMessages.push({
        role: 'user',
        content: userMessage
      });
      
      // Make API request
      const response = await axios.post(API_URL, {
        messages: apiMessages,
        role: 'user',
        preferred_style: responseQuality,
        continue_conversation: true
      });
      
      // Add assistant response to chat
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        text: response.data.response,
        ttsResponse: response.data.tts_response 
      }]);
      
      // If voice is enabled, read response aloud
      if (response.data.voice_suitable) {
        playResponseAudio(response.data.tts_response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        text: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Show image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Process image with OCR
    Tesseract.recognize(
      file,
      'eng',
      { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
      if (text.trim()) {
        setInputText(text.trim());
      } else {
        setMessages(prev => [...prev, { 
          type: 'assistant', 
          text: "I couldn't extract any text from that image. You can type your question instead." 
        }]);
      }
    });
  };
  
  const playResponseAudio = (ttsText) => {
    // Remove SSML tags
    const text = ttsText.replace(/<[^>]*>/g, '');
    speak(text);
  };
  
  const handleReplayAudio = (text) => {
    playResponseAudio(text);
  };
  
  const handleSectionChange = (section) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSection(section);
      setIsTransitioning(false);
    }, 300);
  };

  /// Enhanced speech synthesis function
  const speak = (text) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-GB";
    utterance.rate = 1.0;  // Normal speaking rate
    utterance.pitch = 1.0; // Normal pitch
    
    // Get voices and set preferred voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoices = [
      "Google UK English Female",
      "Microsoft Libby Online (Natural)",
      "Samantha",
      "Victoria"
    ];
    
    // Try to find one of our preferred voices
    for (const prefVoice of preferredVoices) {
      const voice = voices.find(v => v.name === prefVoice);
      if (voice) {
        utterance.voice = voice;
        break;
      }
    }
    
    // Show a visual indicator that the app is speaking
    setIsSpeaking(true);
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // Load categories and expenses from localStorage/IndexedDB on initial render
  useEffect(() => {
    const savedCategories = JSON.parse(localStorage.getItem('categories')) || ['Food', 'Transport', 'Entertainment'];
    setCategories(savedCategories);
    loadExpenses();
  }, []);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

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
    return expense;
  };

  const updateExpense = async (expense) => {
    const db = await openDatabase();
    const tx = db.transaction("expenses", "readwrite");
    const store = tx.objectStore("expenses");
    await store.put(expense);
    await tx.done;
    return expense;
  };

  const deleteExpenseFromDB = async (id) => {
    const db = await openDatabase();
    const tx = db.transaction("expenses", "readwrite");
    const store = tx.objectStore("expenses");
    await store.delete(id);
    await tx.done;
  };

  const loadExpenses = async () => {
    try {
      const db = await openDatabase();
      const tx = db.transaction("expenses", "readonly");
      const store = tx.objectStore("expenses");
      const allExpenses = await store.getAll();
      setExpenses(allExpenses);
    } catch (error) {
      console.error("Error loading expenses:", error);
      setExpenses([]);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpenseAmount || Number(newExpenseAmount) <= 0) {
      setError('Amount must be greater than 0.');
      speak(`Amount must be greater than 0. Please try again to add ${newExpenseCategory} to the Expenses list`);
      return;
    }
    if (!newExpenseCategory.trim()) {
      setError('Category cannot be empty.');
      return;
    }

    // Validate phone if billable
    if (isBillable && !contact) {
      setError('Contact information is required for billable expenses.');
      return;
    }

    // Add the category to the list if it doesn't already exist
    if (!categories.includes(newExpenseCategory)) {
      setCategories((prevCategories) => [...prevCategories, newExpenseCategory]);
    }

    setError(''); // Clear any previous errors

    const newExpense = {
      amount: Number(newExpenseAmount),
      category: newExpenseCategory,
      date: expenseDate,
      billable: isBillable,
      contact: isBillable ? contact : null,
      dueDate: isBillable ? dueDate : null,
      reminderOn: isBillable ? reminderOn : false,
      createdAt: new Date().toISOString()
    };

    try {
      const savedExpense = await saveExpense(newExpense);
      setExpenses([...expenses, savedExpense]);

      // Reset form
      setNewExpenseAmount('');
      setNewExpenseCategory('Food');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setIsBillable(false);
      setContact('');
      setDueDate('');
      setReminderOn(true);

      setBudget(budget - newExpenseAmount);
      speak(`Expense added: ${newExpenseCategory} worth $${newExpenseAmount}. Total Remaining budget is $${budget - parseFloat(newExpenseAmount)}`);
    } catch (error) {
      console.error("Error saving expense:", error);
      setError('Failed to save expense. Please try again.');
      speak(`Failed to save expense. Please try again to add ${newExpenseCategory} worth $${newExpenseAmount} to the Expenses list`);
    }
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense) return;

    if (editingExpense.amount <= 0) {
      setError('Amount must be greater than 0.');
      speak(`Amount must be greater than 0. Please try again to add ${newExpenseCategory} to the Expenses list`);
      return;
    }

    if (!editingExpense.category.trim()) {
      setError('Category cannot be empty.');
      return;
    }

    // Validate phone if billable
    if (editingExpense.billable && !editingExpense.contact) {
      setError('Contact information is required for billable expenses.');
      return;
    }

    setError(''); // Clear any previous errors

    try {
      // Update the expense in the database
      const updatedExpense = await updateExpense(editingExpense);

      // Update the expense in the state
      setExpenses(expenses.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
      setEditingExpense(null);
    } catch (error) {
      console.error("Error updating expense:", error);
      setError('Failed to update expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpenseFromDB(id);
      setExpenses(expenses.filter(exp => exp.id !== id));
    } catch (error) {
      console.error("Error deleting expense:", error);
      setError('Failed to delete expense. Please try again.');
    }
  };

  const startEditExpense = (expense) => {
    setEditingExpense({...expense});
  };

  const cancelEdit = () => {
    setEditingExpense(null);
    setError('');
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

  // Enhanced voice command handler
  const handleVoiceCommand = () => {
    if (!isListening) {
      setIsListening(true);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-GB";
      
      recognition.onstart = () => {
        speak("Listening for commands");
      };
      
      recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        console.log("Voice command received:", command);
        
        // Process the command
        processVoiceCommand(command);
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        speak("Sorry, I didn't catch that. Please try again.");
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      speak("Voice commands stopped");
    }
  };



  // Process voice commands
  const processVoiceCommand = (command) => {
    // Add expense command
    if (command.includes('add expense') || command.includes('add an expense')) {
      // Extract amount - look for numbers
      const amountMatch = command.match(/(\d+(\.\d+)?)/);
      let amount = null;
      if (amountMatch) {
        amount = parseFloat(amountMatch[0]);
      }
      
      // Extract category - common expense categories
      const categories = ['food', 'groceries', 'rent', 'utilities', 'transport', 'entertainment', 'shopping', 'medical', 'travel'];
      let category = null;
      
      for (const cat of categories) {
        if (command.includes(cat)) {
          category = cat;
          break;
        }
      }
      
      // If we found both amount and category
      if (amount && category) {
        setNewExpenseAmount(amount);
        setNewExpenseCategory(category);
        speak(`Adding ${category} expense for $${amount}`);
        handleAddExpense();
      } else if (amount) {
        speak(`What category is the $${amount} expense for?`);
        setNewExpenseAmount(amount);
        // Activate follow-up mode
        listenForCategory();
      } else if (category) {
        speak(`How much is the ${category} expense?`);
        setNewExpenseCategory(category);
        // Activate follow-up mode
        listenForAmount();
      } else {
        speak("Please specify an amount and category for the expense");
      }
    }
    
    // Read budget command
    else if (command.includes('what is my budget') || command.includes('check budget') || command.includes('budget remaining')) {
      speak(`Your remaining budget is $${budget.toFixed(2)}`);
    }
    
    // Read recent expenses command
    else if (command.includes('recent expenses') || command.includes('last expenses')) {
      if (expenses.length > 0) {
        const recentExpenses = expenses.slice(-3); // Get last 3 expenses
        speak(`Your most recent expenses are: ${recentExpenses.map(exp => 
          `$${exp.amount} for ${exp.category}`).join(', ')}`);
      } else {
        speak("You don't have any expenses recorded yet");
      }
    }
    
    // Help command
    else if (command.includes('help') || command.includes('what can you do')) {
      speak("You can say: add expense, check budget, or recent expenses");
    }
    
    // Unknown command
    else {
      speak("Sorry, I didn't understand that command. Try saying add expense, check budget, or recent expenses");
    }
  };

  // Listen for category after amount is provided
  const listenForCategory = () => {
    setIsListening(true);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript.toLowerCase();
      // Filter out common words to extract just the category
      const words = result.split(' ');
      let category = result;
      
      if (words.length > 1) {
        // Try to extract just the category name
        const filteredWords = words.filter(word => 
          !['the', 'a', 'an', 'for', 'is', 'my', 'it', 'was'].includes(word));
        if (filteredWords.length > 0) {
          category = filteredWords[0];
        }
      }
      
      setNewExpenseCategory(category);
      speak(`Adding ${category} expense for $${newExpenseAmount}`);
      handleAddExpense();
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  // Listen for amount after category is provided
  const listenForAmount = () => {
    setIsListening(true);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript.toLowerCase();
      // Try to extract just the number
      const amountMatch = result.match(/(\d+(\.\d+)?)/);
      
      if (amountMatch) {
        const amount = parseFloat(amountMatch[0]);
        setNewExpenseAmount(amount);
        speak(`Adding ${newExpenseCategory} expense for $${amount}`);
        handleAddExpense();
      } else {
        speak("Sorry, I couldn't understand the amount. Please try again.");
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const budgetSection = (
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

      {/* Add Expenses Form */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4">Add New Expense</h3>
        
        {/* Expense Form */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
                placeholder="Amount"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              {isCustomCategory ? (
                <input
                  type="text"
                  value={newExpenseCategory}
                  onChange={(e) => setNewExpenseCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Custom Category"
                />
              ) : (
                <select
                  value={newExpenseCategory}
                  onChange={(e) => setNewExpenseCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            
            <div className="flex-1">
              <button
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="mt-6 bg-gray-200 text-gray-700 w-full px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                {isCustomCategory ? 'Select Category' : 'Custom Category'}
              </button>
            </div>
          </div>
          
          {/* Billable Expenses Toggle */}
          <div className="mt-4">
            <div className="flex items-center">
              <input
                id="billable-toggle"
                type="checkbox"
                checked={isBillable}
                onChange={(e) => setIsBillable(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="billable-toggle" className="ml-2 block text-sm font-medium text-gray-700">
                This is a billable expense
              </label>
            </div>
          </div>
          
          {/* Billable Expense Fields */}
          {isBillable && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Contact phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="reminder-toggle"
                  type="checkbox"
                  checked={reminderOn}
                  onChange={(e) => setReminderOn(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="reminder-toggle" className="ml-2 block text-sm font-medium text-gray-700">
                  Set reminder
                </label>
              </div>
            </div>
          )}
          
          {error && (
            <div className="text-red-600 text-sm mt-2">
              {error}
            </div>
          )}
          
          <button
            onClick={handleAddExpense}
            className="w-full mt-4 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Edit Expense Form */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Expense</h3>
              <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={editingExpense.amount}
                  onChange={(e) => setEditingExpense({...editingExpense, amount: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Amount"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={editingExpense.category}
                  onChange={(e) => setEditingExpense({...editingExpense, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={editingExpense.date}
                  onChange={(e) => setEditingExpense({...editingExpense, date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              
              <div>
                <div className="flex items-center">
                  <input
                    id="edit-billable-toggle"
                    type="checkbox"
                    checked={editingExpense.billable}
                    onChange={(e) => setEditingExpense({...editingExpense, billable: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-billable-toggle" className="ml-2 block text-sm font-medium text-gray-700">
                    This is a billable expense
                  </label>
                </div>
              </div>
              
              {editingExpense.billable && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={editingExpense.contact || ''}
                      onChange={(e) => setEditingExpense({...editingExpense, contact: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2"
                      placeholder="Contact phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={editingExpense.dueDate || ''}
                      onChange={(e) => setEditingExpense({...editingExpense, dueDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="edit-reminder-toggle"
                      type="checkbox"
                      checked={editingExpense.reminderOn}
                      onChange={(e) => setEditingExpense({...editingExpense, reminderOn: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit-reminder-toggle" className="ml-2 block text-sm font-medium text-gray-700">
                      Set reminder
                    </label>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="text-red-600 text-sm mt-2">
                  {error}
                </div>
              )}
              
              <div className="flex gap-2 mt-6">
                <button
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateExpense}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Expenses List */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4">Recent Expenses</h3>
        {expenses.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No expenses added yet.</p>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={startEditExpense}
                onDelete={handleDeleteExpense}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const quizSection = (
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
  );



  // Chat interface
  const chatSection = (
    <div className="bg-white rounded-lg p-4 shadow-md h-[calc(100vh-200px)] flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-700">Financial Assistant</h3>
          <div className="flex space-x-2">
            <select 
              className="text-sm border rounded p-1 bg-gray-50"
              value={responseQuality}
              onChange={(e) => setResponseQuality(e.target.value)}
            >
              <option value="concise">Concise</option>
              <option value="detailed">Detailed</option>
              <option value="factual">Factual</option>
            </select>
          </div>
        </div>
      </div>
      
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4 space-y-4 p-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.type === 'user'
                ? 'bg-blue-100 ml-auto'
                : 'bg-gray-100'
            }`}
          >
            <div className="flex flex-col">
              <span>{msg.text}</span>
              {msg.type === 'assistant' && msg.ttsResponse && (
                <button 
                  onClick={() => handleReplayAudio(msg.ttsResponse)}
                  className="self-end mt-1 text-blue-600 hover:text-blue-800"
                  aria-label="Play audio response"
                >
                  <Volume2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>
      
      {imagePreview && (
        <div className="relative mb-2 max-w-xs">
          <img src={imagePreview} alt="Preview" className="rounded-lg border max-h-24 object-contain" />
          <button 
            onClick={() => setImagePreview(null)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="flex gap-2 items-center">
        <button 
          onClick={() => fileInputRef.current.click()}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          aria-label="Upload image"
        >
          <Image size={20} />
        </button>
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleImageUpload}
        />
        
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about your finances..."
          className="flex-1 border border-gray-300 rounded-lg p-3"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        
        <button 
          onClick={handleVoiceCommand}
          className={`p-2 ${isListening ? 'text-red-500' : 'text-gray-500'} hover:bg-gray-100 rounded-full`}
          aria-label={isListening ? 'Stop recording' : 'Start recording'}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        
        <button 
          onClick={handleSendMessage}
          disabled={!inputText.trim() && !imagePreview}
          className={`p-2 rounded-full ${
            !inputText.trim() && !imagePreview 
              ? 'text-gray-400 bg-gray-100' 
              : 'text-white bg-blue-600 hover:bg-blue-700'
          }`}
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );

  const sections = {
    budget: budgetSection,
    quiz: quizSection,
    chat: chatSection
  };
 

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-blue-800">FinanceWise</h1>
        <p className="text-gray-600">Smart financial management for everyone</p>
      </header>
      
      <main className={`max-w-4xl mx-auto transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {activeSection === 'welcome' ? (
          <div className="text-center py-12">
            <div className="opacity-0 animate-fade-in transform translate-y-4 transition-all duration-700 ease-out" style={{ animationFillMode: 'forwards' }}>
              <h2 className="text-4xl font-bold text-blue-800 mb-6">Welcome to FinanceWise</h2>
              <p className="text-xl text-gray-600 mb-12 max-w-xl mx-auto">Your journey to financial literacy and smart money management starts here.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-8">
              <div className="opacity-0 animate-fade-in transform translate-y-4 transition-all duration-700 ease-out" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                <button
                  onClick={() => handleSectionChange('budget')}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all flex flex-col items-center w-full"
                >
                  <div className="bg-blue-100 p-4 rounded-full mb-4">
                    <DollarSign size={32} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Budget & Expenses</h3>
                  <p className="text-gray-500 text-sm">Manage your money and track spending</p>
                </button>
              </div>
              
              <div className="opacity-0 animate-fade-in transform translate-y-4 transition-all duration-700 ease-out" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
                <button
                  onClick={() => handleSectionChange('quiz')}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all flex flex-col items-center w-full"
                >
                  <div className="bg-green-100 p-4 rounded-full mb-4">
                    <BookOpen size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Financial Quiz</h3>
                  <p className="text-gray-500 text-sm">Test your knowledge and earn badges</p>
                </button>
              </div>
              
              <div className="opacity-0 animate-fade-in transform translate-y-4 transition-all duration-700 ease-out" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
                <button
                  onClick={() => handleSectionChange('chat')}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all flex flex-col items-center w-full"
                >
                  <div className="bg-purple-100 p-4 rounded-full mb-4">
                    <MessageCircle size={32} className="text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Finance Chat</h3>
                  <p className="text-gray-500 text-sm">Get answers to your money questions</p>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Section
            title={
              activeSection === 'budget'
                ? 'Budget & Expenses'
                : activeSection === 'quiz'
                ? 'Financial Quiz'
                : 'Finance Chat'
            }
            isVisible={true}
            onBack={() => handleSectionChange('welcome')}
          >
            {sections[activeSection]}
          </Section>
        )}
      </main>
      
      {/* Floating Action Button for Voice Commands with status indicator */}
      {activeSection !== 'welcome' && (
        <div className="fixed bottom-8 right-8 z-10">
          <div className="relative">
            <FloatingActionButton
              icon={isListening ? <MicOff size={24} /> : <Mic size={24} />}
              onClick={handleVoiceCommand}
              active={isListening}
              label={isListening ? "Listening..." : "Voice command"}
              className={`${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500'} shadow-lg`}
            />
            {isListening && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-1 rounded-full text-sm whitespace-nowrap">
                Listening...
              </div>
            )}
            {isSpeaking && (
              <div className="absolute -top-8 right-12 bg-blue-500 rounded-full h-3 w-3 animate-ping"></div>
            )}
          </div>
        </div>
      )}
      
      
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-white bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white border border-gray-300 rounded-xl p-8 max-w-lg mx-4">
            <h3 className="text-2xl font-bold mb-4">Welcome to FinanceWise!</h3>
            <p className="mb-6">
              This app will help you manage your finances, track expenses, learn financial concepts, and get personalized advice.
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-4">
                  <DollarSign size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Budget & Expenses</h4>
                  <p className="text-sm text-gray-600">Set budgets and track all your expenses</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-4">
                  <BookOpen size={20} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Financial Quiz</h4>
                  <p className="text-sm text-gray-600">Test your knowledge and earn badges</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-100 p-2 rounded-full mr-4">
                  <MessageCircle size={20} className="text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Finance Chat</h4>
                  <p className="text-sm text-gray-600">Ask questions and get personalized advice</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowTutorial(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
};