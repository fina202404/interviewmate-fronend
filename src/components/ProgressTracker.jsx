import React, { useEffect, useState } from 'react';
import { Card, Progress, Typography, Tag, Button } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const { Title, Paragraph } = Typography;

const getRank = (level) => {
  if (level >= 10) return ' Elite Interviewee';
  if (level >= 5) return ' Rising Star';
  if (level >= 1) return ' Beginner';
  return ' Newbie';
};

const ProgressTracker = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('interviewProgress')) || [];
    setSessions(stored);
  }, []);

  const getXP = () => sessions.reduce((acc, s) => acc + (s.clarity + s.relevance), 0);
  const getLevel = () => Math.floor(getXP() / 100);
  const nextLevelXP = (getLevel() + 1) * 100;
  const currentXP = getXP();
  const progressPercent = ((currentXP % 100) / 100) * 100;

  const resetProgress = () => {
    localStorage.removeItem('interviewProgress');
    setSessions([]);
  };

  return (
    <Card title="🎮 Progress Tracker" style={{ marginTop: '2rem' }}>
      <Title level={4}>
        Level: {getLevel()} <Tag color="blue">{getRank(getLevel())}</Tag>
      </Title>
      <Paragraph>XP: {currentXP} / {nextLevelXP}</Paragraph>
      <Progress percent={progressPercent} status="active" />

      {sessions.length > 0 && (
        <>
          <div style={{ marginTop: '2rem' }}>
            <Title level={5}>Session Performance</Title>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sessions} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="job" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clarity" stackId="a" fill="#1890ff" />
                <Bar dataKey="relevance" stackId="a" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Button onClick={resetProgress} danger style={{ marginTop: '1rem' }}>
            Reset Progress
          </Button>
        </>
      )}
    </Card>
  );
};

export default ProgressTracker;
