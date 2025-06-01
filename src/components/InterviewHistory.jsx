// src/components/InterviewHistory.jsx
import React, { useEffect, useState } from 'react';
import { Card, Typography, List, Button } from 'antd';
import jsPDF from 'jspdf';

const { Title } = Typography;

const InterviewHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('interviewProgress')) || [];
    setHistory(stored);
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Interview History Report', 20, 20);

    history.forEach((session, i) => {
      const y = 30 + i * 30;
      doc.setFontSize(12);
      doc.text(`Job: ${session.job}`, 20, y);
      doc.text(`Score: ${session.score}`, 20, y + 10);
      doc.text(`Date: ${session.date || 'N/A'}`, 20, y + 20);
    });

    doc.save('interview_history.pdf');
  };

  return (
    <Card title=" Interview History" style={{ marginTop: '2rem' }}>
      <Title level={5}>Your Past Interviews</Title>
      <List
        itemLayout="horizontal"
        dataSource={history}
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              title={`Interview for ${item.job}`}
              description={`Score: ${item.score} | Date: ${item.date || 'N/A'}`}
            />
          </List.Item>
        )}
      />
      {history.length > 0 && (
        <Button type="primary" style={{ marginTop: '1rem' }} onClick={downloadPDF}>
          Download as PDF
        </Button>
      )}
    </Card>
  );
};

export default InterviewHistory;
