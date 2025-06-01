// frontend/src/InterviewPage.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Input, Button, Card, Typography, Steps, Tabs, message, Row, Col, Space, Divider, Spin } from 'antd'; // Layout removed
import {
    AudioOutlined, AudioMutedOutlined, VideoCameraOutlined, StopOutlined,
    SendOutlined, RedoOutlined, ReadOutlined, HistoryOutlined, RiseOutlined, FilePdfOutlined
} from '@ant-design/icons'; // Added new icons for tabs
import axios from 'axios';
import Webcam from 'react-webcam';
import Lottie from 'react-lottie-player';
import robotAnimation from './assets/robot-talking.json';
import AuthContext from './context/AuthContext';
import './InterviewPage.css';

// Import the new components (assuming they are placed in src/components/)
import ProgressTracker from './components/ProgressTracker';
import InterviewHistory from './components/InterviewHistory';
import ResumeUpload from './components/ResumeUpload';

const { Title, Paragraph, Text } = Typography;
const { Search, TextArea } = Input;
// TabPane is deprecated, Tabs will use 'items' prop
// const { TabPane } = Tabs;

const speakText = (text) => {
  if ('speechSynthesis' in window && !speechSynthesis.speaking) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  } else if (speechSynthesis.speaking) {
    console.warn("SpeechSynthesis is already speaking.");
  }
};

const InterviewPage = () => {
  const [currentJobTitleForInterview, setCurrentJobTitleForInterview] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(true); // For AI Avatar tab
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const webcamRef = useRef(null); // For AI Avatar tab
  const { token, API_URL } = useContext(AuthContext);

  useEffect(() => {
    const speech = speechSynthesis;
    const onSpeakStart = () => setIsSpeaking(true);
    const onSpeakEnd = () => setIsSpeaking(false);

    speech.addEventListener('start', onSpeakStart);
    speech.addEventListener('end', onSpeakEnd);

    return () => {
      speech.removeEventListener('start', onSpeakStart);
      speech.removeEventListener('end', onSpeakEnd);
      if (speech.speaking) speech.cancel();
      if (recognitionRef.current && typeof recognitionRef.current.stop === 'function') {
        try {
            recognitionRef.current.stop();
        } catch(e) {
            console.warn("Error stopping recognition on unmount:", e);
        }
      }
    };
  }, []);

  const fetchQuestions = async (title) => {
    if (!title.trim()) {
      message.warning('Please enter a job title');
      return;
    }
    setQuestionLoading(true);
    setCurrentJobTitleForInterview(title);
    setQuestions([]);
    setFeedback(null);
    setCurrentIndex(0);
    setAnswer('');
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.post(`${API_URL}/get-questions`, { jobTitle: title }, config);
      if (res.data && res.data.questions && Array.isArray(res.data.questions)) {
        setQuestions(res.data.questions);
        speakText(`Welcome to your mock interview for the role of ${title}. Let's begin.`);
        if (res.data.questions.length > 0) {
          setTimeout(() => speakText(res.data.questions[0]), 3000); // Delay for welcome
        }
      } else {
        message.error('Received invalid question data from server.');
        setQuestions([]);
      }
    } catch (err) {
      console.error("Fetch questions error:", err);
      message.error(err.response?.data?.message || 'Failed to fetch questions.');
      setQuestions([]);
    } finally {
      setQuestionLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      message.warning('Please provide an answer.');
      return;
    }
    setAnswerLoading(true);
    setFeedback(null);
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const questionAsked = questions[currentIndex];
      const res = await axios.post(`${API_URL}/analyze`, { question: questionAsked, answer }, config);
      
      const currentFeedback = res.data; // Assuming res.data is { clarity, relevance, suggestions }
      setFeedback(currentFeedback);

      // Save to localStorage for ProgressTracker and InterviewHistory
      const newSessionEntry = {
        job: currentJobTitleForInterview,
        question: questionAsked,
        answer: answer,
        clarity: currentFeedback.clarity || 0,
        relevance: currentFeedback.relevance || 0,
        score: (currentFeedback.clarity || 0) + (currentFeedback.relevance || 0), // Example score
        suggestions: currentFeedback.suggestions || [],
        date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
      };

      const existingProgress = JSON.parse(localStorage.getItem('interviewProgress')) || [];
      localStorage.setItem('interviewProgress', JSON.stringify([...existingProgress, newSessionEntry]));
      
      // Update simple completion counter (optional, as ProgressTracker calculates level now)
      const completed = Number(localStorage.getItem('interviewsCompleted') || 0);
      localStorage.setItem('interviewsCompleted', completed + 1);

      speakText("Feedback received. Check the feedback card.");
    } catch (err) {
      console.error("Submit answer error:", err);
      message.error(err.response?.data?.message || 'Failed to analyze answer.');
    } finally {
      setAnswerLoading(false);
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      setAnswer('');
      setFeedback(null);
      speakText(questions[nextIndex]);
    } else {
      message.success('You have completed all questions for this session!');
      speakText("Congratulations! You've completed all questions for this session.");
      // Optionally reset job title here or let user do it via "Finish & Start New"
    }
  };

  const startVoiceInput = () => {
    // ... (startVoiceInput logic remains the same as your provided file)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      message.error('Your browser does not support Speech Recognition.');
      return;
    }

    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Error stopping recognition:", e);
      }
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.interimResults = true;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      message.info('Listening... Speak your answer.');
    };

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setAnswer(finalTranscript || interimTranscript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Voice recognition error:", event);
      message.error(`Voice recognition error: ${event.error}. Please ensure microphone access is allowed.`);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Voice start error:', err);
      message.error('Could not start voice recognition. Please check microphone permissions.');
      setIsRecording(false);
    }
  };

  const renderInterviewControls = () => (
    // ... (this function's content remains the same, ensure Cards use variant="outlined" or variant="borderless")
    // Example Card change:
    // <Card variant="outlined" title={<Text ...>} ... >
    <>
      {questions.length > 0 && currentIndex < questions.length && (
        <>
          <Card
            variant="outlined" // Updated from implicit bordered
            title={<Text style={{ fontSize: '1.2em' }}>Question {currentIndex + 1} of {questions.length}</Text>}
            style={{ marginBottom: '1.5rem', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
            actions={[
              <Button key="repeat" icon={<ReadOutlined />} onClick={() => speakText(questions[currentIndex])} disabled={isSpeaking}>
                Repeat Question
              </Button>,
            ]}
          >
            <Paragraph style={{ fontSize: '1.1em', minHeight: '50px' }}>{questions[currentIndex]}</Paragraph>
          </Card>

          <TextArea
            rows={6}
            placeholder="Type your answer here, or use the voice input..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={{ marginBottom: '1rem', fontSize: '1.05em' }}
          />
          <Space wrap style={{ marginBottom: '1.5rem' }}>
            <Button
              type={isRecording ? "default" : "dashed"}
              icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
              onClick={startVoiceInput}
              danger={isRecording}
            >
              {isRecording ? 'Stop Listening' : 'Speak Answer'}
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={submitAnswer}
              loading={answerLoading}
              disabled={!answer.trim() || isRecording}
            >
              Submit Answer
            </Button>
          </Space>

          {answerLoading && <Spin /* tip removed to address warning */ style={{display: 'block', marginBottom: '1rem'}}/>}

          {feedback && (
            <Card variant="outlined" title="AI Feedback" style={{ marginTop: '1rem', marginBottom: '1.5rem', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
              <Paragraph><strong>Clarity:</strong> <Text mark>{feedback.clarity}/10</Text></Paragraph>
              <Paragraph><strong>Relevance:</strong> <Text mark>{feedback.relevance}/10</Text></Paragraph>
              <Paragraph strong>Suggestions:</Paragraph>
              <ul>
                {feedback.suggestions.map((s, i) => <li key={i}><Text>{s}</Text></li>)}
              </ul>
            </Card>
          )}

          {currentIndex < questions.length -1 && feedback && !answerLoading && (
            <Button type="default" size="large" onClick={handleNext} block icon={<RedoOutlined />}>
              Next Question
            </Button>
          )}
          {currentIndex === questions.length -1 && feedback && !answerLoading && (
             <Button type="primary" size="large" onClick={() => {
                speakText("Congratulations on completing the interview! You can review your summary or start a new session.");
                setCurrentJobTitleForInterview('');
                setQuestions([]);
                setFeedback(null);
                setCurrentIndex(0);
                setAnswer('');
             }} block>
              Finish & Start New Interview
            </Button>
          )}
        </>
      )}
       {questions.length > 0 && currentIndex >= questions.length && (
        <Card variant="outlined" style={{ textAlign: 'center', padding: '2rem' }}>
          <Title level={3}>Interview Session Complete!</Title>
          <Paragraph>You've answered all questions for {currentJobTitleForInterview}.</Paragraph>
          <Button type="primary" onClick={() => {
            setCurrentJobTitleForInterview('');
            setQuestions([]);
            setFeedback(null);
            setCurrentIndex(0);
            setAnswer('');
          }}>Start New Interview Session</Button>
        </Card>
      )}
    </>
  );

  // Content for AI Avatar Tab
  const AiAvatarTabContent = () => (
    <>
      <Row gutter={[16, 16]} align="middle" justify="center" style={{ marginBottom: '1.5rem' }}>
        <Col xs={24} md={10} style={{ textAlign: 'center' }}>
          {cameraOn && <Webcam ref={webcamRef} audio={false} style={{ width: '100%', maxWidth: 320, borderRadius: 8, border: '1px solid #f0f0f0' }} />}
          <Button
            icon={cameraOn ? <StopOutlined /> : <VideoCameraOutlined />}
            onClick={() => setCameraOn((prev) => !prev)}
            style={{ marginTop: '1rem', display: 'block', margin: '1rem auto 0' }}
          >
            {cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
          </Button>
        </Col>
        <Col xs={24} md={8} style={{ textAlign: 'center' }}>
          <Lottie loop play animationData={robotAnimation} style={{ width: 200, margin: '0 auto' }} />
          {isSpeaking && <div className="speaking-indicator">AI is speaking...</div>}
        </Col>
      </Row>
      {renderInterviewControls()}
    </>
  );

  // Define items for the Tabs component
  const tabItems = [
    {
      key: 'voice',
      label: (<span><AudioOutlined /> Voice Interview</span>),
      children: renderInterviewControls(),
    },
    {
      key: 'ai',
      label: (<span>🤖 AI Avatar Interview</span>),
      children: <AiAvatarTabContent />,
    },
    {
      key: 'history',
      label: (<span><HistoryOutlined /> History</span>),
      children: <InterviewHistory />,
    },
    {
      key: 'progress',
      label: (<span><RiseOutlined /> Progress</span>),
      children: <ProgressTracker />, // Use the imported ProgressTracker
    },
    {
      key: 'resume',
      label: (<span><FilePdfOutlined /> Resume Analysis</span>),
      children: <ResumeUpload />,
    },
  ];


  return (
    <Row justify="center">
      <Col xs={24} sm={22} md={20} lg={18} xl={16}>
        <Card variant="outlined" style={{ boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}> {/* Main page card */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Title level={2} style={{ color: token?.colorPrimary }}>🎯 InterviewMate Simulator</Title>
            <Paragraph type="secondary">Practice your interview skills with AI-driven questions and feedback.</Paragraph>
          </div>

          {/* ProgressTracker can be a global one here, or specific to a tab - using the one from new components */}
          {/* <ProgressTracker /> */} 
          <Divider />

          {!currentJobTitleForInterview && !questionLoading && (
            <Card variant="borderless" style={{ marginBottom: '2rem', textAlign: 'center' }}> {/* Get Started Card */}
              <Title level={4}>Get Started</Title>
              <Paragraph>Enter a job title below to generate tailored interview questions.</Paragraph>
              <Search
                placeholder="Enter job title (e.g. Frontend Developer)"
                enterButton="Generate Questions"
                size="large"
                onSearch={fetchQuestions}
                loading={questionLoading}
                style={{ maxWidth: 600, margin: '0 auto' }}
              />
            </Card>
          )}
          
          {questionLoading && <div style={{textAlign: 'center', padding: '2rem'}}><Spin size="large" /* tip removed */ /></div>}

          {currentJobTitleForInterview && questions.length > 0 && (
              <Title level={4} style={{textAlign: 'center', marginBottom: '1rem'}}>Interview for: <Text strong>{currentJobTitleForInterview}</Text></Title>
          )}

          {questions.length > 0 && (
            <Steps
              current={currentIndex}
              size="small"
              style={{ margin: '2rem 0' }}
              items={questions.map((q, i) => ({ title: `Q${i + 1}` }))}
              responsive
            />
          )}

          {/* Using items prop for Tabs */}
          <Tabs
            defaultActiveKey="voice"
            centered
            type="card" // You can also use "line" type
            items={tabItems}
            style={{ marginTop: currentJobTitleForInterview ? '1rem' : '0' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default InterviewPage;