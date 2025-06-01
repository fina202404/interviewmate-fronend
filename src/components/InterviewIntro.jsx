import React from 'react'; // Removed useState as it's not used here
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Lottie from 'react-lottie-player';
// Ensure this path is correct based on your project structure
// If assets are in public folder, path might be different or handled by public URL
import welcomeAnimation from '../assets/interview-welcome.json'; 
// Make sure your bg.mp4 is in the public folder (e.g., public/bg.mp4)
// The path in <source src="/bg.mp4" /> assumes it's served from the root of your public folder.

const { Title, Paragraph } = Typography;

const InterviewIntro = () => {
  const navigate = useNavigate(); // Initialize navigate

  const handleStartInterview = () => {
    navigate('/login'); // Navigate to the login page
  };

  return (
    <div className="intro-container"> {/* Ensure this class matches your CSS for full-page video */}
      <video autoPlay muted loop className="bg-video">
        {/* The path /bg.mp4 assumes bg.mp4 is in your `public` folder */}
        <source src={process.env.PUBLIC_URL + '/bg.mp4'} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="overlay-content"> {/* Ensure this class matches your CSS */}
        <Lottie
          loop
          play
          animationData={welcomeAnimation}
          style={{ width: 'clamp(150px, 20vw, 300px)', margin: '0 auto 1rem auto' }} // Responsive width
        />
        <Title level={2} style={{ color: '#fff', marginBottom: '0.5rem' }}>Welcome to InterviewMate</Title>
        <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
          Simulate AI-powered interviews with feedback and real-time insights.
        </Paragraph>
        <Button type="primary" size="large" onClick={handleStartInterview} style={{paddingLeft: 30, paddingRight: 30, height: 50, fontSize: '1.1rem'}}>
          Start Interview
        </Button>
      </div>
    </div>
  );
};

export default InterviewIntro;

