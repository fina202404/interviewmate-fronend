// src/components/ResumeUpload.jsx
import React, { useState, useContext } from 'react';
// Import App from antd to use the useApp hook
// Spin removed from this import line as it's no longer used directly
import { Upload, Button, Typography, Card, Divider, List, App as AntdApp, Alert } from 'antd';
import { UploadOutlined, FilePdfOutlined } from '@ant-design/icons';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const { Text, Paragraph, Title } = Typography;

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const { API_URL, token } = useContext(AuthContext);
  const { message: antdMessageHook } = AntdApp.useApp();

  const props = {
    beforeUpload: (newFile) => {
      const isPDF = newFile.type === 'application/pdf';
      if (!isPDF) {
        antdMessageHook.error('Only PDF files are allowed.');
        return Upload.LIST_IGNORE;
      }
      setFile(newFile);
      setFeedback(null);
      return false;
    },
    onRemove: () => {
        setFile(null);
        setFeedback(null);
    },
    fileList: file ? [file] : [],
    maxCount: 1,
  };

  const handleUpload = async () => {
    if (!file) {
      antdMessageHook.warning('Please select a resume to analyze.');
      return;
    }
    const formData = new FormData();
    formData.append('resume', file);
    setLoading(true);
    setFeedback(null);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      };
      const res = await axios.post(`${API_URL}/resume/analyze`, formData, config);
      
      setFeedback(res.data);
      if (res.data.success) {
        antdMessageHook.success('Resume analyzed successfully!');
      } else {
        antdMessageHook.error(res.data.message || 'Resume analysis returned an issue.');
      }
    } catch (err) {
      console.error("Resume Upload AxiosError:", err.response?.data || err.message || err);
      const errorMessage = err.response?.data?.message || 'Resume analysis failed. Please try again.';
      antdMessageHook.error(errorMessage);
      setFeedback({ success: false, message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={<><FilePdfOutlined style={{ marginRight: 8 }} /> Resume Upload & Analysis</>}
      style={{ marginTop: '2rem' }}
      variant="outlined"
    >
      <Paragraph type="secondary">
        Upload your resume in PDF format. Our AI will analyze it and provide feedback on its content and structure to help you improve it for job applications.
      </Paragraph>
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Click to Select PDF</Button>
      </Upload>

      <Button
        type="primary"
        onClick={handleUpload}
        loading={loading}
        disabled={!file || loading}
        style={{ marginTop: 16 }}
      >
        {loading ? 'Analyzing...' : 'Analyze Resume'}
      </Button>

      {feedback && (
        <div style={{ marginTop: 32 }}>
          <Divider />
          <Title level={5} style={{marginBottom: 16}}>Analysis Results for: {feedback.fileName || file?.name}</Title>
          
          {feedback.success ? (
            <>
              <Paragraph strong>Extracted Text Snippet:</Paragraph>
              <Card size="small" style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: 16, whiteSpace: 'pre-wrap' }}>
                <Text type="secondary">{feedback.extractedText || 'Could not extract text or text is empty.'}</Text>
              </Card>

              <Paragraph strong>Suggestions:</Paragraph>
              {feedback.suggestions && feedback.suggestions.length > 0 ? (
                <List
                  size="small"
                  bordered
                  dataSource={feedback.suggestions}
                  renderItem={(item, index) => <List.Item>{index + 1}. {item}</List.Item>}
                />
              ) : (
                <Text type="secondary">No specific suggestions provided at this time.</Text>
              )}
            </>
          ) : (
            <Alert message={feedback.message || "Analysis failed to produce results."} type="error" showIcon />
          )}
        </div>
      )}
    </Card>
  );
};

export default ResumeUpload;  